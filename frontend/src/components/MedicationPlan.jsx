import React from 'react';
import { CheckCircle2, CalendarPlus, ShieldAlert, Clock, Share2 } from 'lucide-react';

/**
 * Mapeia instruções médicas para janelas amigáveis da rotina do idoso.
 */
function sugerirHorariosRotina(instrucao) {
  if (!instrucao || typeof instrucao !== 'string') return null;
  const texto = instrucao.toLowerCase();

  if (/8\s*(?:em\s*8|\/8|h)/.test(texto)) {
    return [
      { horario: '08:00', rotina: 'Café da Manhã' },
      { horario: '16:00', rotina: 'Lanche da Tarde' },
      { horario: '00:00', rotina: 'Ao Deitar' }
    ];
  }

  if (/12\s*(?:em\s*12|\/12|h)/.test(texto)) {
    return [
      { horario: '08:00', rotina: 'Café da Manhã' },
      { horario: '20:00', rotina: 'Jantar' }
    ];
  }

  if (/6\s*(?:em\s*6|\/6|h)/.test(texto)) {
    return [
      { horario: '06:00', rotina: 'Ao Acordar' },
      { horario: '12:00', rotina: 'Almoço' },
      { horario: '18:00', rotina: 'Final da Tarde' },
      { horario: '00:00', rotina: 'Madrugada' }
    ];
  }

  if (/noite|deitar|jantar|dormir/.test(texto)) {
    return [{ horario: '21:00', rotina: 'À Noite (após jantar ou ao deitar)' }];
  }

  if (/manh[aã]|jejum|acordar|caf[eé]/.test(texto)) {
    return [{ horario: '08:00', rotina: 'Pela Manhã (com água)' }];
  }

  if (/almo[cç]o/.test(texto)) {
    return [{ horario: '12:30', rotina: 'Junto ao Almoço' }];
  }

  return null;
}

export default function MedicationPlan({ detalhesReceita }) {
  if (!detalhesReceita) return null;

  const medicamentos = Array.isArray(detalhesReceita.medicamentosIdentificados)
    ? detalhesReceita.medicamentosIdentificados
    : [];

  const temIlegivel = Boolean(detalhesReceita.possuiTrechoIlegivel);

  if (medicamentos.length === 0 && !temIlegivel) return null;

  // Gera arquivo de calendário (.ics) simples para o celular do cidadão/cuidador
  const handleDownloadReminder = (med) => {
    const title = `Tomar remédio: ${med.nome} (${med.dosagem})`;
    const description = `Instruções: ${med.instrucao}. Lembrete do Tradutor Cidadão.`;
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tradutor de Saude//Lembrete//PT',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${new Date(Date.now() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'RRULE:FREQ=DAILY;COUNT=14',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lembrete_${med.nome.toLowerCase().replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Envia lista completa para o WhatsApp de familiares/cuidadores
  const handleShareWhatsApp = () => {
    const linhas = [
      '💊 *Plano de Medicamentos - Tradutor Cidadão*',
      'Confira os horários e remédios identificados na receita:\n'
    ];

    medicamentos.forEach((m, idx) => {
      const rotina = sugerirHorariosRotina(m.instrucao);
      const rotinaTexto = rotina ? ` (Horários sugeridos: ${rotina.map(r => `${r.horario} - ${r.rotina}`).join(' | ')})` : '';
      linhas.push(`${idx + 1}. *${m.nome}* (${m.dosagem || 'dose sob prescrição'})\n   👉 ${m.instrucao}${rotinaTexto}\n`);
    });

    if (temIlegivel) {
      linhas.push('⚠️ *Atenção:* Há trechos ilegíveis nesta receita. Confirme com o farmacêutico no balcão antes de tomar!');
    }

    linhas.push('Organizado com o app acessível Tradutor Cidadão.');

    const mensagemUrl = encodeURIComponent(linhas.join('\n'));
    window.open(`https://wa.me/?text=${mensagemUrl}`, '_blank');
  };

  return (
    <div className="rounded-[1.5rem] border border-ink/10 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-pine-50">
        <div>
          <h3 className="font-display text-xl font-semibold text-pine-950">Seus remédios e horários</h3>
          <p className="text-pine-900/80 text-sm mt-0.5">Horários sugeridos para a rotina. Confirme com quem receitou.</p>
        </div>
        {medicamentos.length > 0 && (
          <button
            type="button"
            onClick={handleShareWhatsApp}
            aria-label="Enviar a lista de remédios pelo WhatsApp"
            className="btn-secondary btn-sm self-start sm:self-auto"
          >
            <Share2 className="w-4 h-4 text-pine-700" />
            Enviar ao cuidador
          </button>
        )}
      </div>

      {temIlegivel && (
        <p className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-amber-950 text-sm">
          <strong>Atenção:</strong> parte da receita está ilegível ou rasurada. Leve a receita ao farmacêutico para conferir.
        </p>
      )}

      {medicamentos.length > 0 ? (
        <ul className="divide-y divide-ink/10 bg-white">
          {medicamentos.map((med, index) => {
            const isLegivel = med.legivel !== false;
            const horariosSugeridos = sugerirHorariosRotina(med.instrucao);

            return (
              <li key={index} className={`p-4 sm:p-5 space-y-3 ${isLegivel ? '' : 'bg-rose-50/60'}`}>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-bold text-lg text-ink">{med.nome}</span>
                  {med.dosagem && <span className="text-ink-muted">{med.dosagem}</span>}
                  <span className={`ml-auto chip text-xs ${isLegivel ? 'bg-pine-50 text-pine-800' : 'bg-rose-100 text-rose-800'}`}>
                    {isLegivel ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {isLegivel ? 'Lido com clareza' : 'Confirmar na farmácia'}
                  </span>
                </div>
                <p className="text-ink-soft">{med.instrucao || 'Conforme a orientação da receita.'}</p>

                {horariosSugeridos && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Clock className="w-4 h-4 text-pine-700" aria-hidden="true" />
                    {horariosSugeridos.map((h, hIdx) => (
                      <span key={hIdx} className="inline-flex items-baseline gap-1.5 rounded-xl bg-paper px-3 py-1.5 text-sm">
                        <strong className="text-ink tabular-nums">{h.horario}</strong>
                        <span className="text-ink-muted">{h.rotina}</span>
                      </span>
                    ))}
                  </div>
                )}

                {isLegivel && (
                  <button
                    type="button"
                    onClick={() => handleDownloadReminder(med)}
                    className="btn-quiet btn-sm -ml-3"
                    aria-label={`Criar lembrete diário no celular para ${med.nome}`}
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Criar lembrete no celular
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="p-5 bg-white text-ink-muted">Nenhum remédio pôde ser lido com clareza suficiente.</p>
      )}
    </div>
  );
}
