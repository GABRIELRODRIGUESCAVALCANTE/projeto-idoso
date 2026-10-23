import React, { useState } from 'react';
import Header from './components/Header';
import DocumentUploader from './components/DocumentUploader';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';
import ConsentModal from './components/ConsentModal';
import ProfessionalDisclaimer from './components/ProfessionalDisclaimer';
import DemoExamples from './components/DemoExamples';
import { AlertCircle, RotateCcw, Camera, BookOpenText, Volume2, ShieldCheck } from 'lucide-react';
import { DEMO_PRESETS, HEALTH_DEMO_KEYS, FULL_DEMO_KEYS } from './utils/demoData';
import { getAppMode } from './utils/appMode';

const HOW_IT_WORKS = [
  { icon: Camera, title: 'Fotografe', text: 'Receita, pedido de exame, conta ou aviso.' },
  { icon: BookOpenText, title: 'Entenda', text: 'Explicação curta, sem palavras difíceis.' },
  { icon: Volume2, title: 'Ouça e compartilhe', text: 'Leitura em voz alta e envio pelo WhatsApp.' }
];

export default function App() {
  const [appMode] = useState(getAppMode);
  const healthMode = appMode === 'saude';

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Estado de consentimento explícito LGPD para envio de imagens à IA de terceiros (Google)
  const [hasConsent, setHasConsent] = useState(() => {
    try {
      return localStorage.getItem('lgpd_ai_consent') === 'true';
    } catch {
      return false;
    }
  });
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Estado de Alto Contraste (WCAG 2.2 AA / AAA)
  const [isHighContrast, setIsHighContrast] = useState(() => {
    try {
      return localStorage.getItem('app_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  // 0: Normal (100%), 1: Média (115%), 2: Grande (130%), 3: Máxima (145%)
  const [fontSizeLevel, setFontSizeLevel] = useState(() => {
    try {
      const saved = localStorage.getItem('app_font_size_level');
      if (saved !== null) return Math.min(3, Math.max(0, Number(saved)));
    } catch {
      // Armazenamento indisponível: usa o padrão abaixo
    }
    // No Modo Saúde o público é majoritariamente idoso: começa com letra grande (130%)
    return healthMode ? 2 : 0;
  });

  const fontScales = ['100%', '115%', '130%', '145%'];

  // Aplica o zoom real na raiz do documento
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = fontScales[fontSizeLevel] || '100%';
      try {
        localStorage.setItem('app_font_size_level', String(fontSizeLevel));
      } catch (err) {
        console.warn('Erro ao salvar preferência de fonte:', err);
      }
    }
  }, [fontSizeLevel]);

  // Aplica ou remove classe de Alto Contraste
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isHighContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      try {
        localStorage.setItem('app_high_contrast', String(isHighContrast));
      } catch (err) {
        console.warn('Erro ao salvar preferência de contraste:', err);
      }
    }
  }, [isHighContrast]);

  const handleIncreaseFont = () => {
    if (fontSizeLevel < 3) setFontSizeLevel((prev) => prev + 1);
  };

  const handleDecreaseFont = () => {
    if (fontSizeLevel > 0) setFontSizeLevel((prev) => prev - 1);
  };

  // Gerenciamento de consentimento explícito
  const handleRequestConsent = (actionFn) => {
    if (hasConsent) {
      if (typeof actionFn === 'function') actionFn();
    } else {
      setPendingAction(() => actionFn);
      setIsConsentModalOpen(true);
    }
  };

  const handleAcceptConsent = () => {
    try {
      localStorage.setItem('lgpd_ai_consent', 'true');
    } catch (e) {
      console.warn('Não foi possível salvar consentimento no localStorage:', e);
    }
    setHasConsent(true);
    setIsConsentModalOpen(false);

    if (typeof pendingAction === 'function') {
      const actionToExecute = pendingAction;
      setPendingAction(null);
      setTimeout(() => actionToExecute(), 100);
    }
  };

  const handleAnalyze = async (files) => {
    if (!hasConsent) {
      handleRequestConsent(() => handleAnalyze(files));
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const fileList = Array.isArray(files) ? files : [files];
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('documents', file);
    });

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível ler o documento no momento.');
      }

      setResult(data.data);
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError(err.message || 'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  // Carrega qualquer um dos presets de demonstração pré-auditados
  const defaultDemoKey = healthMode ? HEALTH_DEMO_KEYS[0] : 'conta_luz';
  const handleSelectDemo = (presetKey = defaultDemoKey) => {
    const demo = DEMO_PRESETS[presetKey] || DEMO_PRESETS[defaultDemoKey];
    setResult(demo);
    setError(null);
  };

  const loadDemo = () => handleSelectDemo(defaultDemoKey);
  const demoKeys = healthMode ? HEALTH_DEMO_KEYS : FULL_DEMO_KEYS;

  // Ao abrir um resultado ou voltar ao início, leva a pessoa para o topo da página
  React.useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [result]);

  const isHome = !isLoading && !result;

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn-primary">
        Pular para o conteúdo
      </a>

      <Header
        onIncreaseFont={handleIncreaseFont}
        onDecreaseFont={handleDecreaseFont}
        fontSizeLevel={fontSizeLevel}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast((prev) => !prev)}
        healthMode={healthMode}
      />

      <main id="conteudo" role="main" aria-live="polite" className="flex-1 w-full max-w-3xl mx-auto px-4 pt-6 pb-16 sm:pt-10 space-y-8 sm:space-y-10">
        {/* Abertura da página inicial */}
        {isHome && (
          <div className="animate-fade-up px-1">
            <p className="eyebrow">Projeto de extensão universitária · gratuito</p>
            <h1 className="mt-2 font-display text-[2.1rem] leading-[1.1] sm:text-5xl sm:leading-[1.05] font-semibold text-ink max-w-[18ch]">
              {healthMode ? 'Entenda seus papéis de saúde, sem pressa.' : 'Entenda seus papéis, sem complicação.'}
            </h1>
            <p className="mt-4 text-lg text-ink-soft max-w-[52ch]">
              {healthMode
                ? 'Fotografe a receita, o pedido de exame ou as orientações do dentista. Explicamos em palavras simples e lemos em voz alta.'
                : 'Fotografe uma conta, receita ou aviso. Explicamos em palavras simples, lemos em voz alta e avisamos se parecer golpe.'}
            </p>
          </div>
        )}

        {/* Mensagem de Erro Acessível */}
        {error && (
          <div role="alert" aria-live="assertive" className="rounded-[1.5rem] bg-rose-50 border border-rose-200 p-5 flex items-start gap-4 animate-fade-up">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="font-bold text-lg text-rose-950">Não conseguimos ler o documento</h2>
              <p className="text-rose-900">{error}</p>
              <button onClick={handleReset} className="btn-secondary btn-sm">
                <RotateCcw className="w-4 h-4" />
                Tentar de novo
              </button>
            </div>
          </div>
        )}

        {isLoading && <LoadingState />}

        {isHome && (
          <>
            <div className="animate-fade-up [animation-delay:60ms]">
              <DocumentUploader
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                hasConsent={hasConsent}
                onRequestConsent={handleRequestConsent}
                healthMode={healthMode}
              />
            </div>

            <div className="animate-fade-up [animation-delay:120ms]">
              <DemoExamples presetKeys={demoKeys} onSelectDemo={handleSelectDemo} />
            </div>

            {/* Como funciona */}
            <section aria-labelledby="como-funciona" className="animate-fade-up [animation-delay:180ms]">
              <h2 id="como-funciona" className="section-title px-1">Como funciona</h2>
              <ol className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {HOW_IT_WORKS.map(({ icon: Icon, title, text }, index) => (
                  <li key={title} className="flex sm:flex-col items-start gap-4 sm:gap-3 p-4 sm:p-5 rounded-[1.5rem] border border-ink/10 bg-white/60">
                    <span className="relative w-11 h-11 rounded-2xl bg-pine-50 text-pine-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-clay-500 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                    </span>
                    <span>
                      <span className="block font-bold text-ink">{title}</span>
                      <span className="block text-ink-muted mt-0.5">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <ProfessionalDisclaimer healthMode={healthMode} />
          </>
        )}

        {!isLoading && result && (
          <div role="region" aria-label="Explicação do documento" className="animate-fade-up">
            <ResultCard data={result} onReset={handleReset} healthMode={healthMode} />
          </div>
        )}
      </main>

      {/* Modal de Consentimento Explícito e Privacidade LGPD */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => {
          setIsConsentModalOpen(false);
          setPendingAction(null);
        }}
        onAccept={handleAcceptConsent}
        onOpenDemo={loadDemo}
      />

      <footer className="border-t border-ink/10 bg-paper-deep/60">
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-ink-muted">
          <div>
            <p className="font-display text-lg font-semibold text-ink">Tradutor Cidadão</p>
            <p className="text-sm mt-1 max-w-[46ch]">
              Projeto de extensão universitária. As fotos são lidas na memória temporária e não ficam salvas no servidor.
            </p>
          </div>
          <button onClick={() => setIsConsentModalOpen(true)} className="btn-secondary btn-sm self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-pine-700" />
            Privacidade e uso de IA
          </button>
        </div>
      </footer>
    </div>
  );
}
