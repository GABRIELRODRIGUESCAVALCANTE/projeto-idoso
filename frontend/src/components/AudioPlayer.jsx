import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, VolumeX, Pause, Play, Gauge, AlertCircle, Sparkles } from 'lucide-react';
import { speechController } from '../utils/speech';

export default function AudioPlayer({ textToSpeak }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9); // Ritmo mais calmo por padrão
  const [supported, setSupported] = useState(true);
  const [hasPtVoice, setHasPtVoice] = useState(true);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Divide o texto em sentenças para permitir o destaque frase a frase (efeito karaokê)
  const sentences = useMemo(() => {
    if (!textToSpeak) return [];
    // Divide por pontuações de fim de frase mantendo a pontuação
    const matches = textToSpeak.match(/[^.!?]+[.!?]+|\S+$/g) || [textToSpeak];
    let runningIndex = 0;
    return matches.map((sentence) => {
      const trimmed = sentence.trim();
      const start = textToSpeak.indexOf(trimmed, runningIndex);
      const end = start + trimmed.length;
      runningIndex = end;
      return {
        text: trimmed,
        start,
        end
      };
    });
  }, [textToSpeak]);

  // Identifica a sentença atual com base no charIndex emitido pelo evento boundary
  const currentSentenceIndex = useMemo(() => {
    if (!isPlaying || currentCharIndex <= 0) return 0;
    const foundIndex = sentences.findIndex(
      (s) => currentCharIndex >= s.start && currentCharIndex <= s.end + 5
    );
    return foundIndex !== -1 ? foundIndex : 0;
  }, [currentCharIndex, sentences, isPlaying]);

  useEffect(() => {
    setSupported(speechController.isSupported());
    // Verifica disponibilidade de vozes pt-BR
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const checkVoice = () => {
        setHasPtVoice(speechController.hasPtBrVoice());
      };
      checkVoice();
      window.speechSynthesis.onvoiceschanged = checkVoice;
    }

    return () => {
      speechController.stop();
    };
  }, [textToSpeak]);

  const handleTogglePlay = () => {
    if (!textToSpeak) return;

    if (isPlaying && !isPaused) {
      speechController.pause();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      speechController.resume();
      setIsPaused(false);
    } else {
      setCurrentCharIndex(0);
      speechController.speak(textToSpeak, {
        rate: speechRate,
        onStart: ({ hasPtVoice: found }) => {
          setIsPlaying(true);
          setIsPaused(false);
          setHasPtVoice(found);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentCharIndex(0);
        },
        onError: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentCharIndex(0);
        },
        onBoundary: ({ charIndex }) => {
          setCurrentCharIndex(charIndex);
        }
      });
    }
  };

  const handleStop = () => {
    speechController.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentCharIndex(0);
  };

  const toggleRate = () => {
    const nextRate = speechRate === 0.9 ? 1.05 : speechRate === 1.05 ? 0.8 : 0.9;
    setSpeechRate(nextRate);
    if (isPlaying) {
      speechController.stop();
      speechController.speak(textToSpeak, {
        rate: nextRate,
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          setCurrentCharIndex(0);
        },
        onError: () => {
          setIsPlaying(false);
          setCurrentCharIndex(0);
        },
        onBoundary: ({ charIndex }) => {
          setCurrentCharIndex(charIndex);
        }
      });
      setIsPaused(false);
    }
  };

  if (!supported) {
    return (
      <div role="status" className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs sm:text-sm mb-6 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <span>Seu navegador não possui sintetizador de áudio automático. Você pode ler a explicação na tela.</span>
      </div>
    );
  }

  return (
    <section
      aria-label="Reprodutor de Leitura em Voz Alta Acessível"
      className="bg-gradient-to-r from-sky-700 to-indigo-800 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-sky-900/20 mb-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Descrição e Status (com aria-live para leitor de tela) */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
              isPlaying && !isPaused ? 'bg-emerald-400 text-emerald-950 animate-pulse' : 'bg-white/20 text-white'
            }`}
          >
            <Volume2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black leading-tight" aria-live="polite">
              {isPlaying ? (isPaused ? 'Áudio Pausado' : 'Lendo em Voz Alta para Você...') : 'Ouvir a Explicação em Áudio'}
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 font-medium">
              {isPlaying
                ? 'Acompanhe as frases destacadas na caixa abaixo'
                : 'Ideal para idosos ou para quem prefere escutar em vez de ler'}
            </p>
          </div>
        </div>

        {/* Controles de Reprodução (Alvos de Toque >= 44px com Ícone + Texto) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
          {/* Botão de Velocidade */}
          <button
            onClick={toggleRate}
            aria-label={`Velocidade da voz: ${speechRate === 0.8 ? 'Bem Lento' : speechRate === 0.9 ? 'Ritmo Calmo' : 'Mais Rápido'}. Toque para alterar.`}
            className="min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-extrabold flex items-center gap-2 transition-all border border-white/10 focus-visible:ring-4 focus-visible:ring-amber-300"
          >
            <Gauge className="w-4 h-4" />
            <span>{speechRate === 0.8 ? 'Voz Bem Lenta' : speechRate === 0.9 ? 'Voz Calma' : 'Voz Rápida'}</span>
          </button>

          {/* Botão Principal Play / Pause */}
          <button
            onClick={handleTogglePlay}
            aria-label={isPlaying && !isPaused ? 'Pausar leitura de áudio' : 'Ouvir explicação agora'}
            className={`min-h-[44px] px-5 py-3 rounded-2xl font-black text-sm sm:text-base shadow-md flex items-center gap-2 transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-amber-300 ${
              isPlaying && !isPaused
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                : 'bg-white text-sky-950 hover:bg-sky-50'
            }`}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{isPaused ? 'Continuar Ouvindo' : 'Ouvir Agora'}</span>
              </>
            )}
          </button>

          {/* Botão Parar / Reset (com ícone + texto) */}
          {isPlaying && (
            <button
              onClick={handleStop}
              aria-label="Parar leitura em áudio"
              className="min-h-[44px] px-4 py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-rose-300"
            >
              <VolumeX className="w-4 h-4" />
              <span>Parar</span>
            </button>
          )}
        </div>
      </div>

      {/* ⚠️ Alerta de voz pt-BR ausente no aparelho */}
      {!hasPtVoice && (
        <div className="mt-3 p-3 bg-amber-500/20 border border-amber-300/40 rounded-xl text-xs text-amber-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-300 mt-0.5" />
          <span>
            Seu celular ou computador não possui uma voz em português brasileiro instalada no sistema. O som pode soar mais mecânico. Você pode acompanhar a leitura destacada abaixo ou utilizar o leitor de tela nativo (TalkBack no Android / VoiceOver no iOS).
          </span>
        </div>
      )}

      {/* 📖 CONTROLE DE LEITURA GUIADA POR TRECHO (KARAOKÊ ACESSÍVEL) */}
      <div className="mt-4 pt-3.5 border-t border-white/15">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-sky-200 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Acompanhe a Leitura (Frase por Frase):</span>
        </div>

        <div
          role="region"
          aria-live="polite"
          aria-label="Texto falado em tempo real"
          className="bg-black/25 rounded-2xl p-4 text-sm sm:text-base leading-relaxed text-slate-100 border border-white/10 max-h-48 overflow-y-auto space-y-1.5"
        >
          {sentences.map((sentence, idx) => {
            const isActive = isPlaying && idx === currentSentenceIndex;
            return (
              <span
                key={idx}
                className={`inline-block mr-1.5 transition-all duration-200 rounded-lg px-1.5 py-0.5 ${
                  isActive
                    ? 'bg-amber-300 text-slate-950 font-black shadow-md scale-[1.02] ring-2 ring-amber-400'
                    : 'text-slate-100 opacity-90'
                }`}
              >
                {sentence.text}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
