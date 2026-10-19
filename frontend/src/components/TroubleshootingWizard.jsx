import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Timer, 
  ArrowRight, 
  ArrowLeft, 
  Wrench, 
  Headset, 
  ThumbsUp, 
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

export default function TroubleshootingWizard({ 
  acoes = [], 
  diagnosticoTecnico = null, 
  onOpenTicket, 
  onClose,
  fontSizeClass 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [resolvedStatus, setResolvedStatus] = useState(null); // 'resolved' | 'unresolved' | 'check' | null
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Estados de Temporizador
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  const steps = Array.isArray(acoes) && acoes.length > 0 
    ? acoes 
    : ['Verifique as conexões do aparelho e reinicie na tomada.'];

  const currentStepText = steps[currentStep] || '';

  // Detecta se a etapa atual sugere aguardar determinado tempo (ex: "20 segundos")
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    clearInterval(timerIntervalRef.current);
    setTimerRunning(false);

    const match = currentStepText.match(/(\d+)\s*(segundos|seg|minutos|min)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const totalSec = unit.startsWith('min') ? num * 60 : num;
      setTimerSeconds(Math.min(300, Math.max(5, totalSec)));
    } else {
      setTimerSeconds(0);
    }

    return () => {
      clearInterval(timerIntervalRef.current);
      stopSpeaking();
    };
  }, [currentStep, currentStepText]);

  // Contagem regressiva do temporizador
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            speakText('Tempo concluído! Prossiga para a próxima etapa.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning, timerSeconds]);

  // Leitura por voz do passo atual
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(`Passo ${currentStep + 1}: ${currentStepText}`, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setResolvedStatus('check');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    const match = currentStepText.match(/(\d+)\s*(segundos|seg|minutos|min)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      setTimerSeconds(unit.startsWith('min') ? num * 60 : num);
    }
  };

  return (
    <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/70 to-white p-5 sm:p-7 shadow-lg my-6 text-slate-900 transition-all">
      {/* Cabeçalho do Wizard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-indigo-950 flex items-center gap-2">
              Assistente de Resolução Guiada
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                Passo a Passo
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-indigo-800 font-medium">
              Siga as instruções com calma para tentar resolver sem espera.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 self-end sm:self-center px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Fechar Guia
          </button>
        )}
      </div>

      {/* CASO: Pergunta de Sucesso após as etapas */}
      {resolvedStatus === 'check' && (
        <div className="p-6 rounded-2xl bg-white border border-indigo-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <ThumbsUp className="w-8 h-8" />
          </div>
          <h4 className="font-extrabold text-xl text-slate-900">
            Você concluiu todas as etapas!
          </h4>
          <p className="text-base text-slate-600 max-w-md mx-auto">
            Verifique agora se o aparelho normalizou ou se a mensagem de erro sumiu.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setResolvedStatus('resolved')}
              className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Sim, voltou a funcionar! 🎉</span>
            </button>
            <button
              onClick={() => {
                setResolvedStatus('unresolved');
                if (onOpenTicket) onOpenTicket(steps);
              }}
              className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Headset className="w-5 h-5" />
              <span>Ainda não funcionou (Chamar Suporte)</span>
            </button>
          </div>
        </div>
      )}

      {/* CASO: Problema Resolvido */}
      {resolvedStatus === 'resolved' && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-extrabold text-xl text-emerald-950">
            Excelente! Problema resolvido com sucesso!
          </h4>
          <p className="text-sm text-emerald-900 max-w-md mx-auto">
            Você conseguiu restabelecer a conexão sem precisar aguardar na fila de suporte. Parabéns!
          </p>
          <button
            onClick={() => {
              setResolvedStatus(null);
              setCurrentStep(0);
              setCompletedSteps([]);
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 mt-2 underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar teste de passos
          </button>
        </div>
      )}

      {/* CASO: Problema Persiste -> Sugestão Imediata de Ticket */}
      {resolvedStatus === 'unresolved' && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-500 text-white mx-auto flex items-center justify-center shadow">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h4 className="font-extrabold text-xl text-amber-950">
            Tudo bem, nossa equipe técnica está pronta para ajudar!
          </h4>
          <p className="text-sm text-amber-900 max-w-md mx-auto">
            Já registramos o diagnóstico das luzes e os testes que você executou. O atendente receberá essas informações para agir rapidamente.
          </p>
          <button
            onClick={() => onOpenTicket && onOpenTicket(steps)}
            className="min-h-[48px] px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow flex items-center justify-center gap-2 mx-auto"
          >
            <Headset className="w-4 h-4" />
            <span>Abrir Chamado com Suporte Humano</span>
          </button>
        </div>
      )}

      {/* CASO: Navegação normal do passo atual */}
      {resolvedStatus === null && (
        <div className="space-y-5">
          {/* Barra de Progresso Superior */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-indigo-900">
              <span>Etapa {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% concluído</span>
            </div>
            <div className="w-full h-2.5 bg-indigo-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Cartão da Etapa Ativa */}
          <div className="p-5 sm:p-7 rounded-2xl bg-white border border-indigo-100 shadow-sm relative">
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 font-extrabold text-xs">
                Passo {currentStep + 1}
              </span>

              {/* Botão de Ouvir Passo Atual */}
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-colors ${
                  isSpeaking
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                }`}
                title="Ouvir instrução deste passo em voz alta"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-700" />
                    <span>Pausar voz</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-indigo-700" />
                    <span>Ouvir este passo</span>
                  </>
                )}
              </button>
            </div>

            {/* Texto Grande e Acessível do Passo */}
            <p className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-relaxed my-2">
              {currentStepText}
            </p>

            {/* Temporizador Guiado (Se o passo recomendar contagem regressiva) */}
            {timerSeconds > 0 && (
              <div className="mt-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase text-amber-900 block">
                      Temporizador Recomendado
                    </span>
                    <span className="text-2xl font-black text-amber-950 font-mono">
                      {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                      {String(timerSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleTimer}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow"
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Iniciar Contagem</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetTimer}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-xs"
                    title="Reiniciar tempo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação Inferiores */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`min-h-[48px] w-full sm:w-auto px-5 py-2.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                currentStep === 0 
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400' 
                  : 'bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-sm'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Etapa Anterior</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleNextStep}
                className="min-h-[48px] w-full sm:w-auto px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-indigo-400"
              >
                <span>{currentStep === steps.length - 1 ? 'Concluir Verificação' : 'Próxima Etapa'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
