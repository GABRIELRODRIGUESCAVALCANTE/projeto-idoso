/**
 * Wrapper de Acessibilidade para a Web Speech API nativa do navegador
 */
class SpeechController {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.voices = [];
    this.initVoices();
  }

  isSupported() {
    return Boolean(this.synth && typeof SpeechSynthesisUtterance !== 'undefined');
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  getPtBrVoice() {
    if (!this.voices.length && this.synth) {
      this.voices = this.synth.getVoices();
    }
    // Procura por vozes brasileiras naturais ou padrão
    const ptBrVoices = this.voices.filter(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
    // Prioriza vozes do Google ou Microsoft se disponíveis
    const preferred = ptBrVoices.find(v => v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Natural'));
    return preferred || ptBrVoices[0] || null;
  }

  speak(text, { rate = 0.95, pitch = 1.0, onStart, onEnd, onError } = {}) {
    if (!this.isSupported()) {
      console.warn('Web Speech API não é suportada neste navegador.');
      return false;
    }

    this.stop(); // Interrompe qualquer fala anterior

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = rate; // Um pouco mais compassado para facilitar a compreensão
    utterance.pitch = pitch;

    const voice = this.getPtBrVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error('Erro na síntese de fala:', e);
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechController = new SpeechController();
