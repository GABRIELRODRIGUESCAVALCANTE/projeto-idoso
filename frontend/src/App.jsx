import React, { useState } from 'react';
import Header from './components/Header';
import DocumentUploader from './components/DocumentUploader';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';
import ConsentModal from './components/ConsentModal';
import ProfessionalDisclaimer from './components/ProfessionalDisclaimer';
import { AlertCircle, HelpCircle, HeartHandshake, ShieldCheck, RotateCcw, PlayCircle } from 'lucide-react';
import { DEMO_PRESETS, HEALTH_DEMO_KEYS } from './utils/demoData';
import { getAppMode } from './utils/appMode';

// Botões do banner de demonstração no modo completo
const FULL_DEMO_BUTTONS = [
  { key: 'conta_luz', label: '⚡ Conta de Luz', aria: 'Carregar exemplo de conta de luz', color: 'sky' },
  { key: 'roteador_fibra', label: '📶 Roteador Fibra (LOS)', aria: 'Carregar exemplo de suporte técnico com roteador fibra', color: 'indigo' },
  { key: 'tela_azul', label: '💻 Tela Azul (PC)', aria: 'Carregar exemplo de tela azul do Windows', color: 'blue' },
  { key: 'golpe_falso_suporte', label: '🛑 Falso Suporte (SMS)', aria: 'Carregar exemplo de SMS de falso suporte', color: 'rose' },
  { key: 'golpe_adulterado', label: '🚨 Golpe Boleto', aria: 'Carregar exemplo de golpe antifraude', color: 'rose' },
  { key: 'receita_medica', label: '💊 Receita Médica', aria: 'Carregar exemplo de receita médica', color: 'emerald' }
];

// Botões do banner de demonstração no Modo Saúde (clínica odontológica e posto de saúde)
const HEALTH_DEMO_EMOJIS = {
  pos_extracao: '🦷',
  receita_odontologica: '💊',
  protese_dentaria: '😁',
  pedido_exame: '🧪',
  resultado_exame: '📋',
  vacinacao_idoso: '💉',
  receita_medica: '🩺',
  golpe_sus: '🚨'
};
const HEALTH_DEMO_BUTTONS = HEALTH_DEMO_KEYS.map((key) => ({
  key,
  label: `${HEALTH_DEMO_EMOJIS[key] || '📄'} ${DEMO_PRESETS[key].titulo}`,
  aria: `Carregar exemplo: ${DEMO_PRESETS[key].titulo}`,
  color: key === 'golpe_sus' ? 'rose' : 'emerald'
}));

// Classes completas (Tailwind não gera classes montadas dinamicamente)
const DEMO_BUTTON_COLORS = {
  sky: 'bg-white hover:bg-sky-100 border-sky-300 text-sky-900',
  indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300 text-indigo-900',
  blue: 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-900',
  rose: 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-900',
  emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
};

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
  const demoButtons = healthMode ? HEALTH_DEMO_BUTTONS : FULL_DEMO_BUTTONS;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        onIncreaseFont={handleIncreaseFont}
        onDecreaseFont={handleDecreaseFont}
        fontSizeLevel={fontSizeLevel}
        onOpenPrivacy={() => setIsConsentModalOpen(true)}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast((prev) => !prev)}
        healthMode={healthMode}
      />

      <main
        role="main"
        aria-live="polite"
        className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8"
      >
        {/* Aviso Geral de Isenção de Responsabilidade Profissional */}
        <ProfessionalDisclaimer className="mb-4" healthMode={healthMode} />

        {/* Banner de Demonstração Rápida */}
        {!result && !isLoading && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-sky-900">
            <span className="flex items-center gap-2 font-semibold">
              <PlayCircle className="w-5 h-5 text-sky-700 flex-shrink-0" />
              {healthMode
                ? 'Exemplos de saúde (funcionam sem internet):'
                : 'Modo Demonstração (Pitch): Teste cenários sem câmera:'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {demoButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => handleSelectDemo(btn.key)}
                  aria-label={btn.aria}
                  className={`px-3 py-1.5 font-extrabold rounded-xl border transition-all text-xs ${DEMO_BUTTON_COLORS[btn.color]}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem de Erro Acessível */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-3.5 shadow-sm"
          >
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg">Não conseguimos processar o documento</h3>
              <p className="text-sm sm:text-base leading-relaxed">{error}</p>
              <button
                onClick={handleReset}
                className="min-h-[44px] mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-xs sm:text-sm font-extrabold text-rose-950 transition-colors focus-visible:ring-4 focus-visible:ring-rose-500"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tentar novamente</span>
              </button>
            </div>
          </div>
        )}

        {/* Estado de Carregamento */}
        {isLoading && <LoadingState />}

        {/* Fluxo: Uploader ou Resultado */}
        {!isLoading && !result && (
          <DocumentUploader
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            hasConsent={hasConsent}
            onRequestConsent={handleRequestConsent}
            onSelectDemo={handleSelectDemo}
            healthMode={healthMode}
          />
        )}

        {!isLoading && result && (
          <div role="region" aria-label="Resultado da explicação do documento">
            <ResultCard
              data={result}
              onReset={handleReset}
              healthMode={healthMode}
            />
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

      {/* Rodapé Institucional do Projeto de Extensão */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-600">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-medium text-slate-800 flex items-center justify-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            Projeto de Extensão Universitária de Impacto Social • Tradutor de Burocracia & Saúde
          </p>
          <p className="leading-relaxed">
            Desenvolvido para inclusão e acessibilidade cidadã (Conformidade WCAG 2.2 AA). Processamento seguro em memória volátil (RAM) com transmissão criptografada.
          </p>
          <div className="pt-1 flex items-center justify-center gap-4 text-slate-500">
            <button
              onClick={() => setIsConsentModalOpen(true)}
              className="min-h-[44px] hover:text-slate-900 underline flex items-center gap-1.5 focus-visible:ring-4 focus-visible:ring-sky-500 rounded-lg px-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Termos de Privacidade e IA</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
