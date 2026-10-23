import React from 'react';
import { Contrast, Minus, Plus } from 'lucide-react';

const FONT_LEVEL_LABELS = ['Normal', 'Média', 'Grande', 'Máxima'];

// Marca do projeto: uma folha de papel com ondas de som, desenhada à mão em SVG
function LogoMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0">
      <rect width="40" height="40" rx="12" className="fill-pine-700" />
      <path d="M12 10.5h10.5l5.5 5.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-14.5a1.5 1.5 0 0 1-1.5-1.5v-17.5a1.5 1.5 0 0 1 1.5-1.5Z" fill="#F6F3EE" />
      <path d="M22.5 10.5v4a1.5 1.5 0 0 0 1.5 1.5h4" fill="none" stroke="#AFD5C7" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.5 20h7M14.5 24h5" stroke="#1A5E4C" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24.5 21.5c1 .8 1 2.2 0 3M26.8 19.8c2 1.8 2 4.7 0 6.5" fill="none" stroke="#C2683C" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Header({
  onIncreaseFont,
  onDecreaseFont,
  fontSizeLevel,
  isHighContrast,
  onToggleHighContrast,
  healthMode = false
}) {
  return (
    <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <a href="#conteudo" className="plain-link flex items-center gap-3 rounded-2xl min-w-0">
          <LogoMark />
          <div className="min-w-0">
            <span className="block font-display text-xl sm:text-2xl font-semibold leading-none text-ink">
              Tradutor Cidadão
            </span>
            <span className="block text-sm text-ink-muted mt-1 truncate">
              {healthMode ? 'Saúde explicada com calma' : 'Papéis do dia a dia, em palavras simples'}
            </span>
          </div>
        </a>

        {/* Ferramentas de leitura: contraste e tamanho da letra */}
        <div className="flex items-center gap-2 w-full sm:w-auto" role="group" aria-label="Ajustes de leitura">
          <button
            onClick={onToggleHighContrast}
            aria-pressed={isHighContrast}
            aria-label={`Alto contraste: ${isHighContrast ? 'ligado' : 'desligado'}`}
            className={`btn btn-sm border flex-shrink-0 ${
              isHighContrast
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink border-ink/15 hover:border-ink/30'
            }`}
          >
            <Contrast className="w-4 h-4" />
            <span className="hidden min-[440px]:inline">Contraste</span>
          </button>

          <div className="flex items-center flex-1 min-w-0 sm:flex-none justify-between rounded-full bg-white border border-ink/15 p-1">
            <button
              onClick={onDecreaseFont}
              disabled={fontSizeLevel <= 0}
              aria-label="Diminuir o tamanho da letra"
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-ink hover:bg-paper disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span aria-live="polite" className="px-1 sm:px-2 sm:min-w-[5.5rem] min-w-0 truncate text-center text-sm font-bold text-ink select-none">
              <span aria-hidden="true" className="hidden sm:inline font-display text-base mr-1">Aa</span>
              {FONT_LEVEL_LABELS[fontSizeLevel] || 'Normal'}
            </span>
            <button
              onClick={onIncreaseFont}
              disabled={fontSizeLevel >= 3}
              aria-label="Aumentar o tamanho da letra"
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-ink hover:bg-paper disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
