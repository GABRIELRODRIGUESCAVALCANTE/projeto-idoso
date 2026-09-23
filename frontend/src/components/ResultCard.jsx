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
  Users
} from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import DocumentQA from './DocumentQA';

export default function ResultCard({ data, onReset, fontSizeClass }) {
  if (!data) return null;

  const {
    categoria,
    tipoDocumento,
    resumoSimples,
    acoesEssenciais = [],
    valoresEPrazos = {},
    pontosDeAtencao = [],
    alertaEtico,
    textoParaVoz
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
      default:
        return {
          icon: <FileText className="w-5 h-5 text-sky-600" />,
          label: 'Documento Geral',
          bgColor: 'bg-sky-50 border-sky-200 text-sky-800'
        };
    }
  };

  const categoryConfig = getCategoryConfig(categoria);

  return (
    <div className={`space-y-6 ${fontSizeClass}`}>
      {/* Barra de Áudio em Destaque no Topo do Resultado */}
      <AudioPlayer textToSpeak={textoParaVoz || resumoSimples} />

      {/* Cartão Principal */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
        
        {/* Cabeçalho do Resultado */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryConfig.bgColor}`}>
              {categoryConfig.icon}
              {categoryConfig.label}
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

        {/* 2. VALORES E PRAZOS (Cards de Visualização Rápida) */}
        {valoresEPrazos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valor */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Valor a Pagar / Quantia</span>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {valoresEPrazos.valorPrincipal || 'Não se aplica'}
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

        {/* 5. AVISO ÉTICO E DE SEGURANÇA */}
        {alertaEtico && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              <strong>Nota de responsabilidade:</strong> {alertaEtico}
            </p>
          </div>
        )}

        {/* 6. TIRA-DÚVIDAS COM IA (Perguntas e Respostas Acessíveis) */}
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
    </div>
  );
}
