import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DEMO_PRESETS } from '../utils/demoData';
import { getCategoryMeta } from '../utils/categoryMeta';

/**
 * Exemplos prontos (sem foto e sem internet) para apresentar o aplicativo.
 * No celular viram uma faixa de cartões com rolagem lateral; no computador, uma grade.
 */
export default function DemoExamples({ presetKeys = [], onSelectDemo }) {
  if (!onSelectDemo || presetKeys.length === 0) return null;

  return (
    <section aria-labelledby="exemplos-titulo" className="space-y-4">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h2 id="exemplos-titulo" className="section-title">Experimente com um exemplo</h2>
          <p className="text-ink-muted mt-1">Documentos fictícios. Funcionam mesmo sem internet.</p>
        </div>
      </div>

      <ul className="no-scrollbar -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
        {presetKeys.map((key) => {
          const preset = DEMO_PRESETS[key];
          if (!preset) return null;
          const { icon: Icon, toneClasses } = getCategoryMeta(preset.categoria);

          return (
            <li key={key} className="snap-start flex-shrink-0 w-[72%] min-[480px]:w-[55%] sm:w-auto">
              <button
                type="button"
                onClick={() => onSelectDemo(key)}
                className="group w-full h-full text-left surface p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${toneClasses.icon}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-ink leading-snug">{preset.titulo}</span>
                  <span className="block text-sm text-ink-muted mt-1 leading-snug">{preset.descricao}</span>
                </span>
                <ArrowRight className="hidden sm:block w-5 h-5 text-ink/30 mt-0.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-pine-700" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
