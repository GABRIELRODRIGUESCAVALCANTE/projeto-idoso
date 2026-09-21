import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Gauge } from 'lucide-react';
import { speechController } from '../utils/speech';

export default function AudioPlayer({ textToSpeak }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9); // Ritmo mais calmo por padrão
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(speechController.isSupported());

    // Para o áudio se o componente for desmontado ou o texto mudar
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
      speechController.speak(textToSpeak, {
        rate: speechRate,
        onStart: () => {
          setIsPlaying(true);
          setIsPaused(false);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
        onError: () => {
          setIsPlaying(false);
          setIsPaused(false);
        }
      });
    }
  };

  const handleStop = () => {
    speechController.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const toggleRate = () => {
    const nextRate = speechRate === 0.9 ? 1.05 : speechRate === 1.05 ? 0.8 : 0.9;
    setSpeechRate(nextRate);
    if (isPlaying) {
      // Reinicia com o novo ritmo
      speechController.stop();
      speechController.speak(textToSpeak, {
        rate: nextRate,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
      setIsPaused(false);
    }
  };

  if (!supported) {
    return (
      <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
        Seu navegador não suporta leitura de áudio automática.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-sky-600/20 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Descrição e Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isPlaying && !isPaused ? 'bg-emerald-400 text-emerald-950 animate-pulse' : 'bg-white/20 text-white'}`}>
            {isPlaying && !isPaused ? <Volume2 className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold leading-tight">
              {isPlaying ? (isPaused ? 'Áudio Pausado' : 'Falando em Voz Alta...') : 'Ouvir Explicação em Áudio'}
            </h4>
            <p className="text-xs sm:text-sm text-sky-100 font-normal">
              {isPlaying
                ? 'Você pode pausar ou reiniciar a qualquer momento'
                : 'Ideal para quem prefere escutar em vez de ler'}
            </p>
          </div>
        </div>

        {/* Controles de Reprodução */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Botão de Velocidade */}
          <button
            onClick={toggleRate}
            title="Alterar velocidade da voz"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-bold transition-all"
          >
            <Gauge className="w-4 h-4" />
            <span>{speechRate === 0.8 ? 'Bem Lento' : speechRate === 0.9 ? 'Calmo' : 'Rápido'}</span>
          </button>

          {/* Botão Principal Play / Pause */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base shadow-md transition-all active:scale-95 ${
              isPlaying && !isPaused
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                : 'bg-white text-sky-900 hover:bg-sky-50'
            }`}
            aria-label={isPlaying && !isPaused ? 'Pausar áudio' : 'Ouvir explicação'}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{isPaused ? 'Continuar' : 'Ouvir Agora'}</span>
              </>
            )}
          </button>

          {/* Botão Parar / Reset */}
          {isPlaying && (
            <button
              onClick={handleStop}
              title="Parar áudio"
              className="p-3 rounded-xl bg-white/10 hover:bg-rose-500/80 active:bg-rose-600 text-white transition-all"
              aria-label="Parar leitura em áudio"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
