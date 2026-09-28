import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Check, X, HelpCircle, ExternalLink } from 'lucide-react';

export default function ConsentModal({ isOpen, onClose, onAccept, onOpenDemo }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-5 sm:p-6 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 id="consent-title" className="text-xl sm:text-2xl font-black leading-tight">
                Privacidade & Uso de Inteligência Artificial
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 font-medium mt-0.5">
                Leia com atenção antes de enviar a foto do seu documento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar aviso de consentimento"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors focus-visible:ring-4 focus-visible:ring-amber-300"
          >
            <X className="w-4 h-4" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Corpo do Aviso em Linguagem Clara e Acessível */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Item 1: Envio para IA de Terceiros */}
          <div className="flex items-start gap-3 bg-sky-50/70 border border-sky-100 p-3.5 sm:p-4 rounded-2xl">
            <Sparkles className="w-6 h-6 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sky-950 text-base">
                1. Envio para serviço de IA de terceiros (Google)
              </h3>
              <p className="text-slate-700 text-xs sm:text-sm mt-1">
                Para ler letras ilegíveis, termos jurídicos ou médicos, a foto do seu documento é transmitida de forma criptografada para a ferramenta de <strong>Inteligência Artificial do Google (Gemini)</strong> processar o texto.
              </p>
            </div>
          </div>

          {/* Item 2: Dados Sensíveis e LGPD */}
          <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200/80 p-3.5 sm:p-4 rounded-2xl">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-amber-950 text-base">
                2. Atenção a Dados Pessoais Sensíveis (LGPD art. 5º, II)
              </h3>
              <p className="text-slate-700 text-xs sm:text-sm mt-1">
                Receitas médicas e notificações judiciais contêm informações íntimas sobre sua saúde ou vida civil. No plano de testes do Google Gemini, dados enviados podem ser avaliados para aprimorar os modelos do provedor. <strong>Se você não desejar compartilhar essa imagem com a IA do Google, não envie a foto.</strong>
              </p>
            </div>
          </div>

          {/* Item 3: Nosso Servidor */}
          <div className="flex items-start gap-3 bg-emerald-50/70 border border-emerald-100 p-3.5 sm:p-4 rounded-2xl">
            <Check className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-emerald-950 text-base">
                3. O que acontece no nosso servidor?
              </h3>
              <p className="text-slate-700 text-xs sm:text-sm mt-1">
                A aplicação <strong>não salva sua foto em disco rígido nem cria cadastros</strong>. O processamento no nosso servidor ocorre exclusivamente na memória temporária (RAM) e é descartado assim que a explicação é entregue.
              </p>
            </div>
          </div>

          {/* Item 4: Isenção de responsabilidade profissional */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-600">
            <strong>Lembrete importante:</strong> Este aplicativo é um facilitador educacional e <u>não substitui</u> profissionais qualificados (médicos, farmacêuticos, advogados ou defensores públicos).
          </div>
        </div>

        {/* Rodapé e Botões de Decisão */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onAccept}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Check className="w-5 h-5" />
            <span>Li e autorizo o envio para a IA</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenDemo) onOpenDemo();
            }}
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Ver Exemplo sem Enviar Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
