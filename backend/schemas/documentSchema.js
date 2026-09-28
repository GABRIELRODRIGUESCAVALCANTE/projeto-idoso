import { z } from 'zod';

export const documentSchema = z.object({
  categoria: z.enum([
    'CONTA_SERVICO',
    'SAUDE_RECEITA',
    'NOTIFICACAO_LEGAL',
    'BENEFICIO_SOCIAL',
    'FORA_DE_ESCOPO',
    'OUTRO'
  ]),
  tipoDocumento: z.string().min(1, 'O nome amigável do documento é obrigatório'),
  confianca: z.enum(['alta', 'media', 'baixa']).default('alta'),
  resumoSimples: z.string().min(5, 'O resumo explicativo simples deve conter conteúdo válido'),
  acoesEssenciais: z.array(z.string()).default([]),
  valoresEPrazos: z.object({
    valorPrincipal: z.string().default('Não se aplica'),
    dataVencimento: z.string().default('Não possui vencimento'),
    consequenciaAtraso: z.string().default('Nenhuma consequência imediata identificada'),
    avisoConferencia: z.string().optional().default('')
  }),
  pontosDeAtencao: z.array(z.string()).default([]),
  alertaEtico: z.string().min(1, 'O alerta ético preventivo é obrigatório'),
  textoParaVoz: z.string().min(5, 'O texto formatado para voz é obrigatório'),
  detalhesReceita: z.object({
    possuiTrechoIlegivel: z.boolean().default(false),
    medicamentosIdentificados: z.array(
      z.object({
        nome: z.string(),
        dosagem: z.string(),
        instrucao: z.string(),
        legivel: z.boolean().default(true)
      })
    ).optional().default([])
  }).optional()
});

export function validateDocumentAnalysis(data) {
  const result = documentSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const errorDetails = Array.isArray(issues) && issues.length > 0
      ? issues.map(e => `${(e.path || []).join('.')}: ${e.message}`).join(', ')
      : result.error.message || 'Dados inválidos';
    return {
      isValid: false,
      error: `Falha na validação do documento estruturado (${errorDetails})`,
      data: null
    };
  }
  return {
    isValid: true,
    error: null,
    data: result.data
  };
}
