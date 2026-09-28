import React from 'react';
import { BookOpenText, Sparkles, HeartHandshake, Contrast, ZoomIn, ZoomOut, ShieldCheck } from 'lucide-react';

export default function Header({
  onIncreaseFont,
  onDecreaseFont,
  fontSizeLevel,
  onOpenPrivacy,
  isHighContrast,
  onToggleHighContrast
}) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-sky-600/20 flex-shrink-0">
              <BookOpenText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Tradutor Cidadão
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3" /> IA Acessível
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Burocracia e Saúde explicados de forma simples e humana
              </p>
            </div>
          </div>

          {/* Barra de Acessibilidade (Alto Contraste + Zoom Real A- / A+) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Botão de Alto Contraste (Ícone + Texto) */}
            <button
              onClick={onToggleHighContrast}
              aria-pressed={isHighContrast}
              aria-label={`Modo Alto Contraste: ${isHighContrast ? 'Ativado' : 'Desativado'}. Toque para alternar.`}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-bold rounded-2xl border flex items-center gap-1.5 transition-all shadow-xs focus-visible:ring-4 focus-visible:ring-sky-500 ${
                isHighContrast
                  ? 'bg-black text-amber-300 border-amber-300 ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
              }`}
            >
              <Contrast className="w-4 h-4" />
              <span>Contraste</span>
            </button>

            {/* Controles de Tamanho de Fonte (Ícone + Texto) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-300 flex-shrink-0 shadow-xs">
              <button
                onClick={onDecreaseFont}
                disabled={fontSizeLevel <= 0}
                title="Diminuir tamanho da letra"
                aria-label="Diminuir tamanho da letra"
                className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-black rounded-xl text-slate-800 hover:bg-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1 focus-visible:ring-4 focus-visible:ring-sky-500"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span>A-</span>
              </button>

              <span
                aria-live="polite"
                className="text-[11px] font-extrabold text-slate-700 px-2 min-w-[56px] text-center select-none"
              >
                {fontSizeLevel === 0 ? 'Normal' : fontSizeLevel === 1 ? 'Média' : fontSizeLevel === 2 ? 'Grande' : 'Máxima'}
              </span>

              <button
                onClick={onIncreaseFont}
                disabled={fontSizeLevel >= 3}
                title="Aumentar tamanho da letra"
                aria-label="Aumentar tamanho da letra"
                className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-black rounded-xl text-slate-800 hover:bg-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1 focus-visible:ring-4 focus-visible:ring-sky-500"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>A+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Faixa de Extensão Universitária e Privacidade */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
            Projeto de Extensão Universitária • Impacto Social Gratuito
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-slate-500">
              Processamento temporário em RAM
            </span>
            <button
              onClick={onOpenPrivacy}
              className="min-h-[44px] text-xs font-bold text-sky-800 hover:text-sky-950 underline flex items-center gap-1.5 focus-visible:ring-4 focus-visible:ring-sky-500 rounded-lg px-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacidade & IA (LGPD)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
