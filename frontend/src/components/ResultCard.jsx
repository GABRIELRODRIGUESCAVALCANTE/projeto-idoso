import React, { useState } from 'react';
import {
  Calendar,
  CircleDollarSign,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  Eye,
  HelpCircle,
  Pill,
  Camera,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Cpu,
  Building2,
  Headset,
  Wrench,
  Terminal,
  Printer,
  ArrowLeft,
  Info
} from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import DocumentQA from './DocumentQA';
import ProfessionalDisclaimer from './ProfessionalDisclaimer';
import MedicationPlan from './MedicationPlan';
import TroubleshootingWizard from './TroubleshootingWizard';
import OpenTicketModal from './OpenTicketModal';
import HealthAlerts from './HealthAlerts';
import { HEALTH_CATEGORIES } from '../utils/appMode';
import { getCategoryMeta } from '../utils/categoryMeta';
import { printLargeSheet } from '../utils/printSheet';

export default function ResultCard({ data, onReset, healthMode = false }) {
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
    sinaisDeAlerta = [],
    alertaEtico,
    textoParaVoz,
    detalhesReceita,
    diagnosticoTecnico,
    meta
  } = data;

  const categoryMeta = getCategoryMeta(categoria);
  const CategoryIcon = categoryMeta.icon;
  const isOutOfScope = categoria === 'FORA_DE_ESCOPO';
  const isLowConfidence = confianca === 'baixa';
  const hasMedications = Boolean(
    detalhesReceita?.possuiTrechoIlegivel || detalhesReceita?.medicamentosIdentificados?.length
  );
  const isMedical = categoria === 'SAUDE_RECEITA' || (HEALTH_CATEGORIES.includes(categoria) && hasMedications);
  const isHealthDocument = HEALTH_CATEGORIES.includes(categoria) || sinaisDeAlerta.length > 0;

  const handlePrintSheet = () => {
    const opened = printLargeSheet(data);
    if (!opened) {
      window.alert('O navegador bloqueou a janela de impressão. Permita pop-ups para este site e tente novamente.');
    }
  };

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

    if (sinaisDeAlerta.length > 0) {
      linhas.push('\n🚑 *Procure atendimento se acontecer:*');
      sinaisDeAlerta.forEach((sinal) => linhas.push(`• ${sinal}`));
      linhas.push('Emergência: ligue 192 (SAMU).');
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

  const hasValues = valoresEPrazos?.valorPrincipal && valoresEPrazos.valorPrincipal !== 'Não se aplica';
  const confidenceLabel = confianca === 'alta' ? 'Leitura nítida' : confianca === 'media' ? 'Leitura razoável' : 'Leitura difícil';

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Modal de Abertura de Chamado */}
      <OpenTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        documentData={data}
        etapasTentadas={testedSteps}
      />

      <button onClick={onReset} className="btn-quiet btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Explicar outro documento
      </button>

      {/* CASO ESPECIAL: IMAGEM FORA DO ESCOPO */}
      {isOutOfScope && (
        <div className="surface p-6 sm:p-10 text-center space-y-4">
          <span className="w-14 h-14 rounded-2xl bg-paper-deep text-ink-soft flex items-center justify-center mx-auto">
            <HelpCircle className="w-7 h-7" />
          </span>
          <h2 className="section-title">Esta imagem não parece ser um documento</h2>
          <p className="text-ink-soft max-w-md mx-auto">
            {resumoSimples || 'O Tradutor Cidadão explica receitas, pedidos de exame, contas, benefícios e notificações oficiais.'}
          </p>
          <button onClick={onReset} className="btn-primary">
            <Camera className="w-5 h-5" /> Enviar outro documento
          </button>
        </div>
      )}

      {!isOutOfScope && (
        <>
          {/* Cabeçalho do resultado */}
          <header className="px-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${categoryMeta.toneClasses.chip}`}>
                <CategoryIcon className="w-4 h-4" />
                {categoryMeta.label}
              </span>
              <span className={`chip ${confianca === 'baixa' ? 'bg-amber-50 text-amber-800' : 'bg-white text-ink-muted border border-ink/10'}`}>
                <Eye className="w-4 h-4" />
                {confidenceLabel}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-ink">
              {tipoDocumento}
            </h1>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={handleShareWhatsApp} aria-label="Enviar este resumo pelo WhatsApp" className="btn-secondary btn-sm">
                <Share2 className="w-4 h-4 text-pine-700" />
                Enviar no WhatsApp
              </button>
              {isHealthDocument && (
                <button type="button" onClick={handlePrintSheet} aria-label="Imprimir estas orientações em letra grande" className="btn-secondary btn-sm">
                  <Printer className="w-4 h-4 text-pine-700" />
                  Imprimir em letra grande
                </button>
              )}
              {isTechSupportCategory && !healthMode && (
                <button
                  type="button"
                  onClick={() => setShowTechView((prev) => !prev)}
                  aria-pressed={showTechView}
                  className={`btn btn-sm border ${showTechView ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-ink/15 hover:border-ink/30'}`}
                >
                  <Terminal className="w-4 h-4" />
                  {showTechView ? 'Visão do cliente' : 'Visão do técnico'}
                </button>
              )}
            </div>
          </header>

          {/* Aviso de foto ruim */}
          {isLowConfidence && auditStatus !== 'divergente' && (
            <div className="rounded-[1.5rem] bg-amber-50 border border-amber-200 p-5 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h2 className="font-bold text-lg text-amber-950">Algumas partes ficaram difíceis de ler</h2>
                <p className="text-amber-900">
                  A foto parece escura, tremida ou cortada. Para não errar valores, remédios ou prazos, tire outra foto com mais luz.
                </p>
                <button onClick={onReset} className="btn-secondary btn-sm">
                  <Camera className="w-4 h-4" /> Tirar outra foto
                </button>
              </div>
            </div>
          )}

          {/* Painel técnico (apenas modo completo) */}
          {showTechView && diagnosticoTecnico && (
            <div className="rounded-[1.5rem] bg-ink text-white p-5 font-mono text-sm space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <span className="font-bold text-pine-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Diagnóstico para o atendente
                </span>
                <button type="button" onClick={handleCopyTechJson} className="btn btn-sm bg-white/10 hover:bg-white/15 text-white font-sans">
                  {copiedTechJson ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedTechJson ? 'Copiado' : 'Copiar JSON'}
                </button>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/80">
                <div>
                  <dt className="text-xs uppercase text-white/50">Dispositivo</dt>
                  <dd className="text-white">{diagnosticoTecnico.dispositivoIdentificado || 'Não especificado'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-white/50">Gravidade</dt>
                  <dd className="text-clay-300 font-bold">{diagnosticoTecnico.nivelGravidade || 'media'}</dd>
                </div>
                {diagnosticoTecnico.codigoErroDetectado && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase text-white/50">Código do erro</dt>
                    <dd className="text-clay-300">{diagnosticoTecnico.codigoErroDetectado}</dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase text-white/50">Causa provável</dt>
                  <dd>{diagnosticoTecnico.causaProvavel}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase text-white/50">Ação recomendada</dt>
                  <dd className="text-pine-200">{diagnosticoTecnico.acaoRecomendadaTecnico}</dd>
                </div>
              </dl>
              {diagnosticoTecnico.statusLeds && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                  {Object.entries(diagnosticoTecnico.statusLeds).map(([led, status]) => (
                    <span key={led} className="px-2.5 py-1 rounded-lg bg-white/5 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        String(status).includes('vermelho') ? 'bg-rose-400' : String(status).includes('verde') ? 'bg-pine-300' : 'bg-white/30'
                      }`} />
                      <strong className="text-white">{led.toUpperCase()}</strong>
                      <span className="text-white/60">{status}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Áudio */}
          <AudioPlayer textToSpeak={textoParaVoz || resumoSimples} />

          {/* Resumo e conteúdo principal */}
          <article className="surface p-4 sm:p-8 space-y-8">
            <section>
              <h2 className="eyebrow">Em poucas palavras</h2>
              <p className="mt-2 text-xl sm:text-[1.4rem] leading-relaxed text-ink">{resumoSimples}</p>
            </section>

            <HealthAlerts sinaisDeAlerta={sinaisDeAlerta} />

            {/* AUDITORIA ANTIFRAUDE DO CÓDIGO DE BARRAS */}
            {codigoBarrasInfo && (
              <section className="space-y-3">
                {auditStatus === 'divergente' && (
                  <div className="rounded-[1.5rem] bg-rose-50 border-2 border-rose-300 p-5 text-rose-950">
                    <div className="flex items-start gap-4">
                      <ShieldAlert className="w-7 h-7 text-rose-600 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="chip bg-rose-600 text-white">Não pague ainda</p>
                        <h3 className="font-display text-xl font-semibold text-rose-950">Este boleto pode ter sido adulterado</h3>
                        <p>O que está escrito no papel não bate com o código de barras:</p>
                        {codigoBarrasInfo.auditoria?.alertas?.length > 0 && (
                          <ul className="list-disc pl-5 space-y-1 font-bold">
                            {codigoBarrasInfo.auditoria.alertas.map((alerta, aIdx) => <li key={aIdx}>{alerta}</li>)}
                          </ul>
                        )}
                        <p className="text-rose-900">Ligue para o telefone oficial da empresa ou peça a 2ª via numa agência.</p>
                      </div>
                    </div>
                  </div>
                )}

                {auditStatus === 'atencao' && (
                  <div className="rounded-[1.5rem] bg-amber-50 border border-amber-200 p-5 flex items-start gap-4 text-amber-950">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold">Confira os detalhes do código de barras</h3>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {codigoBarrasInfo.auditoria?.alertas?.map((alerta, aIdx) => <li key={aIdx}>{alerta}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {auditStatus === 'consistente' && (
                  <div className="rounded-[1.5rem] bg-pine-50 border border-pine-200 p-5 flex items-start gap-4 text-pine-950">
                    <ShieldCheck className="w-6 h-6 text-pine-700 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-bold text-pine-900">Código de barras conferido</h3>
                      <p className="text-pine-900">{codigoBarrasInfo.mensagem || 'Os dígitos verificadores oficiais estão corretos.'}</p>
                      <div className="flex flex-wrap gap-2">
                        {codigoBarrasInfo.valorCalculado && <span className="chip bg-white text-pine-800">Valor no código: {codigoBarrasInfo.valorCalculado}</span>}
                        {codigoBarrasInfo.banco && <span className="chip bg-white text-pine-800"><Building2 className="w-4 h-4" />{codigoBarrasInfo.banco}</span>}
                        {codigoBarrasInfo.segmentoNome && <span className="chip bg-white text-pine-800">{codigoBarrasInfo.segmentoNome}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {linhaDigitavel && auditStatus !== 'divergente' && (
                  <div className="rounded-2xl bg-paper border border-ink/10 p-3 pl-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-sm text-ink-muted">Linha para pagamento</span>
                      <span className="block font-mono text-sm text-ink truncate">{linhaDigitavel}</span>
                    </div>
                    <button type="button" onClick={handleCopyBarcode} className="btn-secondary btn-sm flex-shrink-0" aria-label="Copiar a linha digitável">
                      {copiedBarcode ? <Check className="w-4 h-4 text-pine-700" /> : <Copy className="w-4 h-4" />}
                      {copiedBarcode ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* VALORES E PRAZOS */}
            {hasValues && (
              <section className="space-y-3">
                <h2 className="eyebrow">Valores e prazos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-paper p-4 flex items-start gap-3">
                    <CircleDollarSign className={`w-6 h-6 flex-shrink-0 mt-0.5 ${auditStatus === 'divergente' ? 'text-rose-600' : 'text-clay-600'}`} />
                    <div>
                      <span className="block text-sm text-ink-muted">Valor</span>
                      <span className="block font-display text-2xl font-semibold text-ink">{valoresEPrazos.valorPrincipal}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-paper p-4 flex items-start gap-3">
                    <Calendar className="w-6 h-6 flex-shrink-0 mt-0.5 text-clay-600" />
                    <div>
                      <span className="block text-sm text-ink-muted">Prazo</span>
                      <span className="block font-display text-2xl font-semibold text-ink">{valoresEPrazos.dataVencimento || 'Sem prazo'}</span>
                      {valoresEPrazos.consequenciaAtraso && (
                        <span className="block text-sm text-ink-soft mt-1">{valoresEPrazos.consequenciaAtraso}</span>
                      )}
                    </div>
                  </div>
                </div>
                {valoresEPrazos.avisoConferencia && (
                  <p className={`flex items-start gap-2 text-sm ${auditStatus === 'divergente' ? 'text-rose-800 font-bold' : 'text-ink-soft'}`}>
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {valoresEPrazos.avisoConferencia}
                  </p>
                )}
              </section>
            )}

            {/* O QUE FAZER */}
            {acoesEssenciais.length > 0 && (
              <section>
                <h2 className="section-title">O que fazer</h2>
                <ol className="mt-4 space-y-4">
                  {acoesEssenciais.map((acao, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="w-9 h-9 rounded-full bg-pine-700 text-white font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-lg text-ink leading-snug">{acao}</span>
                    </li>
                  ))}
                </ol>

                {/* Guia passo a passo de suporte técnico (apenas modo completo) */}
                {!healthMode && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setShowTroubleshooting((prev) => !prev)} className="btn-secondary btn-sm">
                      <Wrench className="w-4 h-4 text-pine-700" />
                      {showTroubleshooting ? 'Fechar guia' : 'Fazer junto, passo a passo'}
                    </button>
                    {isTechSupportCategory && (
                      <button type="button" onClick={() => setIsTicketModalOpen(true)} className="btn-quiet btn-sm">
                        <Headset className="w-4 h-4" />
                        Chamar suporte
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}

            {showTroubleshooting && !healthMode && (
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

            {/* REMÉDIOS */}
            {isMedical && (
              <section className="space-y-4">
                <div className="flex items-start gap-3 text-ink-soft">
                  <Pill className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                  <p>
                    Só listamos o que foi lido com clareza. Nomes ou doses ilegíveis <strong className="text-ink">nunca são adivinhados</strong>: confira com o farmacêutico antes de tomar.
                  </p>
                </div>
                {detalhesReceita?.possuiTrechoIlegivel && (
                  <p className="rounded-2xl bg-rose-50 border border-rose-200 p-4 font-bold text-rose-900">
                    Esta receita tem partes que não conseguimos ler com segurança. Não tome remédios sem confirmar com um profissional.
                  </p>
                )}
                <MedicationPlan detalhesReceita={detalhesReceita} />
              </section>
            )}

            {/* PONTOS DE ATENÇÃO */}
            {pontosDeAtencao.length > 0 && (
              <section>
                <h2 className="section-title">Fique atento</h2>
                <ul className="mt-3 divide-y divide-ink/10">
                  {pontosDeAtencao.map((ponto, index) => (
                    <li key={index} className="flex items-start gap-3 py-3">
                      <span className="w-2 h-2 rounded-full bg-clay-500 mt-2.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-ink-soft">{ponto}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {alertaEtico && (
              <p className="flex items-start gap-2.5 text-sm text-ink-muted border-t border-ink/10 pt-5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {alertaEtico}
              </p>
            )}
          </article>

          <DocumentQA documentData={data} />

          <ProfessionalDisclaimer healthMode={healthMode} />

          {/* Detalhes técnicos de engenharia (apenas modo completo) */}
          {!healthMode && (
            <div className="px-1">
              <button type="button" onClick={() => setShowMetrics((prev) => !prev)} className="btn-quiet btn-sm text-ink-muted">
                <Cpu className="w-4 h-4" />
                {showMetrics ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}
              </button>
              {showMetrics && (
                <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-white/60 border border-ink/10 p-4 text-sm">
                  <div><dt className="text-ink-muted">Modelo</dt><dd className="font-bold text-ink">{meta?.modelo || 'gemini-2.5-flash'}</dd></div>
                  <div><dt className="text-ink-muted">Tempo</dt><dd className="font-bold text-ink">{meta?.tempoProcessamentoMs ? `${(meta.tempoProcessamentoMs / 1000).toFixed(2)} s` : '—'}</dd></div>
                  <div><dt className="text-ink-muted">Compressão</dt><dd className="font-bold text-ink">até −95% de dados</dd></div>
                  <div><dt className="text-ink-muted">Avaliação</dt><dd className="font-bold text-ink">26/26 casos</dd></div>
                </dl>
              )}
            </div>
          )}

          <button onClick={onReset} className="btn-primary w-full min-h-[56px] text-lg">
            <RotateCcw className="w-5 h-5" />
            Explicar outro documento
          </button>
        </>
      )}
    </div>
  );
}
