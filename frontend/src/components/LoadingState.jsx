import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  'Lendo o que está escrito',
  'Trocando palavras difíceis por simples',
  'Preparando a explicação em áudio'
];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);

  // Avança as etapas para mostrar progresso enquanto a leitura acontece
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div role="status" aria-live="polite" className="surface p-6 sm:p-10 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
        {/* Folha sendo "lida" */}
        <div className="relative w-28 h-36 mx-auto sm:mx-0 flex-shrink-0 rounded-2xl bg-paper border border-ink/10 overflow-hidden p-4 space-y-2.5" aria-hidden="true">
          <div className="h-2.5 w-3/4 rounded-full bg-ink/15" />
          <div className="h-2 w-full rounded-full bg-ink/10" />
          <div className="h-2 w-5/6 rounded-full bg-ink/10" />
          <div className="h-2 w-full rounded-full bg-ink/10" />
          <div className="h-2 w-2/3 rounded-full bg-ink/10" />
          <div className="h-2 w-4/5 rounded-full bg-ink/10" />
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-pine-300/0 via-pine-300/40 to-pine-300/0 animate-scan" />
        </div>

        <div className="flex-1">
          <h2 className="section-title">Lendo seu documento…</h2>
          <p className="text-ink-muted mt-1">Isso leva só alguns segundos.</p>
          <ol className="mt-5 space-y-3">
            {STEPS.map((step, index) => {
              const done = index < activeStep;
              const current = index === activeStep;
              return (
                <li key={step} className={`flex items-center gap-3 transition-opacity duration-300 ${index > activeStep ? 'opacity-40' : 'opacity-100'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    done ? 'bg-pine-700 text-white' : current ? 'bg-pine-100 text-pine-800 ring-2 ring-pine-500' : 'bg-paper-deep text-ink-muted'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : index + 1}
                  </span>
                  <span className={current ? 'font-bold text-ink' : 'text-ink-soft'}>{step}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
