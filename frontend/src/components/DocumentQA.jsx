import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircleQuestion,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { speechController } from '../utils/speech';

export default function DocumentQA({ documentData }) {
  const [questionInput, setQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const historyBottomRef = useRef(null);

  // Inicializa suporte a reconhecimento de voz (Speech-to-Text nativo do navegador)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuestionInput(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Permissão de microfone negada. Você pode digitar sua dúvida no campo abaixo.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      speechController.stop();
    };
  }, []);

  // Sugestões rápidas de acordo com a categoria do documento
  const getSuggestions = (cat) => {
    switch (cat) {
      case 'CONTA_SERVICO':
        return [
          'Onde e como posso pagar essa conta?',
          'O que acontece se eu atrasar o pagamento?',
          'Tem alguma cobrança de taxa indevida?'
        ];
      case 'SAUDE_RECEITA':
        return [
          'Como e que horas devo tomar os remédios?',
          'Preciso de receita controlada na farmácia?',
          'Posso tomar em jejum ou precisa comer antes?'
        ];
      case 'NOTIFICACAO_LEGAL':
        return [
          'Qual é o prazo limite para eu resolver isso?',
          'O que acontece se eu não fizer nada?',
          'Onde consigo ajuda da Defensoria gratuita?'
        ];
      case 'BENEFICIO_SOCIAL':
        return [
          'Quando o valor cai na minha conta?',
          'Preciso ir pessoalmente ao INSS ou CRAS?',
          'Quais documentos originais preciso levar?'
        ];
      default:
        return [
          'O que este papel significa para mim?',
          'Qual o primeiro passo que devo fazer agora?',
          'Preciso pagar algum valor sobre isso?'
        ];
    }
  };

  const suggestions = getSuggestions(documentData?.categoria);

  const handleToggleListening = () => {
    if (!speechSupported) {
      alert('Seu navegador não suporta digitação por voz. Por favor, digite sua pergunta no campo.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Falha ao iniciar microfone:', err);
      }
    }
  };

  const handleSubmitQuestion = async (queryText) => {
    const textToSend = (queryText || questionInput).trim();
    if (!textToSend || isLoading) return;

    setIsLoading(true);
    setError(null);
    setQuestionInput('');

    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentData,
          question: textToSend,
          history: qaHistory
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Não foi possível responder a dúvida agora.');
      }

      const newEntry = {
        question: textToSend,
        answer: resData.data.answer
      };

      setQaHistory((prev) => [...prev, newEntry]);

      // Rola para a nova resposta
      setTimeout(() => {
        historyBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Erro ao enviar pergunta:', err);
      setError(err.message || 'Erro ao conectar com a IA. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakAnswer = (index, text) => {
    if (speakingIndex === index) {
      speechController.stop();
      setSpeakingIndex(null);
    } else {
      setSpeakingIndex(index);
      speechController.speak(text, {
        rate: 0.9,
        onEnd: () => setSpeakingIndex(null),
        onError: () => setSpeakingIndex(null)
      });
    }
  };

  return (
    <section aria-labelledby="duvidas-titulo" className="surface p-5 sm:p-8 space-y-5">
      <div className="flex items-start gap-4">
        <span className="w-11 h-11 rounded-2xl bg-clay-50 text-clay-600 flex items-center justify-center flex-shrink-0">
          <MessageCircleQuestion className="w-6 h-6" />
        </span>
        <div>
          <h2 id="duvidas-titulo" className="section-title">Ficou alguma dúvida?</h2>
          <p className="text-ink-muted mt-0.5">Pergunte por escrito ou pelo microfone.</p>
        </div>
      </div>

      {/* Sugestões de perguntas */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmitQuestion(suggestion)}
            disabled={isLoading}
            className="text-left rounded-2xl border border-ink/15 bg-white hover:border-pine-500 hover:bg-pine-50 px-4 py-2.5 text-ink transition-colors disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Conversa */}
      {qaHistory.length > 0 && (
        <div className="space-y-4">
          {qaHistory.map((item, index) => (
            <div key={index} className="space-y-2 animate-fade-up">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink text-white px-4 py-2.5">
                {item.question}
              </p>
              <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-paper px-4 py-3 space-y-2">
                <p className="text-ink leading-relaxed">{item.answer}</p>
                <button
                  onClick={() => handleSpeakAnswer(index, item.answer)}
                  className="btn-quiet btn-sm -ml-3"
                >
                  {speakingIndex === index ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {speakingIndex === index ? 'Parar' : 'Ouvir resposta'}
                </button>
              </div>
            </div>
          ))}
          <div ref={historyBottomRef} />
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-rose-900">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          {error}
        </p>
      )}

      {/* Campo de pergunta */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitQuestion();
        }}
        className="flex items-center gap-2 rounded-full border border-ink/15 bg-white p-1.5 pl-5 focus-within:border-pine-500 focus-within:ring-4 focus-within:ring-pine-100 transition-shadow"
      >
        <label htmlFor="pergunta" className="sr-only">Sua dúvida</label>
        <input
          id="pergunta"
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          disabled={isLoading}
          placeholder={isListening ? 'Pode falar, estou ouvindo…' : 'Escreva sua dúvida'}
          className="flex-1 min-w-0 bg-transparent text-ink placeholder:text-ink-muted focus:outline-none py-2"
        />
        {speechSupported && (
          <button
            type="button"
            onClick={handleToggleListening}
            disabled={isLoading}
            aria-label={isListening ? 'Parar de gravar' : 'Falar a dúvida pelo microfone'}
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'text-pine-700 hover:bg-pine-50'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !questionInput.trim()}
          aria-label="Enviar pergunta"
          className="w-11 h-11 rounded-full bg-pine-700 hover:bg-pine-800 text-white flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </section>
  );
}
