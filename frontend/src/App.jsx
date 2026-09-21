import React, { useState } from 'react';
import Header from './components/Header';
import DocumentUploader from './components/DocumentUploader';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';
import { AlertCircle, HelpCircle, HeartHandshake } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // 0: Normal, 1: Grande, 2: Extra Grande

  const fontClasses = [
    'text-base',        // 0: Normal
    'text-lg sm:text-xl', // 1: Grande
    'text-xl sm:text-2xl' // 2: Extra Grande
  ];

  const handleIncreaseFont = () => {
    if (fontSizeLevel < 2) setFontSizeLevel((prev) => prev + 1);
  };

  const handleDecreaseFont = () => {
    if (fontSizeLevel > 0) setFontSizeLevel((prev) => prev - 1);
  };

  const handleAnalyze = async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('document', file);

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

  // Exemplo de demonstração para facilitar testes imediatos pelo usuário
  const loadDemo = () => {
    setResult({
      categoria: 'CONTA_SERVICO',
      tipoDocumento: 'Conta de Energia Elétrica (Enel)',
      resumoSimples: 'Esta é a sua conta de luz do mês de outubro. O valor está um pouco mais alto porque houve cobrança de bandeira amarela, o que significa que geraram energia de forma mais cara no país.',
      acoesEssenciais: [
        'Pagar a conta de R$ 142,50 até o dia 25 de outubro de 2024.',
        'Você pode pagar pelo aplicativo do banco, na lotérica ou pelo código Pix no final da folha.',
        'Guarde o comprovante de pagamento por pelo menos 1 ano.'
      ],
      valoresEPrazos: {
        valorPrincipal: 'R$ 142,50',
        dataVencimento: '25/10/2024',
        consequenciaAtraso: 'Após 15 dias de atraso, pode haver aviso de corte e cobrança de multa de 2%.'
      },
      pontosDeAtencao: [
        'Houve cobrança de R$ 9,90 de um serviço de seguro residencial opcional.',
        'Seu consumo foi de 180 kWh, 15% menor do que no mês passado (parabéns pela economia!).'
      ],
      alertaEtico: 'Este resumo é uma ajuda informativa. Em caso de dúvidas sobre cobranças indevidas, entre em contato direto com a central da concessionária pelo 0800.',
      textoParaVoz: 'Olá! Este documento é a sua conta de luz da Enel. O valor total é de cento e quarenta e dois reais e cinquenta centavos, e o vencimento é no dia vinte e cinco de outubro. Você precisa pagar até essa data para evitar juros ou corte. Um ponto de atenção é que veio cobrado um seguro de nove reais e noventa centavos que pode ser cancelado se você não pediu.'
    });
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header
        onIncreaseFont={handleIncreaseFont}
        onDecreaseFont={handleDecreaseFont}
        fontSizeLevel={fontSizeLevel}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Banner de Demonstração Rápida */}
        {!result && !isLoading && (
          <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-sky-50 border border-sky-100 text-xs sm:text-sm text-sky-800">
            <span className="flex items-center gap-1.5 font-medium">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              Quer testar como funciona sem enviar uma foto real agora?
            </span>
            <button
              onClick={loadDemo}
              className="px-3 py-1 bg-white hover:bg-sky-100 font-bold rounded-lg border border-sky-200 text-sky-700 transition-colors shadow-sm"
            >
              Ver Exemplo Pronto
            </button>
          </div>
        )}

        {/* Mensagem de Erro Acessível */}
        {error && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3.5 shadow-sm">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-base sm:text-lg">Não conseguimos processar o documento</h3>
              <p className="text-sm sm:text-base leading-relaxed">{error}</p>
              <button
                onClick={handleReset}
                className="mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-700 underline hover:text-rose-900"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Estado de Carregamento */}
        {isLoading && <LoadingState />}

        {/* Fluxo: Uploader ou Resultado */}
        {!isLoading && !result && (
          <DocumentUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {!isLoading && result && (
          <ResultCard
            data={result}
            onReset={handleReset}
            fontSizeClass={fontClasses[fontSizeLevel]}
          />
        )}
      </main>

      {/* Rodapé Institucional do Projeto de Extensão */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-medium text-slate-700 flex items-center justify-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            Projeto de Extensão Universitária de Impacto Social • Tradutor de Burocracia & Saúde
          </p>
          <p>
            Desenvolvido com IA Multimodal para inclusão e acessibilidade cidadã. Nenhuma imagem é armazenada permanentemente.
          </p>
        </div>
      </footer>
    </div>
  );
}
