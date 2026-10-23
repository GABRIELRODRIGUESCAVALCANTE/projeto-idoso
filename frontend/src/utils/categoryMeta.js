import {
  FileText,
  ShieldAlert,
  Zap,
  Scale,
  Users,
  HelpCircle,
  Wifi,
  Monitor,
  Smile,
  ClipboardCheck,
  TestTube,
  ClipboardList,
  Syringe,
  Pill
} from 'lucide-react';

/**
 * Identidade visual de cada categoria de documento.
 * Os tons são poucos de propósito: saúde (pine), contas e prazos (clay),
 * golpes (alert) e assuntos gerais/técnicos (neutral).
 */
export const CATEGORY_META = {
  SAUDE_RECEITA: { label: 'Receita médica', icon: Pill, tone: 'pine' },
  ODONTOLOGIA: { label: 'Dentista', icon: Smile, tone: 'pine' },
  ORIENTACAO_POS_PROCEDIMENTO: { label: 'Cuidados após procedimento', icon: ClipboardCheck, tone: 'pine' },
  PEDIDO_EXAME: { label: 'Pedido de exame', icon: TestTube, tone: 'pine' },
  RESULTADO_EXAME: { label: 'Resultado de exame', icon: ClipboardList, tone: 'pine' },
  VACINACAO: { label: 'Vacinação', icon: Syringe, tone: 'pine' },
  ALERTA_GOLPE_SUSPEITO: { label: 'Possível golpe', icon: ShieldAlert, tone: 'alert' },
  CONTA_SERVICO: { label: 'Conta de consumo', icon: Zap, tone: 'clay' },
  FATURA_TELECOM_TI: { label: 'Fatura de internet ou telefone', icon: Zap, tone: 'clay' },
  NOTIFICACAO_LEGAL: { label: 'Notificação oficial', icon: Scale, tone: 'neutral' },
  BENEFICIO_SOCIAL: { label: 'Benefício social', icon: Users, tone: 'neutral' },
  EQUIPAMENTO_HARDWARE: { label: 'Equipamento', icon: Wifi, tone: 'neutral' },
  ERRO_SISTEMA_TELA: { label: 'Tela de erro', icon: Monitor, tone: 'neutral' },
  ETIQUETA_PATRIMONIO: { label: 'Etiqueta de equipamento', icon: FileText, tone: 'neutral' },
  FORA_DE_ESCOPO: { label: 'Fora do escopo', icon: HelpCircle, tone: 'neutral' },
  OUTRO: { label: 'Documento', icon: FileText, tone: 'neutral' }
};

export const TONE_CLASSES = {
  pine: { chip: 'bg-pine-50 text-pine-800', icon: 'bg-pine-100 text-pine-800' },
  clay: { chip: 'bg-clay-50 text-clay-700', icon: 'bg-clay-100 text-clay-700' },
  alert: { chip: 'bg-rose-50 text-rose-800', icon: 'bg-rose-100 text-rose-700' },
  neutral: { chip: 'bg-paper text-ink-soft', icon: 'bg-paper-deep text-ink-soft' }
};

export function getCategoryMeta(categoria) {
  const meta = CATEGORY_META[categoria] || CATEGORY_META.OUTRO;
  return { ...meta, toneClasses: TONE_CLASSES[meta.tone] };
}
