/**
 * Controlador de Síntese de Fala com suporte avançado a acessibilidade (WCAG 2.2 AA).
 * Inclui detecção de vozes pt-BR, evento boundary para acompanhamento por trecho (karaokê)
 * e tratamento para dispositivos sem suporte ou sem vozes locais em português.
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
    // Procura por vozes brasileiras (pt-BR ou pt)
    const ptBrVoices = this.voices.filter(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
    // Prioriza vozes com maior naturalidade (Google, Luciana, Microsoft, Maria)
    const preferred = ptBrVoices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Luciana') || 
      v.name.includes('Natural') || 
      v.name.includes('Maria')
    );
    return preferred || ptBrVoices[0] || null;
  }

  hasPtBrVoice() {
    if (!this.synth) return false;
    const voices = this.synth.getVoices();
    return voices.some(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
  }

  speak(text, { rate = 0.95, pitch = 1.0, onStart, onEnd, onError, onBoundary } = {}) {
    if (!this.isSupported()) {
      console.warn('Web Speech API não é suportada neste navegador.');
      return false;
    }

    this.stop(); // Interrompe qualquer fala anterior

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = rate; // Ritmo compassado para melhor compreensão por idosos
    utterance.pitch = pitch;

    const voice = this.getPtBrVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (onStart) onStart({ hasPtVoice: Boolean(voice) });
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

    // Suporte ao evento boundary para realce dinâmico do trecho/palavra lida (karaokê acessível)
    if (onBoundary) {
      utterance.onboundary = (event) => {
        onBoundary({
          charIndex: event.charIndex,
          charLength: event.charLength || 0,
          name: event.name
        });
      };
    }

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
