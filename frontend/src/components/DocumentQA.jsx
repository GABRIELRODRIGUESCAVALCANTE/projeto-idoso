import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircleQuestion, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Sparkles, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { speechController } from '../utils/speech';

export default function DocumentQA({ documentData, fontSizeClass = '' }) {
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
    <section className="bg-sky-50/50 border border-sky-200/80 rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Cabeçalho da Seção de Dúvidas */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-sky-600/30">
          <MessageCircleQuestion className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            Ficou com alguma dúvida sobre este papel?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Pergunte o que quiser ou toque em uma sugestão abaixo:
          </p>
        </div>
      </div>

      {/* Sugestões Rápidas (Chips de 1 clique) */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          Perguntas Frequentes (Toque para perguntar):
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmitQuestion(suggestion)}
              disabled={isLoading}
              className="text-left px-3.5 py-2 rounded-xl bg-white hover:bg-sky-100/70 border border-sky-200 text-sky-900 text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              💬 {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Histórico de Respostas */}
      {qaHistory.length > 0 && (
        <div className="space-y-3 pt-2">
          {qaHistory.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3 shadow-xs"
            >
              {/* Pergunta do Cidadão */}
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  Você
                </span>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  "{item.question}"
                </p>
              </div>

              {/* Resposta Acolhedora da IA */}
              <div className="bg-sky-50/60 rounded-xl p-3.5 border-l-4 border-sky-500 space-y-2">
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                  {item.answer}
                </p>

                {/* Botão de Ouvir Resposta */}
                <div className="pt-1">
                  <button
                    onClick={() => handleSpeakAnswer(index, item.answer)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      speakingIndex === index
                        ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                    }`}
                  >
                    {speakingIndex === index ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>Parar Leitura</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Ouvir Resposta</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={historyBottomRef} />
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulário de Pergunta: Campo de Texto + Microfone + Enviar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitQuestion();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            disabled={isLoading}
            placeholder={
              isListening
                ? 'Ouvindo sua dúvida... Pode falar!'
                : 'Escreva sua dúvida aqui...'
            }
            className={`w-full px-4 py-3.5 sm:py-4 rounded-2xl bg-white border text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
              isListening
                ? 'border-rose-400 bg-rose-50/50 text-rose-900 placeholder:text-rose-600 animate-pulse'
                : 'border-slate-300 text-slate-800'
            }`}
          />
        </div>

        {/* Botão de Falar (Microfone com Ícone + Texto) */}
        {speechSupported && (
          <button
            type="button"
            onClick={handleToggleListening}
            disabled={isLoading}
            title={isListening ? 'Parar gravação' : 'Falar dúvida pelo microfone'}
            aria-label={isListening ? 'Parar gravação de voz' : 'Falar dúvida pelo microfone do aparelho'}
            className={`min-h-[44px] px-3.5 sm:px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 flex-shrink-0 focus-visible:ring-4 focus-visible:ring-sky-500 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 text-white" />
                <span className="text-xs font-bold">Ouvindo...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-bold">Falar</span>
              </>
            )}
          </button>
        )}

        {/* Botão Enviar Pergunta (Ícone + Texto sempre visíveis) */}
        <button
          type="submit"
          disabled={isLoading || !questionInput.trim()}
          aria-label="Enviar dúvida para o assistente de IA"
          className="min-h-[44px] px-4 sm:px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-base flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 active:scale-95 transition-all flex-shrink-0 focus-visible:ring-4 focus-visible:ring-sky-500"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Pensando...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Perguntar</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
