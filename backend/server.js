import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import dotenv from 'dotenv';
import { analyzeDocumentImages, answerDocumentQuestion, getAiProviderInfo } from './services/aiProvider.js';
import { detectMimeFromMagicBytes, ALLOWED_MIME_TYPES } from './utils/fileValidation.js';
import { safeLog } from './utils/logger.js';
import { askQuestionSchema, createTicketSchema } from './schemas/documentSchema.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Suporte a proxy reverso seguro (Nginx, Render, Railway, etc.) para rate-limiting correto
app.set('trust proxy', 1);

// 1. Cabeçalhos de Segurança HTTP com Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Desativado para permitir consumo direto da API REST
  })
);

// 2. Configuração restrita do CORS (Origens confiáveis do frontend)
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173'
];

const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (como chamadas locais do terminal, curl ou same-origin)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        safeLog.security(`Bloqueio de CORS para origem não autorizada: ${origin}`);
        callback(new Error('Origem não permitida pela política de segurança CORS.'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// 3. Rate Limiters (Proteção contra abuso de requisições e sobrecarga de cota)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 120, // Limite geral de 120 requisições a cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Muitas requisições originadas deste endereço de IP. Por favor, aguarde alguns minutos.'
  }
});
app.use('/api/', globalLimiter);

// Limiter estrito para rotas que invocam IA do Gemini (evita abuso e exaustão de cota)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 chamadas de IA por IP a cada 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Limite de análises com Inteligência Artificial temporariamente atingido. Por favor, aguarde alguns minutos.'
  }
});

app.use(express.json({ limit: '1mb' }));

// 4. Configuração de upload seguro em memória (Privacidade: dados NUNCA são salvos em disco)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite máximo estrito de 10MB por arquivo
    files: 4 // Máximo de 4 arquivos (ex: frente e verso de 2 páginas)
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

    if (isImage || isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Por favor, envie uma foto (JPG, PNG, WEBP) ou arquivo PDF do documento.'));
    }
  }
});

