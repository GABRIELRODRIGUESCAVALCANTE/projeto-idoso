import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Stethoscope, Scale, ShieldCheck } from 'lucide-react';

export default function ProfessionalDisclaimer({ className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      role="region"
      aria-label="Aviso legal e de responsabilidade"
      className={`rounded-2xl border border-amber-200 bg-amber-50/90 text-amber-950 p-3.5 sm:p-4 shadow-xs ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-amber-900 leading-tight">
              Aviso Importante: Este aplicativo não substitui profissionais
            </h4>
            <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 leading-relaxed">
              O <strong>Tradutor Cidadão</strong> é um projeto educacional de acessibilidade. As explicações de Inteligência Artificial têm caráter estritamente informativo.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 flex-shrink-0 bg-amber-100 hover:bg-amber-200/80 px-2.5 py-1 rounded-xl transition-colors mt-0.5"
        >
          <span>{isExpanded ? 'Menos' : 'Saber mais'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-200/70 text-xs sm:text-sm text-amber-900 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Em documentos de saúde (receitas e exames):</strong> Nunca inicie, altere dosagens ou interrompa medicamentos por conta própria. Consulte sempre o seu <strong>médico</strong> ou esclareça dúvidas com o <strong>farmacêutico</strong> no balcão da farmácia ou posto de saúde (SUS).
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Scale className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Em notificações judiciais ou multas:</strong> Não tome decisões processuais sem assistência jurídica. Procure a <strong>Defensoria Pública do seu Estado</strong>, um <strong>advogado</strong> ou o balcão de atendimento do tribunal competente.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <p>
              Em caso de cobranças indevidas de serviços essenciais (luz, água, gás), faça contato direto com o canal oficial de atendimento ao cliente (0800) da concessionária ou com o PROCON.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
