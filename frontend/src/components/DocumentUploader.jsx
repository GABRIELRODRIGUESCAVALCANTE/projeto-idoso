import React, { useRef, useState } from 'react';
import { 
  Camera, 
  ImageUp, 
  RotateCcw, 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  FileText, 
  FileCheck, 
  Plus, 
  Trash2,
  Layers,
  ShieldAlert,
  Pill,
  Zap,
  PlayCircle,
  Wifi,
  Monitor
} from 'lucide-react';
import { compressImageIfNeeded } from '../utils/imageCompressor';
import { DEMO_PRESETS } from '../utils/demoData';

export default function DocumentUploader({ onAnalyze, isLoading, hasConsent, onRequestConsent, onSelectDemo }) {
  // Estados para suportar Frente e Verso ou arquivo PDF único
  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);

  const [backFile, setBackFile] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Helper para exigir consentimento prévio antes de abrir a câmera ou seletor de arquivos
  const handleTriggerAction = (actionFn) => {
    if (!hasConsent && onRequestConsent) {
      onRequestConsent(actionFn);
    } else {
      actionFn();
    }
  };

  // Referências para os inputs de câmera e arquivo
  const cameraFrontRef = useRef(null);
  const fileFrontRef = useRef(null);
  const cameraBackRef = useRef(null);
  const fileBackRef = useRef(null);
  const pdfInputRef = useRef(null);

  const handleFrontChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        handlePdfSelection(file);
        return;
      }
      setPdfFile(null);
      setIsCompressing(true);
      try {
        const optimizedFile = await compressImageIfNeeded(file);
        setFrontFile(optimizedFile);
        if (frontPreview) URL.revokeObjectURL(frontPreview);
        setFrontPreview(URL.createObjectURL(optimizedFile));
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleBackChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const optimizedFile = await compressImageIfNeeded(file);
        setBackFile(optimizedFile);
        if (backPreview) URL.revokeObjectURL(backPreview);
        setBackPreview(URL.createObjectURL(optimizedFile));
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handlePdfSelection = (file) => {
    handleClearAll();
    setPdfFile(file);
  };

  const handleClearAll = () => {
    if (frontPreview) URL.revokeObjectURL(frontPreview);
    if (backPreview) URL.revokeObjectURL(backPreview);
    setFrontFile(null);
    setFrontPreview(null);
    setBackFile(null);
    setBackPreview(null);
    setPdfFile(null);

    if (cameraFrontRef.current) cameraFrontRef.current.value = '';
    if (fileFrontRef.current) fileFrontRef.current.value = '';
    if (cameraBackRef.current) cameraBackRef.current.value = '';
    if (fileBackRef.current) fileBackRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const handleRemoveBack = () => {
    if (backPreview) URL.revokeObjectURL(backPreview);
    setBackFile(null);
    setBackPreview(null);
    if (cameraBackRef.current) cameraBackRef.current.value = '';
    if (fileBackRef.current) fileBackRef.current.value = '';
  };

  const handleStartAnalysis = () => {
    if (isLoading) return;

    if (!hasConsent && onRequestConsent) {
      onRequestConsent(() => handleStartAnalysis());
      return;
    }

    if (pdfFile) {
      onAnalyze([pdfFile]);
    } else if (frontFile) {
      const filesToSend = [frontFile];
      if (backFile) {
        filesToSend.push(backFile);
      }
      onAnalyze(filesToSend);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasAnyUpload = Boolean(frontFile || pdfFile);

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
      {/* Inputs Ocultos de Captura */}
      <input
        ref={cameraFrontRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFrontChange}
      />
      <input
        ref={fileFrontRef}
        type="file"
        accept="image/*,application/pdf,.pdf"
        className="hidden"
        onChange={handleFrontChange}
      />
      <input
        ref={cameraBackRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleBackChange}
      />
      <input
        ref={fileBackRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackChange}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePdfSelection(file);
        }}
      />

      {/* CASO 1: Nenhum documento selecionado ainda */}
      {!hasAnyUpload && (
        <div className="space-y-5">
          <div className="text-center py-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              Como você quer enviar seu documento?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
              Você pode fotografar a <strong>Frente e o Verso</strong> do papel ou enviar um arquivo <strong>PDF</strong> completo.
            </p>
          </div>

          {/* Botões Grandes e Acessíveis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opção 1: Tirar foto com a câmera */}
            <button
              onClick={() => handleTriggerAction(() => cameraFrontRef.current?.click())}
              className="flex items-center sm:flex-col justify-center gap-3 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-base sm:text-lg shadow-lg shadow-sky-500/25 hover:from-sky-600 hover:to-blue-700 active:scale-[0.98] transition-all"
              aria-label="Abrir câmera do celular para fotografar a frente do documento"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="text-left sm:text-center">
                <span className="block text-lg sm:text-xl font-extrabold">Tirar Foto com a Câmera</span>
                <span className="block text-xs sm:text-sm font-normal text-sky-100">
                  Fotografe a frente (e depois o verso se quiser)
                </span>
              </div>
            </button>

            {/* Opção 2: Escolher imagem da Galeria ou PDF */}
            <button
              onClick={() => handleTriggerAction(() => fileFrontRef.current?.click())}
              className="flex items-center sm:flex-col justify-center gap-3 p-5 sm:p-7 rounded-2xl bg-slate-50 border-2 border-slate-300 hover:border-sky-500 text-slate-800 font-bold text-base sm:text-lg hover:bg-sky-50/50 active:scale-[0.98] transition-all"
              aria-label="Escolher foto da galeria ou arquivo PDF"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-200/80 flex items-center justify-center flex-shrink-0 text-slate-700">
                <ImageUp className="w-8 h-8" />
              </div>
              <div className="text-left sm:text-center">
                <span className="block text-lg sm:text-xl font-extrabold">Escolher da Galeria ou PDF</span>
                <span className="block text-xs sm:text-sm font-normal text-slate-500">
                  Fotos salvas ou arquivo digital em PDF
                </span>
              </div>
            </button>
          </div>

          {/* Dica Amigável de Acessibilidade */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <strong>Dica importante:</strong> Se o seu documento tem informações atrás (como instruções de remédio ou código de barras no verso da conta), você poderá adicionar o <strong>verso</strong> logo em seguida!
            </p>
          </div>

          {/* Seção de Exemplos Rápidos para Demonstração e Testes (1 Toque) */}
          {onSelectDemo && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-sky-600" />
                  Exemplos Prontos para Demonstração (1 Toque):
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Ideal para apresentações sem foto
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectDemo('roteador_fibra')}
                  className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition-all group focus-visible:ring-4 focus-visible:ring-indigo-500"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Wifi className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-xs text-indigo-950">1. Roteador Fibra (LOS)</span>
                  </div>
                  <p className="text-[11px] text-indigo-900 line-clamp-2">
                    Luz vermelha piscando, diagnóstico de LEDs e guia interativo
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDemo('tela_azul')}
                  className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-all group focus-visible:ring-4 focus-visible:ring-blue-500"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span className="font-extrabold text-xs text-blue-950">2. Tela Azul (PC)</span>
                  </div>
                  <p className="text-[11px] text-blue-900 line-clamp-2">
                    Código de parada do Windows decodificado para o cliente
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDemo('golpe_falso_suporte')}
                  className="p-3 rounded-xl border border-rose-300 bg-rose-50/80 hover:bg-rose-100 text-left transition-all group focus-visible:ring-4 focus-visible:ring-rose-500"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span className="font-extrabold text-xs text-rose-950">3. Falso Suporte (SMS)</span>
                  </div>
                  <p className="text-[11px] text-rose-900 line-clamp-2">
                    Alerta de golpe com ameaça de corte de internet
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDemo('conta_luz')}
                  className="p-3 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-left transition-all group focus-visible:ring-4 focus-visible:ring-sky-500"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-extrabold text-xs text-sky-950">4. Conta de Luz</span>
                  </div>
                  <p className="text-[11px] text-sky-900 line-clamp-2">
                    Boleto autêntico auditado com jargões e bandeira tarifária
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDemo('golpe_adulterado')}
                  className="p-3 rounded-xl border border-rose-300 bg-rose-50/80 hover:bg-rose-100 text-left transition-all group focus-visible:ring-4 focus-visible:ring-rose-500"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span className="font-extrabold text-xs text-rose-950">5. Golpe Boleto</span>
                  </div>
                  <p className="text-[11px] text-rose-900 line-clamp-2">
                    Conta de R$ 142 que cobra R$ 987 no código (Antifraude)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDemo('receita_medica')}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-all group focus-visible:ring-4 focus-visible:ring-emerald-500"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-xs text-emerald-950">6. Receita Médica</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 line-clamp-2">
                    Prescrição de 3 remédios com horários para o cuidador
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CASO 2: Documento PDF Carregado */}
      {pdfFile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Documento PDF Pronto
            </span>
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className="min-h-[44px] px-3.5 py-2 text-xs sm:text-sm text-slate-700 hover:text-rose-700 font-bold flex items-center gap-1.5 rounded-xl disabled:opacity-40 focus-visible:ring-4 focus-visible:ring-rose-400"
            >
              <RotateCcw className="w-4 h-4" /> <span>Trocar Arquivo</span>
            </button>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 shadow-sm">
              <FileText className="w-9 h-9" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 max-w-sm truncate">
              {pdfFile.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Documento em formato PDF ({formatFileSize(pdfFile.size)})
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-100/70 px-3 py-1 rounded-full">
              Páginas prontas para leitura pela IA
            </span>
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <Sparkles className="w-6 h-6 animate-spin-slow" />
            <span>Explicar Este Documento Para Mim</span>
          </button>
        </div>
      )}

      {/* CASO 3: Fotos (Frente Carregada + Slot Opcional de Verso) */}
      {frontFile && !pdfFile && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                {backFile ? 'Frente e Verso Prontos' : 'Apenas Frente Adicionada'}
              </span>
            </div>
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className="min-h-[44px] px-3 py-2 text-xs sm:text-sm text-slate-600 hover:text-rose-700 font-bold flex items-center gap-1.5 rounded-xl disabled:opacity-40 focus-visible:ring-4 focus-visible:ring-rose-400"
            >
              <RotateCcw className="w-4 h-4" /> <span>Recomeçar</span>
            </button>
          </div>

          {/* Cards Lado a Lado (Frente e Verso) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CARD 1: FRENTE */}
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  1. Foto da Frente
                </span>
                <button
                  onClick={() => handleTriggerAction(() => cameraFrontRef.current?.click())}
                  disabled={isLoading}
                  className="min-h-[44px] px-3 py-2 text-xs font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 rounded-xl focus-visible:ring-4 focus-visible:ring-sky-500"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Trocar foto</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black/5 border border-slate-200 h-48 flex items-center justify-center">
                <img
                  src={frontPreview}
                  alt="Foto da frente do documento"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* CARD 2: VERSO */}
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  {backFile ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                  )}
                  2. Foto do Verso <span className="text-[10px] font-normal text-slate-500">(Opcional)</span>
                </span>
                {backFile && (
                  <button
                    onClick={handleRemoveBack}
                    disabled={isLoading}
                    title="Remover foto do verso"
                    aria-label="Remover foto do verso do documento"
                    className="min-h-[44px] px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 rounded-xl flex items-center gap-1.5 focus-visible:ring-4 focus-visible:ring-rose-400"
                  >
                    <Trash2 className="w-4 h-4" /> <span>Remover</span>
                  </button>
                )}
              </div>

              {backFile ? (
                <div className="relative rounded-xl overflow-hidden bg-black/5 border border-slate-200 h-48 flex items-center justify-center">
                  <img
                    src={backPreview}
                    alt="Foto do verso do documento"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-48 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white/60">
                  <p className="text-xs text-slate-500 mb-3 max-w-xs">
                    Se o papel tiver orientações, carimbos ou código de barras no <strong>verso</strong>, fotografe aqui:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => handleTriggerAction(() => cameraBackRef.current?.click())}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-bold text-xs transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" /> Tirar Foto do Verso
                    </button>
                    <button
                      onClick={() => handleTriggerAction(() => fileBackRef.current?.click())}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors"
                    >
                      <ImageUp className="w-3.5 h-3.5" /> Da Galeria
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão de Análise Principal */}
          <button
            onClick={handleStartAnalysis}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <Sparkles className="w-6 h-6 animate-spin-slow" />
            <span>
              {backFile
                ? 'Explicar Documento (Frente e Verso)'
                : 'Explicar Este Documento Para Mim'}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
