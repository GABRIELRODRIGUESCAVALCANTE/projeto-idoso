import React from 'react';
import { BookOpenText, Sparkles, HeartHandshake } from 'lucide-react';

export default function Header({ onIncreaseFont, onDecreaseFont, fontSizeLevel }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20 flex-shrink-0">
              <BookOpenText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Tradutor Cidadão
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" /> IA Acessível
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Burocracia e Saúde explicados de forma simples e humana
              </p>
            </div>
          </div>

          {/* Controles de Acessibilidade (Tamanho do Texto / Zoom Real) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-shrink-0 shadow-xs">
            <button
              onClick={onDecreaseFont}
              disabled={fontSizeLevel <= 0}
              title="Diminuir tamanho da letra"
              aria-label="Diminuir tamanho da letra"
              className="px-3 py-1.5 text-xs font-black rounded-xl text-slate-700 hover:bg-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
            >
              A-
            </button>
            <span className="text-[11px] font-bold text-slate-600 px-2 min-w-[56px] text-center select-none">
              {fontSizeLevel === 0 ? 'Normal' : fontSizeLevel === 1 ? 'Média' : fontSizeLevel === 2 ? 'Grande' : 'Máxima'}
            </span>
            <button
              onClick={onIncreaseFont}
              disabled={fontSizeLevel >= 3}
              title="Aumentar tamanho da letra"
              aria-label="Aumentar tamanho da letra"
              className="px-3 py-1.5 text-xs font-black rounded-xl text-slate-700 hover:bg-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
            >
              A+
            </button>
          </div>
        </div>

        {/* Faixa de Extensão Universitária */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
            Projeto de Extensão Universitária • Impacto Social Gratuito
          </span>
          <span className="hidden md:inline text-slate-400">
            100% confidencial: nada é guardado
          </span>
        </div>
      </div>
    </header>
  );
}
