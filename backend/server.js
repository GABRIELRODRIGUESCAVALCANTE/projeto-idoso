import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { analyzeDocumentImages, answerDocumentQuestion } from './services/geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do CORS para permitir requisições do frontend
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
);

app.use(express.json());

// Configuração de upload seguro em memória (Privacidade: dados não são salvos em disco)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // Limite de 15MB
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

    if (isImage || isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Por favor, envie uma foto (JPG, PNG) ou arquivo PDF do documento.'));
    }
  }
});

// Endpoint de verificação de status e saúde
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    status: 'online',
    service: 'Tradutor de Burocracia & Saúde API',
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    geminiKeyConfigured: hasKey
  });
});

// Endpoint principal: Análise Multimodal de Documentos (suporta frente e verso ou página única)
app.post(
  '/api/analyze-document',
  upload.fields([
    { name: 'documents', maxCount: 4 },
    { name: 'document', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Coleta todos os arquivos enviados (retrocompatível com 'document' único e 'documents' array)
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

      // Validação estrita de assinatura de bytes para CADA arquivo enviado
      const validFiles = [];

      for (const file of rawFiles) {
        const buf = file.buffer;
        const isJpeg = buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
        const isPng = buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
        const isPdf = buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46; // %PDF
        const isWebp = buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';

        if (!isJpeg && !isPng && !isPdf && !isWebp) {
          console.warn(`[SEGURANÇA] Arquivo rejeitado por assinatura inválida: ${file.originalname}`);
          return res.status(400).json({
            success: false,
            error: `O arquivo "${file.originalname}" possui assinatura inválida. Apenas fotos (JPG, PNG, WEBP) e documentos PDF autênticos são aceitos.`
          });
        }

        const mimeType = (file.mimetype === 'application/x-pdf' || file.originalname.toLowerCase().endsWith('.pdf'))
          ? 'application/pdf'
          : file.mimetype;

        validFiles.push({
          buffer: file.buffer,
          mimeType,
          originalname: file.originalname,
          size: file.size
        });
      }

      console.log(`[LOG] Recebido(s) ${validFiles.length} arquivo(s) para análise: ${validFiles.map(f => `${f.originalname} (${(f.size / 1024).toFixed(1)} KB)`).join(', ')}`);

      const analysis = await analyzeDocumentImages({
        files: validFiles
      });

      console.log(`[LOG] Análise de ${validFiles.length} página(s) concluída com sucesso: "${analysis.tipoDocumento}"`);

      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
    console.error('[ERRO] Falha ao analisar documento:', error.message);

    const isApiKeyError = error.message.includes('GEMINI_API_KEY');
    return res.status(isApiKeyError ? 401 : 500).json({
      success: false,
      error: error.message || 'Ocorreu um erro ao processar o seu documento. Tente novamente.'
    });
  }
});

// Endpoint secundário: Tira-Dúvidas com IA sobre o Documento
app.post('/api/ask-question', async (req, res) => {
  try {
    const { documentData, question, history } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Por favor, digite ou fale a sua dúvida.'
      });
    }

    if (!documentData) {
      return res.status(400).json({
        success: false,
        error: 'Dados do documento não fornecidos para responder à dúvida.'
      });
    }

    console.log(`[LOG] Recebida dúvida sobre "${documentData.tipoDocumento || 'documento'}": "${question.slice(0, 80)}"`);

    const answer = await answerDocumentQuestion({
      documentData,
      question: question.trim(),
      history: Array.isArray(history) ? history : []
    });

    console.log(`[LOG] Dúvida respondida com sucesso!`);

    return res.status(200).json({
      success: true,
      data: {
        question: question.trim(),
        answer
      }
    });
  } catch (error) {
    console.error('[ERRO] Falha ao responder dúvida:', error.message);
    const isApiKeyError = error.message.includes('GEMINI_API_KEY');
    return res.status(isApiKeyError ? 401 : 500).json({
      success: false,
      error: error.message || 'Não foi possível responder sua dúvida no momento. Tente novamente.'
    });
  }
});


// Tratamento de erros do multer e gerais
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'A imagem é muito grande. O limite máximo permitido é 10MB.'
      });
    }
    return res.status(400).json({ success: false, error: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Tradutor de Burocracia rodando na porta ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
