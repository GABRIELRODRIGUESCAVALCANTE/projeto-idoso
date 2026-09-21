import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { analyzeDocumentImage } from './services/geminiService.js';

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
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Por favor, envie uma foto ou imagem do documento (JPG, PNG, WEBP).'));
    }
  }
});

// Endpoint de verificação de status e saúde
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    status: 'online',
    service: 'Tradutor de Burocracia & Saúde API',
    model: 'gemini-2.5-flash',
    geminiKeyConfigured: hasKey
  });
});

// Endpoint principal: Análise Multimodal de Documentos
app.post('/api/analyze-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma foto ou arquivo de documento foi enviado.'
      });
    }

    console.log(`[LOG] Recebido documento para análise: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB, ${req.file.mimetype})`);

    const analysis = await analyzeDocumentImage({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype
    });

    console.log(`[LOG] Análise concluída com sucesso: "${analysis.tipoDocumento}"`);

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
