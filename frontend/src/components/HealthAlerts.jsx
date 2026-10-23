import React from 'react';
import { Siren, Phone } from 'lucide-react';

/**
 * Caixa de "Sinais de Alerta" para documentos de saúde e odontologia.
 * Indica quando procurar a unidade de saúde, o dentista ou o SAMU (192).
 */
export default function HealthAlerts({ sinaisDeAlerta = [] }) {
  if (!Array.isArray(sinaisDeAlerta) || sinaisDeAlerta.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Sinais de alerta: quando procurar atendimento"
      className="rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 sm:p-5 text-rose-950 space-y-3 shadow-sm"
    >
      <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
        <Siren className="w-6 h-6 text-rose-600 flex-shrink-0" />
        <span>Procure atendimento se acontecer:</span>
      </h3>
      <ul className="space-y-2">
        {sinaisDeAlerta.map((sinal, index) => (
          <li
            key={index}
            className="flex items-start gap-2.5 bg-white/80 border border-rose-200 rounded-xl p-3 text-sm sm:text-base font-semibold leading-snug"
          >
            <span className="text-rose-600 font-black text-lg leading-none mt-0.5">!</span>
            <span>{sinal}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
        <a
          href="tel:192"
          aria-label="Ligar para o SAMU, número 192"
          className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-base shadow-md transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-rose-400"
        >
          <Phone className="w-5 h-5" />
          <span>Emergência: ligar 192 (SAMU)</span>
        </a>
        <span className="text-xs sm:text-sm text-rose-900 font-medium">
          Fora de emergência, procure o seu posto de saúde ou o seu dentista.
        </span>
      </div>
    </div>
  );
}
