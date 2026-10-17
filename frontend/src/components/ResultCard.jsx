import React from 'react';
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
  CheckCircle2
} from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import DocumentQA from './DocumentQA';
import ProfessionalDisclaimer from './ProfessionalDisclaimer';
import MedicationPlan from './MedicationPlan';

export default function ResultCard({ data, onReset, fontSizeClass }) {
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
    detalhesReceita
  } = data;

  // Ícones e cores para cada categoria
  const getCategoryConfig = (cat) => {
    switch (cat) {
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

  return (
    <div className={`space-y-6 ${fontSizeClass}`}>
      {/* Barra de Áudio em Destaque no Topo do Resultado */}
      <AudioPlayer textToSpeak={textoParaVoz || resumoSimples} />

      {/* ⚠️ ALERTA DE CONFIANÇA BAIXA / ILEGIBILIDADE */}
      {isLowConfidence && !isOutOfScope && (
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

      {/* CASO ESPECIAL: IMAGEM FORA DO ESCOPO (Selfie, Meme, Animal, Objeto) */}
      {isOutOfScope && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Esta imagem não parece ser um documento
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            {resumoSimples || 'O Tradutor Cidadão foi desenvolvido especificamente para explicar contas públicas (luz, água, telefone), receitas médicas, benefícios sociais e notificações oficiais.'}
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
          
          {/* Cabeçalho do Resultado */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryConfig.bgColor}`}>
                {categoryConfig.icon}
                {categoryConfig.label}
              </span>

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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {tipoDocumento}
            </h2>
          </div>

          {/* 1. O QUE SIGNIFICA (Linguagem Humana e Direta) */}
          <div className="bg-sky-50/70 border-l-4 border-sky-500 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-sky-900 mb-1.5 flex items-center gap-2">
              <span>O que este papel diz:</span>
            </h3>
            <p className="text-slate-800 font-medium text-base sm:text-lg leading-relaxed">
              {resumoSimples}
            </p>
          </div>

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

              {/* B2: Plano de Medicamentos Acessível */}
              <MedicationPlan detalhesReceita={detalhesReceita} fontSizeClass={fontSizeClass} />
            </div>
          )}

          {/* B1: SELO DE VALIDAÇÃO MATEMÁTICA DE CÓDIGO DE BARRAS / BOLETO */}
          {codigoBarrasInfo && codigoBarrasInfo.valido && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 sm:p-4 text-emerald-950 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="font-extrabold text-emerald-950 text-sm sm:text-base flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Valor e Linha Digitável Verificados com Sucesso</span>
                </div>
                <p className="text-emerald-900 leading-relaxed font-medium">
                  {codigoBarrasInfo.mensagem || 'A linha digitável deste boleto/conta foi validada pelos dígitos verificadores oficiais.'}
                </p>
                {codigoBarrasInfo.valorCalculado && (
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-950 text-xs font-extrabold">
                    Valor confirmado pelo código de barras: {codigoBarrasInfo.valorCalculado}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. VALORES E PRAZOS COM AVISO DE CONFERÊNCIA VISUAL */}
          {valoresEPrazos && valoresEPrazos.valorPrincipal && valoresEPrazos.valorPrincipal !== 'Não se aplica' && (
            <div className="space-y-3">
              {/* Aviso destacado de conferência visual no papel original */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-amber-950 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  {valoresEPrazos.avisoConferencia || `Confira sempre no papel: ${valoresEPrazos.valorPrincipal} com vencimento em ${valoresEPrazos.dataVencimento}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Valor */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
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

          {/* 6. AVISO INSTITUCIONAL DE NÃO SUBSTITUIÇÃO DE PROFISSIONAIS (LGPD & ÉTICA) */}
          <ProfessionalDisclaimer className="mt-4" />

          {/* 7. TIRA-DÚVIDAS COM IA (Perguntas e Respostas Acessíveis) */}
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
