import React from 'react';
import { Pill, AlertTriangle, CheckCircle, Calendar, ShieldAlert, Clock, Share2 } from 'lucide-react';

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

export default function MedicationPlan({ detalhesReceita, fontSizeClass = '' }) {
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
    <div className="mt-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-extrabold text-emerald-950">
              Plano Acessível de Medicamentos Identificados
            </h4>
            <p className="text-xs sm:text-sm text-emerald-800">
              Confira a lista dos remédios lidos na receita médica e os horários da rotina
            </p>
          </div>
        </div>

        {medicamentos.length > 0 && (
          <button
            type="button"
            onClick={handleShareWhatsApp}
            aria-label="Compartilhar lista de remédios com o cuidador no WhatsApp"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all self-start sm:self-auto focus-visible:ring-4 focus-visible:ring-emerald-500"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>
        )}
      </div>

      {temIlegivel && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 flex items-start gap-2.5 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Atenção Crítica de Saúde:</strong>
            Há trecho de caligrafia ilegível ou rasurado na receita. Por segurança, o sistema nunca tenta adivinhar. Leve a receita física para conferência obrigatória com o farmacêutico no balcão!
          </div>
        </div>
      )}

      {medicamentos.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {medicamentos.map((med, index) => {
            const isLegivel = med.legivel !== false;
            const horariosSugeridos = sugerirHorariosRotina(med.instrucao);

            return (
              <div
                key={index}
                className={`p-3.5 sm:p-4 rounded-xl border bg-white shadow-xs transition-all ${
                  isLegivel ? 'border-emerald-200' : 'border-rose-300 bg-rose-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                        {med.nome}
                      </span>
                      {med.dosagem && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                          {med.dosagem}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <strong>Como tomar:</strong> {med.instrucao || 'Conforme orientação médica no rótulo.'}
                    </p>

                    {/* Janelas Humanizadas da Rotina */}
                    {horariosSugeridos && (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3 text-emerald-600" /> Horários sugeridos para sua rotina:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {horariosSugeridos.map((h, hIdx) => (
                            <span
                              key={hIdx}
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1"
                            >
                              <strong>{h.horario}</strong> ({h.rotina})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isLegivel ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Lido com certeza
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full flex-shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Trecho com dúvida
                    </span>
                  )}
                </div>

                {isLegivel && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDownloadReminder(med)}
                      className="min-h-[44px] px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors focus-visible:ring-4 focus-visible:ring-emerald-500"
                      aria-label={`Adicionar lembrete no calendário para ${med.nome}`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Salvar lembrete diário (.ics)</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-slate-600 italic">
          Nenhum medicamento específico pôde ser extraído com 100% de clareza visual.
        </p>
      )}
    </div>
  );
}
