import React, { useRef, useState } from 'react';
import { Camera, ImageUp, RotateCcw, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function DocumentUploader({ onAnalyze, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem ou foto válida (JPG, PNG).');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartAnalysis = () => {
    if (selectedFile && !isLoading) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
      {/* Inputs invisíveis para Câmera e Arquivo */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        id="camera-capture-input"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="file-upload-input"
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div className="space-y-4">
          <div className="text-center py-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
              Como você quer enviar seu documento?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
              Tire uma foto ou escolha uma imagem do seu celular ou computador.
            </p>
          </div>

          {/* Botões Grandes e Acessíveis para Idosos e Todos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Botão Câmera */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center sm:flex-col justify-center gap-3 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-base sm:text-lg shadow-lg shadow-sky-500/25 hover:from-sky-600 hover:to-blue-700 active:scale-[0.98] transition-all"
              aria-label="Abrir câmera do celular para tirar foto"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="text-left sm:text-center">
                <span className="block text-lg sm:text-xl font-extrabold">Tirar Foto Agora</span>
                <span className="block text-xs sm:text-sm font-normal text-sky-100">Usa a câmera do seu celular</span>
              </div>
            </button>

            {/* Botão Escolher da Galeria */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center sm:flex-col justify-center gap-3 p-5 sm:p-7 rounded-2xl bg-slate-50 border-2 border-slate-300 hover:border-sky-500 text-slate-800 font-bold text-base sm:text-lg hover:bg-sky-50/50 active:scale-[0.98] transition-all"
              aria-label="Escolher foto da galeria ou arquivo"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-200/80 flex items-center justify-center flex-shrink-0 text-slate-700">
                <ImageUp className="w-8 h-8" />
              </div>
              <div className="text-left sm:text-center">
                <span className="block text-lg sm:text-xl font-extrabold">Enviar Imagem</span>
                <span className="block text-xs sm:text-sm font-normal text-slate-500">Escolher foto da galeria ou PDF</span>
              </div>
            </button>
          </div>

          {/* Dica Amigável de Acessibilidade */}
          <div className="mt-4 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <strong>Dica importante:</strong> Para a leitura sair perfeita, tire a foto com boa luz, sem sombras em cima e tente deixar as letras bem nítidas.
            </p>
          </div>
        </div>
      ) : (
        /* Preview da Imagem Selecionada */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Foto Carregada
            </span>
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="text-xs sm:text-sm text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1.5 p-1 disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" /> Trocar Foto
            </button>
          </div>

          {/* Imagem Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950/5 border border-slate-200 max-h-80 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Pré-visualização do documento enviado"
              className="w-full h-auto max-h-80 object-contain rounded-2xl"
            />
          </div>

          {/* Botão de Ação Principal: Decodificar com IA */}
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
    </section>
  );
}
