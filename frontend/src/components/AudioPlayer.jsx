import React, { useState, useEffect, useMemo } from 'react';
import { Square, Pause, Play, Gauge, AlertCircle } from 'lucide-react';
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
      <div role="status" className="rounded-2xl bg-paper-deep/70 border border-ink/10 p-4 flex items-center gap-3 text-ink-soft">
        <AlertCircle className="w-5 h-5 text-clay-600 flex-shrink-0" />
        <span>Este navegador não lê textos em voz alta. A explicação completa está abaixo.</span>
      </div>
    );
  }

  const isSpeaking = isPlaying && !isPaused;
  const rateLabel = speechRate === 0.8 ? 'Bem devagar' : speechRate === 0.9 ? 'Calma' : 'Normal';

  return (
    <section aria-label="Ouvir a explicação em voz alta" className="rounded-[1.75rem] bg-pine-900 text-white p-5 sm:p-6 shadow-lift">
      <div className="flex items-center gap-4">
        {/* Botão principal grande: tocar / pausar */}
        <button
          onClick={handleTogglePlay}
          aria-label={isSpeaking ? 'Pausar a leitura' : isPaused ? 'Continuar a leitura' : 'Ouvir a explicação'}
          className="relative w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full bg-[#F6F3EE] text-pine-900 flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
        >
          {isSpeaking && <span className="absolute inset-0 rounded-full ring-4 ring-pine-300/50 animate-pulse" aria-hidden="true" />}
          {isSpeaking ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-display text-xl sm:text-2xl font-semibold leading-tight text-white" aria-live="polite">
            {isSpeaking ? 'Lendo para você…' : isPaused ? 'Leitura pausada' : 'Ouvir explicação'}
          </p>
          <p className="text-pine-100/80 mt-0.5">
            {isPlaying ? 'Acompanhe a frase destacada abaixo.' : 'Toque no botão para ouvir em voz alta.'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={toggleRate}
          aria-label={`Velocidade da voz: ${rateLabel}. Toque para mudar.`}
          className="btn btn-sm bg-white/10 hover:bg-white/15 text-white border border-white/15"
        >
          <Gauge className="w-4 h-4" />
          Voz: {rateLabel}
        </button>
        {isPlaying && (
          <button onClick={handleStop} aria-label="Parar a leitura" className="btn btn-sm bg-white/10 hover:bg-white/15 text-white border border-white/15">
            <Square className="w-4 h-4 fill-current" />
            Parar
          </button>
        )}
      </div>

      {!hasPtVoice && (
        <p className="mt-4 flex items-start gap-2 text-sm text-clay-100">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-clay-300" />
          Este aparelho não tem voz em português instalada, então o som pode parecer robótico. Você também pode usar o leitor de tela do celular (TalkBack ou VoiceOver).
        </p>
      )}

      {/* Leitura acompanhada frase a frase (karaokê acessível) */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Texto sendo lido"
        className="mt-4 rounded-2xl bg-black/20 p-4 max-h-52 overflow-y-auto leading-relaxed text-pine-50"
      >
        {sentences.map((sentence, idx) => {
          const isActive = isPlaying && idx === currentSentenceIndex;
          return (
            <span
              key={idx}
              className={`inline mr-1 rounded-md px-1 py-0.5 transition-colors duration-200 box-decoration-clone ${
                isActive ? 'karaoke-active bg-clay-300 text-ink' : isPlaying ? 'text-pine-50/60' : ''
              }`}
            >
              {sentence.text}
            </span>
          );
        })}
      </div>
    </section>
  );
}
