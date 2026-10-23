import React from 'react';
import { ShieldCheck, Cloud, Lock, HardDrive, X } from 'lucide-react';

const ITEMS = [
  {
    icon: Cloud,
    title: 'A foto é lida por uma IA do Google',
    text: 'Para entender letras difíceis e termos técnicos, a imagem é enviada de forma criptografada ao Gemini, do Google.'
  },
  {
    icon: Lock,
    title: 'Receitas e exames são dados sensíveis',
    text: 'No plano gratuito do Gemini, o Google pode usar o que é enviado para melhorar seus produtos. Se não quiser compartilhar a imagem, não envie.'
  },
  {
    icon: HardDrive,
    title: 'Nada fica salvo no nosso servidor',
    text: 'Não guardamos a foto nem pedimos cadastro. A leitura acontece na memória temporária e é apagada em seguida.'
  }
];

export default function ConsentModal({ isOpen, onClose, onAccept, onOpenDemo }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-[1.75rem] sm:rounded-[1.75rem] shadow-lift flex flex-col max-h-[92vh] animate-fade-up">
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-0">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-pine-50 text-pine-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h2 id="consent-title" className="section-title">Antes de enviar a foto</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="w-11 h-11 rounded-full flex items-center justify-center text-ink-muted hover:bg-paper flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ul className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-pine-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-ink">{title}</h3>
                <p className="text-ink-soft mt-0.5">{text}</p>
              </div>
            </li>
          ))}
          <li className="text-sm text-ink-muted border-t border-ink/10 pt-4">
            Este aplicativo é educativo e não substitui médicos, dentistas, farmacêuticos ou advogados.
          </li>
        </ul>

        <div className="p-5 sm:p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button onClick={onAccept} className="btn-primary sm:flex-1">
            Entendi, pode enviar
          </button>
          <button
            onClick={() => {
              onClose();
              if (onOpenDemo) onOpenDemo();
            }}
            className="btn-secondary"
          >
            Ver um exemplo
          </button>
        </div>
      </div>
    </div>
  );
}
