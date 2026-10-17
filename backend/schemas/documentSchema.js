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
  // Correção de Segurança C3: Default seguro sempre 'baixa' para nunca assumir alta nitidez por omissão
  confianca: z.enum(['alta', 'media', 'baixa']).default('baixa'),
  resumoSimples: z.string().min(5, 'O resumo explicativo simples deve conter conteúdo válido'),
  acoesEssenciais: z.array(z.string()).default([]),
  valoresEPrazos: z.object({
    valorPrincipal: z.string().default('Não se aplica'),
    dataVencimento: z.string().default('Não possui vencimento'),
    consequenciaAtraso: z.string().default('Nenhuma consequência imediata identificada'),
    avisoConferencia: z.string().optional().default('')
  }),
  linhaDigitavel: z.string().nullable().optional().default(null),
  codigoBarrasInfo: z.object({
    valido: z.boolean(),
    tipo: z.string().optional(),
    valorCalculado: z.string().nullable().optional(),
    dataVencimentoCalculada: z.string().nullable().optional(),
    mensagem: z.string().optional()
  }).nullable().optional().default(null),
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

// Schema de validação rigorosa para a rota de Tira-Dúvidas (Prevenção de injeção e adulteração C5)
export const askQuestionSchema = z.object({
  question: z.string().min(1, 'A dúvida não pode ser vazia').max(500, 'A pergunta excede o limite de tamanho seguro'),
  documentData: z.record(z.any()), // Objeto contendo os dados do documento
  history: z.array(
    z.object({
      question: z.string().max(500),
      answer: z.string().max(2000)
    })
  ).max(10, 'Histórico excede o limite de turnos').optional().default([])
});

