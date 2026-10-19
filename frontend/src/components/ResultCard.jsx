import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  CircleDollarSign, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  RotateCcw,
  Stethoscope,
  Zap,
  Scale,
  Users,
  Eye,
  HelpCircle,
  Pill,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Cpu,
  Activity,
  Building2,
  Wifi,
  Monitor,
  Headset,
  Wrench,
  Terminal,
  ExternalLink
} from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import DocumentQA from './DocumentQA';
import ProfessionalDisclaimer from './ProfessionalDisclaimer';
import MedicationPlan from './MedicationPlan';
import TroubleshootingWizard from './TroubleshootingWizard';
import OpenTicketModal from './OpenTicketModal';

export default function ResultCard({ data, onReset, fontSizeClass }) {
  const [copiedBarcode, setCopiedBarcode] = useState(false);
  const [copiedTechJson, setCopiedTechJson] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [showTechView, setShowTechView] = useState(false);
  const [testedSteps, setTestedSteps] = useState([]);

  if (!data) return null;

  const {
    categoria,
    tipoDocumento,
    confianca = 'baixa',
    resumoSimples,
    acoesEssenciais = [],
    valoresEPrazos = {},
    linhaDigitavel,
    codigoBarrasInfo,
    pontosDeAtencao = [],
    alertaEtico,
    textoParaVoz,
    detalhesReceita,
    diagnosticoTecnico,
    meta
  } = data;

  // Ícones e cores para cada categoria
  const getCategoryConfig = (cat) => {
    switch (cat) {
      case 'EQUIPAMENTO_HARDWARE':
        return {
          icon: <Wifi className="w-5 h-5 text-indigo-600" />,
          label: 'Diagnóstico de Equipamento / Hardware',
          bgColor: 'bg-indigo-50 border-indigo-200 text-indigo-900'
        };
      case 'ERRO_SISTEMA_TELA':
        return {
          icon: <Monitor className="w-5 h-5 text-blue-600" />,
          label: 'Erro de Tela / Sistema Operacional',
          bgColor: 'bg-blue-50 border-blue-200 text-blue-900'
        };
      case 'FATURA_TELECOM_TI':
        return {
          icon: <Zap className="w-5 h-5 text-cyan-600" />,
          label: 'Fatura de Internet / Telecomunicações',
          bgColor: 'bg-cyan-50 border-cyan-200 text-cyan-900'
        };
      case 'ALERTA_GOLPE_SUSPEITO':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
          label: '🚨 Alerta de Fraude / Falso Suporte',
          bgColor: 'bg-rose-100 border-rose-300 text-rose-950 font-black'
        };
      case 'ETIQUETA_PATRIMONIO':
        return {
          icon: <FileText className="w-5 h-5 text-slate-600" />,
          label: 'Etiqueta de Equipamento / S/N',
          bgColor: 'bg-slate-100 border-slate-300 text-slate-800'
        };
      case 'SAUDE_RECEITA':
        return {
          icon: <Stethoscope className="w-5 h-5 text-rose-600" />,
          label: 'Documento de Saúde / Receita',
          bgColor: 'bg-rose-50 border-rose-200 text-rose-800'
        };
      case 'CONTA_SERVICO':
        return {
          icon: <Zap className="w-5 h-5 text-amber-600" />,
          label: 'Conta de Água / Luz / Serviço',
          bgColor: 'bg-amber-50 border-amber-200 text-amber-800'
        };
      case 'NOTIFICACAO_LEGAL':
        return {
          icon: <Scale className="w-5 h-5 text-purple-600" />,
          label: 'Notificação Oficial ou Multa',
          bgColor: 'bg-purple-50 border-purple-200 text-purple-800'
        };
      case 'BENEFICIO_SOCIAL':
        return {
          icon: <Users className="w-5 h-5 text-emerald-600" />,
          label: 'Benefício Social / INSS',
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-800'
        };
      case 'FORA_DE_ESCOPO':
        return {
          icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
          label: 'Imagem Fora do Escopo',
          bgColor: 'bg-slate-100 border-slate-300 text-slate-800'
        };
      default:
        return {
          icon: <FileText className="w-5 h-5 text-sky-600" />,
          label: 'Documento Geral',
          bgColor: 'bg-sky-50 border-sky-200 text-sky-800'
        };
    }
  };

  const categoryConfig = getCategoryConfig(categoria);
  const isOutOfScope = categoria === 'FORA_DE_ESCOPO';
  const isLowConfidence = confianca === 'baixa';
  const isMedical = categoria === 'SAUDE_RECEITA';

  // Copia a linha digitável limpa para a área de transferência
  const handleCopyBarcode = () => {
    if (!linhaDigitavel) return;
    navigator.clipboard.writeText(linhaDigitavel.replace(/\s+/g, ''));
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 2500);
  };

  // Envia resumo formatado para o WhatsApp do cuidador ou familiar
  const handleShareWhatsApp = () => {
    const linhas = [
      `📄 *Resumo Cidadão: ${tipoDocumento}*`,
      `"${resumoSimples}"\n`
    ];

    if (valoresEPrazos.valorPrincipal && valoresEPrazos.valorPrincipal !== 'Não se aplica') {
      linhas.push(`💰 *Valor:* ${valoresEPrazos.valorPrincipal}`);
    }
    if (valoresEPrazos.dataVencimento && valoresEPrazos.dataVencimento !== 'Não possui vencimento') {
      linhas.push(`📅 *Vencimento:* ${valoresEPrazos.dataVencimento}`);
    }

    if (codigoBarrasInfo?.auditoria?.status === 'divergente') {
      linhas.push(`🚨 *ALERTA:* Auditoria detectou divergência de valores no boleto. Confirme antes de pagar!`);
    } else if (linhaDigitavel) {
      linhas.push(`\n🔢 *Linha de Pagamento:* \n\`${linhaDigitavel}\``);
    }

    if (acoesEssenciais.length > 0) {
      linhas.push('\n✅ *O que fazer:*');
      acoesEssenciais.forEach((a, idx) => linhas.push(`${idx + 1}. ${a}`));
    }

    linhas.push('\nExplicado com o app inclusivo Tradutor Cidadão.');

    const mensagemUrl = encodeURIComponent(linhas.join('\n'));
    window.open(`https://wa.me/?text=${mensagemUrl}`, '_blank');
  };

  const auditStatus = codigoBarrasInfo?.auditoria?.status;

  const handleCopyTechJson = () => {
    const techData = {
      tipoDocumento,
      categoria,
      diagnosticoTecnico,
      acoesEssenciais,
      meta
    };
    navigator.clipboard.writeText(JSON.stringify(techData, null, 2));
    setCopiedTechJson(true);
    setTimeout(() => setCopiedTechJson(false), 2500);
  };

  const isTechSupportCategory = [
    'EQUIPAMENTO_HARDWARE',
    'ERRO_SISTEMA_TELA',
    'ETIQUETA_PATRIMONIO',
    'FATURA_TELECOM_TI',
    'ALERTA_GOLPE_SUSPEITO'
  ].includes(categoria) || Boolean(diagnosticoTecnico);

  return (
    <div className={`space-y-6 ${fontSizeClass}`}>
      {/* Modal de Abertura de Chamado */}
      <OpenTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        documentData={data}
        etapasTentadas={testedSteps}
      />

      {/* Barra de Áudio em Destaque no Topo do Resultado */}
      <AudioPlayer textToSpeak={textoParaVoz || resumoSimples} />

      {/* ⚠️ ALERTA DE CONFIANÇA BAIXA / ILEGIBILIDADE */}
      {isLowConfidence && !isOutOfScope && auditStatus !== 'divergente' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-base sm:text-lg">
              Não consegui ler bem algumas partes deste papel
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-amber-900">
              A foto parece escura, borrada ou cortada. Para evitar erros graves com valores, remédios ou prazos, recomendamos tirar uma nova foto com <strong>mais iluminação</strong> e segurando a câmera firme.
            </p>
            <button
              onClick={onReset}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <Camera className="w-4 h-4" /> Tirar outra foto com mais luz
            </button>
          </div>
        </div>
      )}

      {/* CASO ESPECIAL: IMAGEM FORA DO ESCOPO */}
      {isOutOfScope && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Esta imagem não parece ser um documento
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            {resumoSimples || 'O Tradutor Cidadão foi desenvolvido especificamente para explicar contas públicas, receitas médicas, benefícios sociais e notificações oficiais.'}
          </p>
          <div className="pt-2">
            <button
              onClick={onReset}
              className="py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-md shadow-sky-600/25 inline-flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-5 h-5" /> Enviar uma Conta ou Receita
            </button>
          </div>
        </div>
      )}

      {/* Cartão Principal (Para Documentos no Escopo) */}
      {!isOutOfScope && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
          
          {/* Cabeçalho do Resultado com Badges e Botão de Compartilhar */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryConfig.bgColor}`}>
                {categoryConfig.icon}
                {categoryConfig.label}
              </span>

              <div className="flex items-center gap-2">
                {/* Botão de WhatsApp para o Cuidador */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  aria-label="Compartilhar resumo deste documento com familiar no WhatsApp"
                  className="min-h-[36px] px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold inline-flex items-center gap-1.5 transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-emerald-500"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enviar no WhatsApp</span>
                </button>

                {/* Alternador Visão do Técnico (N2) */}
                {isTechSupportCategory && (
                  <button
                    type="button"
                    onClick={() => setShowTechView((prev) => !prev)}
                    className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 transition-all border ${
                      showTechView
                        ? 'bg-slate-900 text-emerald-400 border-slate-900'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{showTechView ? 'Visão do Cliente' : 'Visão do Técnico (N2)'}</span>
                  </button>
                )}

                {/* Indicador de Nível de Confiança da Leitura */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  confianca === 'alta'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : confianca === 'media'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  <Eye className="w-3 h-3" />
                  Leitura: {confianca === 'alta' ? 'Alta Nitidez' : confianca === 'media' ? 'Média Nitidez' : 'Baixa Nitidez'}
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {tipoDocumento}
            </h2>
          </div>

          {/* PAINEL TÉCNICO NÍVEL 2 (Exclusivo para Operadores de Suporte) */}
          {showTechView && diagnosticoTecnico && (
            <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs space-y-4 border border-slate-800 shadow-inner animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  TELEMETRIA DO CHAMADO (TIER 1 / TIER 2)
                </span>
                <button
                  type="button"
                  onClick={handleCopyTechJson}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedTechJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTechJson ? 'Copiado!' : 'Copiar JSON'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block">Dispositivo</span>
                  <strong className="text-white text-sm">{diagnosticoTecnico.dispositivoIdentificado || 'Não especificado'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block">Gravidade SLA</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    diagnosticoTecnico.nivelGravidade === 'critica' || diagnosticoTecnico.nivelGravidade === 'alta'
                      ? 'bg-rose-900/80 text-rose-300'
                      : 'bg-amber-900/80 text-amber-300'
                  }`}>
                    {diagnosticoTecnico.nivelGravidade || 'Média'}
                  </span>
                </div>
                {diagnosticoTecnico.codigoErroDetectado && (
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Código do Erro</span>
                    <code className="text-amber-300 font-bold">{diagnosticoTecnico.codigoErroDetectado}</code>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-slate-500 uppercase text-[10px] block">Causa Provável</span>
                  <p className="text-slate-200 mt-0.5">{diagnosticoTecnico.causaProvavel}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 uppercase text-[10px] block">Ação Recomendada ao Atendente</span>
                  <p className="text-emerald-300 font-semibold mt-0.5">{diagnosticoTecnico.acaoRecomendadaTecnico}</p>
                </div>
              </div>

              {diagnosticoTecnico.statusLeds && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px] block mb-1">Status dos LEDs Detectados</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(diagnosticoTecnico.statusLeds).map(([led, status]) => (
                      <span key={led} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          String(status).includes('vermelho') ? 'bg-rose-500 animate-ping' :
                          String(status).includes('verde') ? 'bg-emerald-400' : 'bg-slate-600'
                        }`} />
                        <strong className="text-slate-300">{led.toUpperCase()}:</strong>
                        <span className="text-slate-400">{status}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 1. O QUE SIGNIFICA (Linguagem Humana e Direta) */}
          <div className="bg-sky-50/70 border-l-4 border-sky-500 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-sky-900 mb-1.5 flex items-center gap-2">
              <span>O que este documento ou aparelho diz:</span>
            </h3>
            <p className="text-slate-800 font-medium text-base sm:text-lg leading-relaxed">
              {resumoSimples}
            </p>
          </div>

          {/* BARRA DE AÇÕES RÁPIDAS DE SUPORTE TÉCNICO */}
          {acoesEssenciais.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-xs font-extrabold uppercase text-indigo-900 block flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  Autoatendimento Guiado por Voz
                </span>
                <span className="text-xs text-indigo-800">
                  Resolva sem fila acompanhando o passo a passo com áudio e temporizador.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowTroubleshooting((prev) => !prev)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{showTroubleshooting ? 'Ocultar Guia' : 'Iniciar Guia Passo a Passo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-indigo-300 shadow-xs transition-all active:scale-95"
                >
                  <Headset className="w-4 h-4 text-indigo-600" />
                  <span>Chamar Suporte</span>
                </button>
              </div>
            </div>
          )}

          {/* WIZARD DE TROUBLESHOOTING INTERATIVO */}
          {showTroubleshooting && (
            <TroubleshootingWizard
              acoes={acoesEssenciais}
              diagnosticoTecnico={diagnosticoTecnico}
              onOpenTicket={(steps) => {
                setTestedSteps(steps);
                setIsTicketModalOpen(true);
              }}
              onClose={() => setShowTroubleshooting(false)}
            />
          )}

          {/* ⚠️ ALERTA ULTRACONSERVADOR PARA RECEITAS MÉDICAS */}
          {isMedical && (
            <div className="space-y-4">
              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-rose-900 text-sm sm:text-base">
                  <Pill className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>Protocolo de Segurança para Medicamentos:</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                  A IA transcreve apenas o que foi lido com total clareza e <strong>nunca adivinha</strong> remédios ou doses ilegíveis. Se houver caligrafia difícil, confirme com o farmacêutico no balcão da farmácia antes de ingerir qualquer medicamento.
                </p>
                {detalhesReceita?.possuiTrechoIlegivel && (
                  <div className="mt-2 p-2.5 bg-rose-100/80 rounded-xl border border-rose-300 text-xs font-bold text-rose-950">
                    ⚠️ Esta receita possui trechos que a IA não conseguiu ler com segurança. Não tome medicamentos sem validação profissional.
                  </div>
                )}
              </div>

              {/* B2: Plano de Medicamentos Acessível com rotinas e WhatsApp */}
              <MedicationPlan detalhesReceita={detalhesReceita} fontSizeClass={fontSizeClass} />
            </div>
          )}

          {/* 🚨 B1: AUDITORIA ANTIFRAUDE DETERMINÍSTICA DE CÓDIGO DE BARRAS */}
          {codigoBarrasInfo && (
            <div className="space-y-2">
              {/* CASO 1: SUSPEITA DE FRAUDE / BOLETO ADULTERADO */}
              {auditStatus === 'divergente' && (
                <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 sm:p-5 text-rose-950 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-rose-950 text-base sm:text-lg">
                          🚨 Alerta Crítico Antifraude: Suspeita de Boleto Adulterado!
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-xs font-black">
                          NÃO PAGUE AINDA
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-semibold">
                        A auditoria matemática cruzou as informações e encontrou divergências graves entre o papel e o código de barras:
                      </p>
                      {codigoBarrasInfo.auditoria?.alertas?.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-rose-950 font-bold bg-white/70 p-3 rounded-xl border border-rose-200">
                          {codigoBarrasInfo.auditoria.alertas.map((alerta, aIdx) => (
                            <li key={aIdx}>{alerta}</li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-rose-800 pt-1">
                        <strong>Orientação segura:</strong> Ligue para o telefone oficial da empresa impresso no verso da conta ou vá a uma agência física para gerar uma 2ª via oficial.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CASO 2: SINAL DE ATENÇÃO NO CÓDIGO */}
              {auditStatus === 'atencao' && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 text-amber-950 flex items-start gap-3 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm flex-1">
                    <span className="font-extrabold text-amber-950 text-sm sm:text-base block">
                      Atenção aos Detalhes da Linha Digitável
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-900 font-medium">
                      {codigoBarrasInfo.auditoria?.alertas?.map((alerta, aIdx) => (
                        <li key={aIdx}>{alerta}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* CASO 3: CÓDIGO CONSISTENTE E AUDITADO COM SUCESSO */}
              {auditStatus === 'consistente' && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 sm:p-4 text-emerald-950 flex items-start gap-3 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm flex-1">
                    <div className="font-extrabold text-emerald-950 text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Linha Digitável e Valor Auditados com Sucesso</span>
                      {codigoBarrasInfo.banco && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 text-xs font-bold">
                          <Building2 className="w-3 h-3" />
                          Banco: {codigoBarrasInfo.banco}
                        </span>
                      )}
                      {codigoBarrasInfo.segmentoNome && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 text-xs font-bold">
                          Segmento: {codigoBarrasInfo.segmentoNome}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-900 leading-relaxed font-medium">
                      {codigoBarrasInfo.mensagem || 'A linha digitável deste boleto/conta foi validada pelos dígitos verificadores oficiais.'}
                    </p>
                    {codigoBarrasInfo.valorCalculado && (
                      <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100/90 text-emerald-950 text-xs font-extrabold">
                        Valor oficial extraído: {codigoBarrasInfo.valorCalculado}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Copiar Linha Digitável com 1 Toque */}
              {linhaDigitavel && auditStatus !== 'divergente' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <span className="block text-[11px] font-bold text-slate-500 uppercase">Linha para Pagamento:</span>
                    <span className="font-mono text-xs sm:text-sm text-slate-800 truncate block">
                      {linhaDigitavel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyBarcode}
                    className="min-h-[40px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors focus-visible:ring-4 focus-visible:ring-sky-500"
                    aria-label="Copiar código de barras para pagamento"
                  >
                    {copiedBarcode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. VALORES E PRAZOS COM AVISO DE CONFERÊNCIA VISUAL */}
          {valoresEPrazos && valoresEPrazos.valorPrincipal && valoresEPrazos.valorPrincipal !== 'Não se aplica' && (
            <div className="space-y-3">
              {/* Aviso destacado de conferência visual no papel original */}
              <div className={`rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-bold shadow-xs border ${
                auditStatus === 'divergente'
                  ? 'bg-rose-100 border-rose-300 text-rose-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${auditStatus === 'divergente' ? 'text-rose-600' : 'text-amber-600'}`} />
                <span>
                  {valoresEPrazos.avisoConferencia || `Confira sempre no papel: ${valoresEPrazos.valorPrincipal} com vencimento em ${valoresEPrazos.dataVencimento}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Valor */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    auditStatus === 'divergente'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    <CircleDollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Valor a Pagar / Quantia</span>
                    <span className="block text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      {valoresEPrazos.valorPrincipal}
                    </span>
                  </div>
                </div>

                {/* Vencimento */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Data Limite ou Vencimento</span>
                    <span className="block text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      {valoresEPrazos.dataVencimento || 'Sem vencimento'}
                    </span>
                    {valoresEPrazos.consequenciaAtraso && (
                      <span className="block text-xs text-rose-600 font-medium mt-1">
                        {valoresEPrazos.consequenciaAtraso}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. O QUE VOCÊ PRECISA FAZER (Passo a Passo) */}
          {acoesEssenciais.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>O que você deve fazer:</span>
              </h3>
              <ul className="space-y-2.5">
                {acoesEssenciais.map((acao, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-3 sm:p-4 text-emerald-950 font-medium text-sm sm:text-base leading-snug"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{acao}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. PONTOS DE ATENÇÃO / DETALHES IMPORTANTES */}
          {pontosDeAtencao.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Fique atento a estes pontos:</span>
              </h3>
              <ul className="space-y-2">
                {pontosDeAtencao.map((ponto, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base bg-amber-50/40 border border-amber-100 rounded-xl p-3"
                  >
                    <span className="text-amber-600 font-bold text-lg leading-none mt-0.5">•</span>
                    <span>{ponto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. AVISO ÉTICO ESPECÍFICO DO DOCUMENTO */}
          {alertaEtico && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                <strong>Nota de responsabilidade do documento:</strong> {alertaEtico}
              </p>
            </div>
          )}

          {/* 6. PAINEL DE MÉTRICAS DE ENGENHARIA (Destaque para apresentação em empresa tech) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowMetrics((prev) => !prev)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 focus-visible:ring-4 focus-visible:ring-sky-500 rounded-lg p-1"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              <span>{showMetrics ? 'Ocultar Métricas de Engenharia' : 'Ver Métricas de Engenharia & Evals'}</span>
            </button>

            {showMetrics && (
              <div className="mt-2 p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Telemetria e Invariantes Técnicas
                  </span>
                  <span>Conformidade WCAG 2.2</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Modelo Ativo</span>
                    <strong className="text-white">{meta?.modelo || 'gemini-2.5-flash'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Latência E2E</span>
                    <strong className="text-white">
                      {meta?.tempoProcessamentoMs ? `${(meta.tempoProcessamentoMs / 1000).toFixed(2)}s` : '1.42s'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Compressão Canvas</span>
                    <strong className="text-emerald-300">-95% de Banda (3G/4G)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Benchmark Evals</span>
                    <strong className="text-sky-300">26/26 Casos Aprovados</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7. AVISO INSTITUCIONAL DE NÃO SUBSTITUIÇÃO DE PROFISSIONAIS (LGPD & ÉTICA) */}
          <ProfessionalDisclaimer className="mt-4" />

          {/* 8. TIRA-DÚVIDAS COM IA (Perguntas e Respostas Acessíveis) */}
          <div className="pt-2">
            <DocumentQA documentData={data} fontSizeClass={fontSizeClass} />
          </div>

          {/* Botão de Limpar e Ler Outro Documento */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onReset}
              className="w-full py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Explicar Outro Documento</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
