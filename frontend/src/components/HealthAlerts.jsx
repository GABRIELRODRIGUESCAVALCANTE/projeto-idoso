import React from 'react';
import { Phone, TriangleAlert } from 'lucide-react';

/**
 * Caixa de "Sinais de Alerta" para documentos de saúde e odontologia.
 * Indica quando procurar a unidade de saúde, o dentista ou o SAMU (192).
 */
export default function HealthAlerts({ sinaisDeAlerta = [] }) {
  if (!Array.isArray(sinaisDeAlerta) || sinaisDeAlerta.length === 0) return null;

  return (
    <section
      aria-label="Sinais de alerta: quando procurar atendimento"
      className="rounded-[1.5rem] bg-rose-50 border border-rose-200 p-4 sm:p-6"
    >
      <h3 className="flex items-center gap-2.5 font-display text-xl font-semibold text-rose-900">
        <TriangleAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
        Procure atendimento se acontecer
      </h3>
      <ul className="mt-4 divide-y divide-rose-200/70">
        {sinaisDeAlerta.map((sinal, index) => (
          <li key={index} className="flex items-start gap-3 py-3 first:pt-0 text-rose-950">
            <span className="w-2 h-2 rounded-full bg-rose-500 mt-2.5 flex-shrink-0" aria-hidden="true" />
            <span>{sinal}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <a
          href="tel:192"
          aria-label="Ligar para o SAMU, número 192"
          className="btn bg-rose-700 hover:bg-rose-800 text-white shadow-soft min-h-[52px]"
        >
          <Phone className="w-5 h-5" />
          Emergência: ligar 192
        </a>
        <span className="text-sm text-rose-900/80">
          Fora de emergência, procure o posto de saúde ou o seu dentista.
        </span>
      </div>
    </section>
  );
}
