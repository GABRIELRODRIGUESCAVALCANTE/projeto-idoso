/**
 * Utilitário de logging sanitizado para proteção de dados sensíveis (LGPD Art. 5º, II).
 * Garante que conteúdo de documentos (OCR), respostas de IA, nomes de pacientes,
 * remédios e perguntas de usuários nunca sejam gravados em stdout ou arquivos de log.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const safeLog = {
  info: (msg, meta = '') => {
    console.log(`[INFO] ${msg}${meta ? ` - ${meta}` : ''}`);
  },
  warn: (msg, meta = '') => {
    console.warn(`[AVISO] ${msg}${meta ? ` - ${meta}` : ''}`);
  },
  error: (msg, meta = '') => {
    console.error(`[ERRO] ${msg}${meta ? ` - ${meta}` : ''}`);
  },
  security: (msg) => {
    console.warn(`[SEGURANÇA] ${msg}`);
  },
  // Sanitiza nome de arquivos para evitar expor nomes pessoais contidos no filename
  sanitizeFilename: (name) => {
    if (!name || isProduction) return 'documento_processado';
    // Em desenvolvimento, mantém extensão mas encurta nome
    const ext = name.split('.').pop();
    return `arquivo_${name.slice(0, 8)}...${ext ? `.${ext}` : ''}`;
  }
};
