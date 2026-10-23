/**
 * Modo de exibição da aplicação.
 * - 'completo': todas as frentes (contas, saúde, suporte técnico e antifraude).
 * - 'saude': foco em clínicas odontológicas e postos de saúde (UBS), sem telas de TI/Help Desk.
 *
 * Ativação: parâmetro de URL `?modo=saude` (ou `?modo=completo` para voltar),
 * ou variável de build `VITE_APP_MODE=saude`. A escolha via URL fica salva no navegador.
 */
const STORAGE_KEY = 'app_modo';
const VALID_MODES = ['saude', 'completo'];

export function getAppMode() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('modo');
    if (VALID_MODES.includes(fromUrl)) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (VALID_MODES.includes(saved)) return saved;
  } catch {
    // Navegação privada ou armazenamento bloqueado: segue para o padrão de build
  }
  return import.meta.env.VITE_APP_MODE === 'saude' ? 'saude' : 'completo';
}

// Categorias tratadas como documentos de saúde (alertas conservadores e impressão em letra grande)
export const HEALTH_CATEGORIES = [
  'SAUDE_RECEITA',
  'ODONTOLOGIA',
  'ORIENTACAO_POS_PROCEDIMENTO',
  'PEDIDO_EXAME',
  'RESULTADO_EXAME',
  'VACINACAO'
];
