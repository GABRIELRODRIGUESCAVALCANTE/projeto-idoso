import React, { useRef, useState } from 'react';
import {
  Camera,
  ImageUp,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  FileText,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { compressImageIfNeeded } from '../utils/imageCompressor';

export default function DocumentUploader({ onAnalyze, isLoading, hasConsent, onRequestConsent, healthMode = false }) {
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

  // Cartão de pré-visualização de uma foto (frente ou verso)
  const renderPhotoSlot = ({ label, preview, alt, onReplace, onRemove, optional }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 min-h-[44px]">
        <span className="font-bold text-ink flex items-center gap-2">
          {preview
            ? <CheckCircle2 className="w-5 h-5 text-pine-600" />
            : <span className="w-5 h-5 rounded-full border-2 border-ink/20" aria-hidden="true" />}
          {label}
          {optional && <span className="text-sm font-normal text-ink-muted">(opcional)</span>}
        </span>
        {preview && (onRemove ? (
          <button onClick={onRemove} disabled={isLoading} className="btn-quiet btn-sm text-rose-700 hover:bg-rose-50">
            <Trash2 className="w-4 h-4" /> Remover
          </button>
        ) : (
          <button onClick={onReplace} disabled={isLoading} className="btn-quiet btn-sm">
            <Camera className="w-4 h-4" /> Trocar
          </button>
        ))}
      </div>
      {preview ? (
        <div className="rounded-2xl overflow-hidden bg-paper border border-ink/10 h-52 flex items-center justify-center">
          <img src={preview} alt={alt} className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="h-52 rounded-2xl border-2 border-dashed border-ink/15 bg-paper/60 p-4 flex flex-col items-center justify-center text-center gap-3">
          <p className="text-sm text-ink-muted max-w-[16rem]">
            Tem orientações, carimbos ou código de barras atrás? Fotografe o verso.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleTriggerAction(() => cameraBackRef.current?.click())}
              disabled={isLoading}
              className="btn-secondary btn-sm"
            >
              <Camera className="w-4 h-4" /> Fotografar
            </button>
            <button
              onClick={() => handleTriggerAction(() => fileBackRef.current?.click())}
              disabled={isLoading}
              className="btn-quiet btn-sm"
            >
              <ImageUp className="w-4 h-4" /> Da galeria
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const analyzeButton = (
    <button onClick={handleStartAnalysis} disabled={isLoading} className="btn-primary w-full min-h-[56px] text-lg">
      <span>{backFile ? 'Explicar frente e verso' : 'Explicar este documento'}</span>
      <ArrowRight className="w-5 h-5" />
    </button>
  );

  return (
    <section aria-label="Enviar documento" className="surface p-4 sm:p-6">
      {/* Inputs Ocultos de Captura */}
      <input ref={cameraFrontRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFrontChange} />
      <input ref={fileFrontRef} type="file" accept="image/*,application/pdf,.pdf" className="hidden" onChange={handleFrontChange} />
      <input ref={cameraBackRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleBackChange} />
      <input ref={fileBackRef} type="file" accept="image/*" className="hidden" onChange={handleBackChange} />
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-3">
            <button
              onClick={() => handleTriggerAction(() => cameraFrontRef.current?.click())}
              disabled={isCompressing}
              aria-label="Abrir a câmera para fotografar o documento"
              className="group flex items-center gap-4 p-5 sm:p-6 rounded-[1.5rem] bg-pine-700 hover:bg-pine-800 text-white text-left shadow-soft transition-all active:scale-[0.99]"
            >
              <span className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                <Camera className="w-7 h-7" />
              </span>
              <span>
                <span className="block text-xl font-bold leading-tight">Tirar foto</span>
                <span className="block text-pine-100 mt-1">Use a câmera do celular</span>
              </span>
            </button>

            <button
              onClick={() => handleTriggerAction(() => fileFrontRef.current?.click())}
              disabled={isCompressing}
              aria-label="Escolher uma foto da galeria ou um arquivo PDF"
              className="group flex items-center gap-4 p-5 sm:p-6 rounded-[1.5rem] bg-paper hover:bg-paper-deep border border-ink/10 text-ink text-left transition-all active:scale-[0.99]"
            >
              <span className="w-14 h-14 rounded-2xl bg-white border border-ink/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                <ImageUp className="w-7 h-7 text-pine-700" />
              </span>
              <span>
                <span className="block text-xl font-bold leading-tight">Escolher arquivo</span>
                <span className="block text-ink-muted mt-1">Foto salva ou PDF</span>
              </span>
            </button>
          </div>

          <p className="flex items-start gap-2.5 text-ink-muted px-1">
            <Lightbulb className="w-5 h-5 text-clay-500 flex-shrink-0 mt-0.5" />
            <span>
              {healthMode
                ? 'Fotografe com boa luz e o papel inteiro na tela. Em apresentações, use apenas documentos de exemplo, nunca de pacientes reais.'
                : 'Fotografe com boa luz e o papel inteiro na tela. Depois você pode adicionar o verso.'}
            </span>
          </p>

          {isCompressing && (
            <p role="status" className="text-sm text-pine-800 px-1">Preparando a foto…</p>
          )}
        </div>
      )}

      {/* CASO 2: Documento PDF Carregado */}
      {pdfFile && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-paper border border-ink/10">
            <span className="w-14 h-14 rounded-2xl bg-white border border-ink/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-pine-700" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink truncate">{pdfFile.name}</p>
              <p className="text-sm text-ink-muted">Arquivo PDF · {formatFileSize(pdfFile.size)}</p>
            </div>
            <button onClick={handleClearAll} disabled={isLoading} className="btn-quiet btn-sm flex-shrink-0">
              <RotateCcw className="w-4 h-4" /> Trocar
            </button>
          </div>
          {analyzeButton}
        </div>
      )}

      {/* CASO 3: Fotos (Frente Carregada + Slot Opcional de Verso) */}
      {frontFile && !pdfFile && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderPhotoSlot({
              label: 'Frente',
              preview: frontPreview,
              alt: 'Foto da frente do documento',
              onReplace: () => handleTriggerAction(() => cameraFrontRef.current?.click())
            })}
            {renderPhotoSlot({
              label: 'Verso',
              preview: backPreview,
              alt: 'Foto do verso do documento',
              onRemove: handleRemoveBack,
              optional: true
            })}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button onClick={handleClearAll} disabled={isLoading} className="btn-secondary sm:w-auto">
              <RotateCcw className="w-4 h-4" /> Recomeçar
            </button>
            <div className="flex-1">{analyzeButton}</div>
          </div>
        </div>
      )}
    </section>
  );
}
