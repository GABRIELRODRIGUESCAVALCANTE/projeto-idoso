import React, { useState, useRef, useEffect } from 'react';
import { 
  Headset, 
  X, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  Mic, 
  MicOff, 
  Wrench,
  ShieldCheck,
  Phone,
  User,
  MessageSquare
} from 'lucide-react';
import { speakText } from '../utils/speech';

export default function OpenTicketModal({ 
  isOpen, 
  onClose, 
  documentData, 
  etapasTentadas = [] 
}) {
  const [nomeCliente, setNomeCliente] = useState('');
  const [contato, setContato] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticketResult, setTicketResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setObservacoes((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const tipoProblema = documentData?.tipoDocumento || 'Suporte Técnico Geral';
  const diagnostico = documentData?.diagnosticoTecnico || null;

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Erro ao iniciar reconhecimento de voz:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomeCliente.trim() || !contato.trim()) {
      setError('Por favor, informe seu nome e um telefone ou WhatsApp para contato.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        nomeCliente: nomeCliente.trim(),
        contato: contato.trim(),
        tipoProblema,
        diagnosticoTecnico: diagnostico,
        resumoSimples: documentData?.resumoSimples || '',
        etapasTentadas: Array.isArray(etapasTentadas) ? etapasTentadas : [],
        observacoes: observacoes.trim()
      };

      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Não foi possível registrar o chamado. Tente novamente.');
      }

      setTicketResult(json.ticket);
      speakText(`Chamado aberto com sucesso! Seu protocolo é ${json.ticket.protocolo}. Nossa equipe entrará em contato em breve.`);
    } catch (err) {
      console.error('Erro ao abrir ticket:', err);
      setError(err.message || 'Erro de comunicação ao registrar o chamado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyProtocol = () => {
    if (ticketResult?.protocolo) {
      navigator.clipboard.writeText(ticketResult.protocolo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetAndClose = () => {
    setTicketResult(null);
    setNomeCliente('');
    setContato('');
    setObservacoes('');
    setError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900">
        {/* Botão Fechar */}
        <button
          onClick={handleResetAndClose}
          aria-label="Fechar janela"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CASO: Sucesso com Protocolo */}
        {ticketResult ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Chamado Registrado com Sucesso
              </span>
              <h3 className="font-extrabold text-2xl text-slate-900 mt-2">
                Protocolo do Atendimento
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Guarde este número para acompanhar seu chamado com a equipe.
              </p>
            </div>

            {/* Caixa de Destaque do Protocolo */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-indigo-200 flex items-center justify-between gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-950 tracking-wider">
                {ticketResult.protocolo}
              </span>
              <button
                type="button"
                onClick={handleCopyProtocol}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Sumário do que foi enviado */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left text-xs text-indigo-950 space-y-1.5">
              <p className="font-extrabold flex items-center gap-1.5 text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Diagnóstico Técnico Encaminhado ao Help Desk:
              </p>
              <p><strong>Problema:</strong> {ticketResult.tipoProblema}</p>
              {ticketResult.diagnosticoTecnico?.causaProvavel && (
                <p><strong>Causa Provável:</strong> {ticketResult.diagnosticoTecnico.causaProvavel}</p>
              )}
              {ticketResult.diagnosticoTecnico?.nivelGravidade && (
                <p><strong>Prioridade:</strong> Gravidade {ticketResult.diagnosticoTecnico.nivelGravidade.toUpperCase()}</p>
              )}
              <p className="text-[11px] text-slate-500 pt-1">
                Nossos analistas entrarão em contato pelo telefone <strong>{ticketResult.contato}</strong>.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full min-h-[48px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow transition-all"
            >
              Concluir e Voltar
            </button>
          </div>
        ) : (
          /* CASO: Formulário de Abertura */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow">
                <Headset className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">
                  Abrir Chamado com Suporte Humano
                </h3>
                <p className="text-xs text-slate-600">
                  Transfira seu diagnóstico direto para a fila dos nossos técnicos.
                </p>
              </div>
            </div>

            {/* Resumo do Diagnóstico Automático */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                <span>Diagnóstico Identificado pela IA:</span>
              </div>
              <p className="text-slate-700">
                <strong>Equipamento / Erro:</strong> {tipoProblema}
              </p>
              {diagnostico?.causaProvavel && (
                <p className="text-slate-700">
                  <strong>Causa Provável:</strong> {diagnostico.causaProvavel}
                </p>
              )}
              {etapasTentadas.length > 0 && (
                <p className="text-slate-600 text-[11px]">
                  <strong>Etapas já testadas:</strong> {etapasTentadas.length} passo(s) executado(s) sem sucesso.
                </p>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Inputs do Cliente */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Ex: Maria das Graças Silva"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  Telefone ou WhatsApp para Contato *
                </label>
                <input
                  type="tel"
                  required
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Observações Adicionais (Opcional)
                  </label>
                  {recognitionRef.current && (
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        isListening 
                          ? 'bg-rose-100 text-rose-700 animate-pulse' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3 h-3 text-rose-600" />
                          <span>Ouvindo...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3 text-indigo-600" />
                          <span>Falar por voz</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: A luz começou a piscar ontem após a chuva..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="min-h-[44px] px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-extrabold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md flex items-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-indigo-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registrando chamado...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Chamado com Diagnóstico</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