// Endpoint de verificação de status e saúde
app.get('/api/health', async (req, res) => {
  const providerInfo = await getAiProviderInfo();
  const isProd = process.env.NODE_ENV === 'production';

  res.json({
    status: 'online',
    service: 'Tradutor de Burocracia & Saúde API',
    provider: providerInfo.configuredProvider,
    geminiKeyConfigured: providerInfo.geminiKeyConfigured,
    geminiModel: providerInfo.geminiModel,
    localAi: {
      isOnline: providerInfo.localAi?.isOnline || false,
      model: providerInfo.localAi?.model || null,
      ...(isProd ? {} : { url: providerInfo.localAi?.url })
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint principal: Análise Multimodal de Documentos com Validação de Magic Bytes
app.post(
  '/api/analyze-document',
  aiLimiter,
  upload.fields([
    { name: 'documents', maxCount: 4 },
    { name: 'document', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Coleta todos os arquivos enviados
      const rawFiles = [];
      if (req.files) {
        if (Array.isArray(req.files)) {
          rawFiles.push(...req.files);
        } else {
          if (req.files.documents) rawFiles.push(...req.files.documents);
          if (req.files.document) rawFiles.push(...req.files.document);
        }
      } else if (req.file) {
        rawFiles.push(req.file);
      }

      if (rawFiles.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma foto ou arquivo de documento foi enviado.'
        });
      }

      // Validação estrita por MAGIC BYTES reais de cada arquivo enviado
      const validFiles = [];
      let totalBytes = 0;

      for (const file of rawFiles) {
        const detectedMime = detectMimeFromMagicBytes(file.buffer);

        if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
          safeLog.security(
            `Arquivo rejeitado por assinatura inválida de magic bytes: ${safeLog.sanitizeFilename(file.originalname)}`
          );
          return res.status(400).json({
            success: false,
            error: `O arquivo enviado possui assinatura binária inválida. Apenas fotos (JPG, PNG, WEBP) e documentos PDF autênticos são aceitos.`
          });
        }

        totalBytes += file.size;
        validFiles.push({
          buffer: file.buffer,
          mimeType: detectedMime, // Substitui pelo MIME real verificado por bytes (evita MIME spoofing)
          originalname: safeLog.sanitizeFilename(file.originalname),
          size: file.size
        });
      }

      // LGPD: Log sanitizado sem expor nomes de pessoas ou conteúdos de documentos
      safeLog.info(
        `Recebido(s) ${validFiles.length} arquivo(s) para análise [${(totalBytes / 1024).toFixed(1)} KB total]`
      );

      const startedAt = Date.now();
      const analysis = await analyzeDocumentImages({
        files: validFiles
      });
      const processingMs = Date.now() - startedAt;

      analysis.meta = {
        ...(analysis.meta || {}),
        tempoProcessamentoMs: processingMs,
        bytesRecebidos: totalBytes,
        arquivos: validFiles.length
      };

      // LGPD: Registra apenas o tipo genérico de documento processado
      safeLog.info(
        `Análise concluída com sucesso para categoria: "${analysis.categoria || 'Geral'}"`
      );

      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      safeLog.error('Falha ao analisar documento', error.message);

      const isApiKeyError = error.message && error.message.includes('GEMINI_API_KEY');
      let friendlyError = error.message || 'Ocorreu um erro ao processar o seu documento. Tente novamente.';
      if (friendlyError.startsWith('{') && friendlyError.includes('"message"')) {
        try {
          const parsed = JSON.parse(friendlyError);
          friendlyError = parsed.error?.message || friendlyError;
        } catch (_) {}
      }
      if (friendlyError.includes('INTERNAL') || friendlyError.includes('Internal error')) {
        friendlyError = 'Os servidores da IA tiveram uma instabilidade momentânea. Por favor, tente enviar novamente em instantes.';
      }

      return res.status(isApiKeyError ? 401 : 500).json({
        success: false,
        error: isApiKeyError
          ? 'Chave de API do Gemini não configurada no servidor.'
          : friendlyError
      });
    }
  }
);

// Endpoint secundário: Tira-Dúvidas com IA sobre o Documento
app.post('/api/ask-question', aiLimiter, async (req, res) => {
  try {
    // Validação estrita do payload (C5: Prevenção contra injeção e adulteração)
    const parseResult = askQuestionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues?.[0];
      return res.status(400).json({
        success: false,
        error: firstIssue?.message || 'Dados inválidos fornecidos para responder à dúvida.'
      });
    }

    const { documentData, question, history } = parseResult.data;

    // LGPD: NUNCA logar o texto da pergunta em produção (pode conter dados médicos ou judiciais sensíveis)
    safeLog.info(
      `Dúvida recebida para documento (${documentData.categoria || 'Geral'}) [tamanho da pergunta: ${question.length} chars]`
    );

    const answer = await answerDocumentQuestion({
      documentData,
      question,
      history
    });

    safeLog.info('Dúvida respondida com sucesso pela IA');

    return res.status(200).json({
      success: true,
      data: {
        question: question.trim(),
        answer
      }
    });
  } catch (error) {
    safeLog.error('Falha ao responder dúvida', error.message);
    const isApiKeyError = error.message && error.message.includes('GEMINI_API_KEY');
    let friendlyError = error.message || 'Não foi possível responder sua dúvida no momento. Tente novamente.';
    if (friendlyError.startsWith('{') && friendlyError.includes('"message"')) {
      try {
        const parsed = JSON.parse(friendlyError);
        friendlyError = parsed.error?.message || friendlyError;
      } catch (_) {}
    }
    if (friendlyError.includes('INTERNAL') || friendlyError.includes('Internal error')) {
      friendlyError = 'Os servidores da IA tiveram uma instabilidade momentânea. Por favor, tente enviar sua pergunta novamente.';
    }

    return res.status(isApiKeyError ? 401 : 500).json({
      success: false,
      error: isApiKeyError
        ? 'Chave de API do Gemini não configurada no servidor.'
        : friendlyError
    });
  }
});

// Armazenamento em memória RAM de tickets recentes (LGPD: sem persistência em disco)
const supportTickets = new Map();
const MAX_STORED_TICKETS = 50;

// Endpoint: Abertura e integração de tickets com Help Desk / CRM
app.post('/api/tickets/create', async (req, res) => {
  try {
    const parseResult = createTicketSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues || parseResult.error.errors || [];
      const errorMsg = issues.length > 0
        ? issues.map((e) => e.message).join(', ')
        : 'Dados inválidos para abertura do chamado';
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const {
      nomeCliente,
      contato,
      tipoProblema,
      diagnosticoTecnico,
      resumoSimples,
      etapasTentadas,
      observacoes
    } = parseResult.data;

    // Gera protocolo amigável e legível para o cidadão
    const ano = new Date().getFullYear();
    const aleatorio = Math.floor(1000 + Math.random() * 9000);
    const protocolo = parseResult.data.protocolo || `SUP-${ano}-${aleatorio}`;

    const ticket = {
      protocolo,
      nomeCliente,
      contato,
      tipoProblema,
      diagnosticoTecnico: diagnosticoTecnico || null,
      resumoSimples: resumoSimples || '',
      etapasTentadas: etapasTentadas || [],
      observacoes: observacoes || '',
      status: 'aberto',
      criadoEm: new Date().toISOString()
    };

    // Salva na memória RAM rotativa
    supportTickets.set(protocolo, ticket);
    if (supportTickets.size > MAX_STORED_TICKETS) {
      const oldestKey = supportTickets.keys().next().value;
      supportTickets.delete(oldestKey);
    }

    safeLog.info(`Novo ticket de suporte aberto com sucesso. Protocolo: ${protocolo}`);

    // Integração assíncrona com Webhook de Help Desk (Zendesk, GLPI, Freshdesk, Chatwoot, etc.) se configurado
    if (process.env.WEBHOOK_HELPDESK_URL) {
      fetch(process.env.WEBHOOK_HELPDESK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ticket.created',
          ticket
        })
      }).catch((webhookErr) => {
        safeLog.warn(`Falha ao despachar webhook de helpdesk: ${webhookErr.message}`);
      });
    }

    return res.status(201).json({
      success: true,
      ticket
    });
  } catch (err) {
    safeLog.error('Erro ao registrar chamado de suporte:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao registrar o chamado. Por favor, tente novamente.'
    });
  }
});

// Endpoint: Consulta de ticket por protocolo
app.get('/api/tickets/:protocolo', (req, res) => {
  const { protocolo } = req.params;
  const ticket = supportTickets.get(protocolo);
  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: 'Chamado não localizado com o protocolo informado.'
    });
  }
  return res.json({ success: true, ticket });
});

// Endpoint: Listagem de tickets recentes para o painel do técnico
app.get('/api/tickets', (req, res) => {
  const tickets = Array.from(supportTickets.values()).reverse();
  return res.json({ success: true, tickets });
});

// Tratamento de erros do multer e middlewares
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'O arquivo é muito grande. O limite máximo permitido por arquivo é de 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Número máximo de páginas/arquivos excedido (máximo de 4).'
      });
    }
    return res.status(400).json({ success: false, error: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

app.listen(PORT, async () => {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  console.log(`====================================================`);
  console.log(`🚀 Servidor Tradutor de Burocracia rodando na porta ${PORT}`);
  console.log(`🤖 Provedor de IA configurado: [${provider.toUpperCase()}]`);
  console.log(`🛡️  Segurança: Helmet, Rate-Limit, CORS e Magic-Bytes ativados`);
  console.log(`🔒 LGPD: Armazenamento exclusivo em memória RAM (sem disco)`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
