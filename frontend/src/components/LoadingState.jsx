import React from 'react';
import { Eye, Sparkles } from 'lucide-react';

export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="bg-white rounded-3xl border border-sky-100 shadow-md p-8 sm:p-12 text-center my-6"
    >
      <div className="relative w-20 h-20 mx-auto mb-6">
        {/* Anéis de pulso de carregamento */}
        <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
          <Eye className="w-10 h-10 animate-bounce" />
        </div>
        <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
        Lendo seu documento com carinho...
      </h3>
      <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
        A inteligência artificial está identificando as letras, valores e tirando todas as palavras difíceis para você.
      </p>

      {/* Dicas rotativas enquanto carrega */}
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 text-xs sm:text-sm font-medium border border-sky-200">
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
        Leva apenas alguns segundos...
      </div>
    </div>
  );
}
