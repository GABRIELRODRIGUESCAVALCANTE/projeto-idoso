/**
 * Auditoria Antifraude de Boletos e Contas (determinística, sem IA)
 *
 * Cruza o que a IA LEU no papel (valor, vencimento, tipo de conta) com o que está
 * matematicamente codificado na linha digitável. Divergências são o principal
 * sinal do "golpe do boleto adulterado", em que o golpista troca o código de
 * barras mantendo o visual original da conta.
 *
 * Status possíveis:
 *  - 'consistente': código válido e tudo bate com o papel
 *  - 'atencao':     código válido, mas há um sinal que merece conferência
 *  - 'divergente':  o papel diz uma coisa e o código cobra outra (suspeita de fraude)
 *  - 'ilegivel':    dígitos verificadores não conferem (foto ruim ou número adulterado)
 */

import { validateBarcode } from './barcodeValidator.js';

// Tolerância de R$ 0,01 para arredondamentos
const TOLERANCIA_CENTAVOS = 1;

/**
 * Converte textos como "R$ 1.234,56", "142,50" ou "R$142.50" em centavos.
 * Retorna null se não houver valor monetário reconhecível.
 */
export function parseBRLToCents(texto) {
  if (!texto || typeof texto !== 'string') return null;
  const match = texto.match(/(\d{1,3}(?:[.\s]\d{3})*|\d+)(?:[,.](\d{2}))?(?!\d)/);
  if (!match) return null;
  const inteiro = match[1].replace(/[.\s]/g, '');
  const centavos = match[2] || '00';
  const valor = parseInt(inteiro, 10) * 100 + parseInt(centavos, 10);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

/** Normaliza uma data "dd/mm/aaaa" encontrada em qualquer texto. */
function extrairData(texto) {
  if (!texto || typeof texto !== 'string') return null;
  const m = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[1]}/${m[2]}/${m[3]}` : null;
}

// Palavras-chave que indicam qual tipo de concessionária o papel diz ser
const SEGMENTOS_POR_PALAVRA = [
  { segmento: '3', regex: /\b(luz|energia|el[eé]tric|g[aá]s|enel|cemig|light|copel|celesc|neoenergia|equatorial|cpfl|comg[aá]s)/i },
  { segmento: '2', regex: /\b([aá]gua|esgoto|saneamento|sabesp|cedae|copasa|sanepar|embasa|compesa|caesb)/i },
  { segmento: '4', regex: /\b(telefone|internet|telecom|celular|fibra|banda\s*larga|provedor|isp|wi-fi|wifi|vivo|claro|tim\b|oi\b)/i }
];

function segmentoEsperado(docData) {
  if (docData.categoria === 'FATURA_TELECOM_TI') return '4';
  const texto = `${docData.tipoDocumento || ''} ${docData.resumoSimples || ''}`;
  const achado = SEGMENTOS_POR_PALAVRA.find((s) => s.regex.test(texto));
  return achado ? achado.segmento : null;
}

/**
 * Executa a auditoria completa e devolve o objeto codigoBarrasInfo enriquecido.
 * NÃO altera docData.
 */
export function auditBarcode(docData) {
  const check = validateBarcode(docData.linhaDigitavel);
  const alertas = [];

  if (!check || !check.valido) {
    return {
      ...check,
      auditoria: {
        status: 'ilegivel',
        alertas: ['Os números do código de barras não fecham a conta matemática. Pode ser foto ruim ou código adulterado.'],
        empresaHomologada: false
      }
    };
  }

  // 1. Valor lido no papel x valor embutido no código
  const valorPapelCentavos = parseBRLToCents(docData.valoresEPrazos?.valorPrincipal);
  const valorCodigoCentavos = check.valorCentavos ?? null;
  let valorDivergente = false;

  if (valorPapelCentavos && valorCodigoCentavos) {
    valorDivergente = Math.abs(valorPapelCentavos - valorCodigoCentavos) > TOLERANCIA_CENTAVOS;
    if (valorDivergente) {
      alertas.push(
        `O papel mostra ${docData.valoresEPrazos.valorPrincipal}, mas o código de barras cobra ${check.valorCalculado}.`
      );
    }
  }

  // 2. Vencimento lido x vencimento do fator FEBRABAN
  const dataPapel = extrairData(docData.valoresEPrazos?.dataVencimento);
  const dataCodigo = check.dataVencimentoCalculada;
  let dataDivergente = false;
  if (dataPapel && dataCodigo && dataPapel !== dataCodigo) {
    dataDivergente = true;
    alertas.push(`O vencimento no papel é ${dataPapel}, mas o código de barras indica ${dataCodigo}.`);
  }

  // 3. Coerência do tipo de conta com o formato do código
  const esperado = segmentoEsperado(docData);
  let sinalDeAtencao = false;

  if (check.formato === 'ARRECADACAO' && esperado && check.segmento !== esperado) {
    sinalDeAtencao = true;
    alertas.push(
      `O papel parece ser de outro tipo de serviço, mas o código é de "${check.segmentoNome || 'outro segmento'}".`
    );
  }

  if (check.formato === 'BANCARIO' && esperado && (docData.categoria === 'CONTA_SERVICO' || docData.categoria === 'FATURA_TELECOM_TI')) {
    // Contas de luz/água/telefone normalmente usam código de arrecadação (começa com 8).
    sinalDeAtencao = true;
    alertas.push(
      `Contas de ${esperado === '3' ? 'luz/gás' : esperado === '2' ? 'água' : 'telefone/internet'} costumam ter código de concessionária (iniciado por 8). ` +
        `Este é um boleto bancário${check.banco ? ` do ${check.banco}` : ''}. Confirme com a empresa antes de pagar.`
    );
  }

  if (check.formato === 'BANCARIO' && !check.banco) {
    sinalDeAtencao = true;
    alertas.push(`Banco emissor de código ${check.codigoBanco} não está na lista dos bancos mais comuns.`);
  }

  let status = 'consistente';
  if (valorDivergente || dataDivergente) status = 'divergente';
  else if (sinalDeAtencao) status = 'atencao';

  // Marcação de empresa homologada se for arrecadação legítima ou banco principal sem divergência
  const empresaHomologada = status === 'consistente' && Boolean(check.valido);

  return {
    ...check,
    auditoria: {
      status,
      alertas,
      valorLidoNoPapel: docData.valoresEPrazos?.valorPrincipal || null,
      empresaHomologada
    }
  };
}

/**
 * Aplica a auditoria ao resultado da IA, ajustando confiança, valores e alertas
 * exibidos ao cidadão. Usado por todos os provedores (Gemini e local).
 */
export function applyBarcodeAudit(docData, log) {
  if (!docData?.linhaDigitavel) return docData;

  const info = auditBarcode(docData);
  docData.codigoBarrasInfo = info;
  docData.pontosDeAtencao = docData.pontosDeAtencao || [];
  const status = info.auditoria?.status;

  if (status === 'ilegivel') {
    log?.warn?.('Dígitos verificadores da linha digitável não conferem. Alerta emitido.');
    docData.confianca = 'baixa';
    docData.pontosDeAtencao.push(
      'Atenção: A numeração do código de barras parece cortada ou ilegível na foto. Por favor, confira os valores no papel original.'
    );
    return docData;
  }

  if (status === 'divergente') {
    log?.security?.('Auditoria antifraude: divergência entre papel e código de barras detectada.');
    docData.confianca = 'baixa';
    docData.valoresEPrazos.avisoConferencia =
      `🚨 NÃO PAGUE AINDA: ${info.auditoria.alertas.join(' ')} Ligue para a empresa pelo telefone oficial antes de pagar.`;
    docData.pontosDeAtencao.unshift(
      'Possível golpe do boleto adulterado: o valor ou a data do código de barras não batem com o papel.'
    );
    return docData;
  }

  // Consistente ou atenção: o valor matemático do código é o valor real a pagar
  if (info.valorCalculado) {
    docData.valoresEPrazos.valorPrincipal = info.valorCalculado;
    docData.valoresEPrazos.avisoConferencia =
      `✅ Valor conferido matematicamente pelo código de barras: ${info.valorCalculado}` +
      (info.dataVencimentoCalculada ? ` com vencimento em ${info.dataVencimentoCalculada}` : '');
  }

  if (status === 'consistente') {
    log?.info?.(`Código de barras auditado e consistente (${info.tipo})`);
    docData.confianca = 'alta';
  } else {
    log?.warn?.('Auditoria antifraude: sinal de atenção no código de barras.');
    info.auditoria.alertas.forEach((a) => docData.pontosDeAtencao.push(a));
  }

  return docData;
}
