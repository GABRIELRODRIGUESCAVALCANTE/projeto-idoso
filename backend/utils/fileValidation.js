/**
 * Utilitário de validação segura de arquivos baseado em Magic Bytes (assinatura de buffer)
 * em conformidade com a LGPD e boas práticas de cibersegurança.
 * Impede que arquivos maliciosos ou executáveis sejam processados disfarçados de imagem ou PDF.
 */

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

/**
 * Detecta o verdadeiro tipo MIME inspecionando os primeiros bytes do buffer (Magic Numbers).
 * @param {Buffer} buffer - Buffer em memória do arquivo
 * @returns {string|null} - Tipo MIME detectado ou null se desconhecido/não suportado
 */
export function detectMimeFromMagicBytes(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 4) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) {
    return 'image/png';
  }

  // PNG alternativo (pelo menos os 4 primeiros bytes padrão)
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }

  // PDF: 25 50 44 46 (%PDF)
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }

  // WEBP: RIFF + 4 bytes tamanho + WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // 'RIFF'
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50 // 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}
