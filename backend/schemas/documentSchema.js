import { z } from 'zod';

export const documentSchema = z.object({
  categoria: z.enum([
    'CONTA_SERVICO',
    'SAUDE_RECEITA',
    'ODONTOLOGIA',
    'ORIENTACAO_POS_PROCEDIMENTO',
    'PEDIDO_EXAME',
    'RESULTADO_EXAME',
    'VACINACAO',
    'NOTIFICACAO_LEGAL',
    'BENEFICIO_SOCIAL',
    'EQUIPAMENTO_HARDWARE',
    'ERRO_SISTEMA_TELA',
    'ETIQUETA_PATRIMONIO',
    'FATURA_TELECOM_TI',
    'ALERTA_GOLPE_SUSPEITO',
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
    formato: z.enum(['BANCARIO', 'ARRECADACAO']).optional(),
    codigoBanco: z.string().optional(),
    banco: z.string().nullable().optional(),
    segmento: z.string().optional(),
    segmentoNome: z.string().nullable().optional(),
    valorCentavos: z.number().nullable().optional(),
    valorCalculado: z.string().nullable().optional(),
    dataVencimentoCalculada: z.string().nullable().optional(),
    mensagem: z.string().optional(),
    auditoria: z.object({
      status: z.enum(['consistente', 'atencao', 'divergente', 'ilegivel']),
      alertas: z.array(z.string()).default([]),
      valorLidoNoPapel: z.string().nullable().optional(),
      empresaHomologada: z.boolean().optional().default(false)
    }).optional()
  }).nullable().optional().default(null),
  pontosDeAtencao: z.array(z.string()).default([]),
  // Módulo Saúde: sinais que exigem procurar a unidade de saúde ou o SAMU (192)
  sinaisDeAlerta: z.array(z.string()).optional().default([]),
  alertaEtico: z.string().min(1, 'O alerta ético preventivo é obrigatório'),
  textoParaVoz: z.string().min(5, 'O texto formatado para voz é obrigatório'),
  // Módulo Específico: Diagnóstico Técnico para Nível 2 / Help Desk
  diagnosticoTecnico: z.object({
    dispositivoIdentificado: z.string().nullable().optional().default(null),
    statusLeds: z.record(z.string(), z.string()).nullable().optional().default(null),
    codigoErroDetectado: z.string().nullable().optional().default(null),
    causaProvavel: z.string().default('Não especificado'),
    nivelGravidade: z.enum(['baixa', 'media', 'alta', 'critica']).default('media'),
    acaoRecomendadaTecnico: z.string().default('Verificar conexão física e reiniciar equipamento')
  }).nullable().optional().default(null),
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

// Schema para criação de ticket de suporte e integração com Help Desk (Zendesk, GLPI, etc.)
export const createTicketSchema = z.object({
  nomeCliente: z.string().min(2, 'O nome do cliente é obrigatório').max(100),
  contato: z.string().min(5, 'Telefone, WhatsApp ou e-mail de contato é obrigatório').max(100),
  tipoProblema: z.string().default('Suporte Técnico Geral'),
  protocolo: z.string().optional(),
  diagnosticoTecnico: z.any().optional().default(null),
  resumoSimples: z.string().optional().default(''),
  etapasTentadas: z.array(z.string()).default([]),
  observacoes: z.string().max(1000).optional().default('')
});

