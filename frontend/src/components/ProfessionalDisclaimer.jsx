import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

export default function ProfessionalDisclaimer({ className = '', healthMode = false }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div role="region" aria-label="Aviso de responsabilidade" className={`rounded-2xl bg-paper-deep/70 border border-ink/10 ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <Info className="w-5 h-5 text-ink-soft flex-shrink-0" />
        <span className="flex-1 text-ink-soft">
          <strong className="text-ink">Este aplicativo ajuda a entender, mas não substitui profissionais.</strong>
        </span>
        <ChevronDown className={`w-5 h-5 text-ink-muted flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pl-12 space-y-3 text-ink-soft animate-fade-up">
          <p>
            <strong className="text-ink">Saúde:</strong> o aplicativo não faz diagnóstico e não interpreta exames. Nunca comece, mude ou pare um remédio por conta própria. Fale com o seu médico, dentista ou farmacêutico. Em emergência, ligue <strong className="text-ink">192 (SAMU)</strong>.
          </p>
          {!healthMode && (
            <>
              <p>
                <strong className="text-ink">Notificações e multas:</strong> procure a Defensoria Pública, um advogado ou o atendimento do órgão responsável antes de decidir.
              </p>
              <p>
                <strong className="text-ink">Contas de luz, água e gás:</strong> em caso de cobrança indevida, use o canal oficial da empresa ou o PROCON.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
