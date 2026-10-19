/**
 * Validador e Extrator Determinístico de Códigos de Barras e Linhas Digitáveis (Brasil)
 * Suporta:
 * 1. Boletos de Cobrança Bancária (FEBRABAN - 47 dígitos)
 * 2. Contas de Concessionárias / Serviços Públicos / Arrecadação (48 dígitos)
 *
 * Utiliza verificação de integridade matemática por Módulo 10 e Módulo 11.
 */

// Limpa caracteres não numéricos
export function sanitizeBarcode(code) {
  if (!code || typeof code !== 'string') return '';
  return code.replace(/\D/g, '');
}

/**
 * Principais instituições pelo código de compensação (COMPE/FEBRABAN).
 * Os 3 primeiros dígitos da linha digitável de um boleto bancário identificam o banco emissor.
 */
export const BANCOS_FEBRABAN = {
  '001': 'Banco do Brasil',
  '033': 'Santander',
  '041': 'Banrisul',
  '070': 'BRB',
  '077': 'Banco Inter',
  '104': 'Caixa Econômica Federal',
  '136': 'Unicred',
  '208': 'BTG Pactual',
  '212': 'Banco Original',
  '237': 'Bradesco',
  '260': 'Nubank',
  '290': 'PagBank',
  '323': 'Mercado Pago',
  '336': 'C6 Bank',
  '341': 'Itaú Unibanco',
  '380': 'PicPay',
  '422': 'Banco Safra',
  '745': 'Citibank',
  '748': 'Sicredi',
  '756': 'Sicoob'
};

export function identificarBanco(codigo) {
  return BANCOS_FEBRABAN[codigo] || null;
}

/**
 * Cálculo do Módulo 10 (usado nos campos dos boletos bancários e concessionárias)
 */
function modulo10(bloco) {
  let soma = 0;
  let peso = 2;
  for (let i = bloco.length - 1; i >= 0; i--) {
    let multi = parseInt(bloco[i], 10) * peso;
    if (multi > 9) multi = Math.floor(multi / 10) + (multi % 10);
    soma += multi;
    peso = peso === 2 ? 1 : 2;
  }
  const resto = soma % 10;
  return resto === 0 ? 0 : 10 - resto;
}

/**
 * Cálculo do Módulo 11 para Concessionárias (arrecadação)
 */
function modulo11Concessionaria(bloco) {
  let soma = 0;
  let peso = 2;
  for (let i = bloco.length - 1; i >= 0; i--) {
    soma += parseInt(bloco[i], 10) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  if (resto === 0 || resto === 1) return 0;
  if (resto === 10) return 1;
  return 11 - resto;
}

/**
 * Calcula a data de vencimento a partir do Fator de Vencimento FEBRABAN.
 * Considera o marco base inicial (07/10/1997) e a virada do fator ocorrida em 22/02/2025.
 */
function calcularDataVencimentoBancario(fatorStr) {
  const fator = parseInt(fatorStr, 10);
  if (!fator || isNaN(fator) || fator === 0) return null;

  // Data base de referência 1: 07/10/1997
  // Em 22/02/2025 o fator atingiu 9999 e reiniciou em 1000.
  let dataBase;
  if (fator >= 1000 && fator <= 9999) {
    // Estimativa moderna (pós fev/2025 ou janela atual)
    const base2025 = new Date(Date.UTC(2025, 1, 22)); // 22/02/2025
    const base1997 = new Date(Date.UTC(1997, 9, 7));  // 07/10/1997

    // Se a soma a partir de 1997 cair no passado antes de 2024, usamos a nova base de 2025
    const dataCalculadaAntiga = new Date(base1997.getTime() + fator * 86400000);
    const dataCalculadaNova = new Date(base2025.getTime() + (fator - 1000) * 86400000);

    // Seleciona a data mais condizente com a época atual
    const anoAntigo = dataCalculadaAntiga.getUTCFullYear();
    dataBase = anoAntigo >= 2023 && anoAntigo <= 2025 ? dataCalculadaAntiga : dataCalculadaNova;
  } else {
    dataBase = new Date(Date.UTC(1997, 9, 7));
    dataBase = new Date(dataBase.getTime() + fator * 86400000);
  }

  const dia = String(dataBase.getUTCDate()).padStart(2, '0');
  const mes = String(dataBase.getUTCMonth() + 1).padStart(2, '0');
  const ano = dataBase.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Valida linha digitável de Boleto Bancário (47 dígitos)
 */
function validarBoletoBancario(numeros) {
  if (numeros.length !== 47) return null;

  const campo1 = numeros.substring(0, 9);
  const dv1 = parseInt(numeros.substring(9, 10), 10);

  const campo2 = numeros.substring(10, 20);
  const dv2 = parseInt(numeros.substring(20, 21), 10);

  const campo3 = numeros.substring(21, 31);
  const dv3 = parseInt(numeros.substring(31, 32), 10);

  const dvGeral = numeros.substring(32, 33);
  const campoFatorValor = numeros.substring(33, 47);

  const dv1Calculado = modulo10(campo1);
  const dv2Calculado = modulo10(campo2);
  const dv3Calculado = modulo10(campo3);

  const isValid = (dv1 === dv1Calculado && dv2 === dv2Calculado && dv3 === dv3Calculado);

  const fatorStr = campoFatorValor.substring(0, 4);
  const valorStr = campoFatorValor.substring(4, 14);
  const valorCentavos = parseInt(valorStr, 10);

  let valorFormatado = null;
  if (!isNaN(valorCentavos) && valorCentavos > 0) {
    valorFormatado = (valorCentavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  const vencimento = calcularDataVencimentoBancario(fatorStr);
  const codigoBanco = numeros.substring(0, 3);

  return {
    valido: isValid,
    tipo: 'Boleto Bancário (FEBRABAN)',
    formato: 'BANCARIO',
    codigoBanco,
    banco: identificarBanco(codigoBanco),
    valorCentavos: !isNaN(valorCentavos) && valorCentavos > 0 ? valorCentavos : null,
    valorCalculado: valorFormatado,
    dataVencimentoCalculada: vencimento,
    mensagem: isValid
      ? 'Código de barras autêntico e validado matematicamente com sucesso.'
      : 'Os dígitos verificadores do código de barras não conferem (possível erro de leitura ou foto desfocada).'
  };
}

/**
 * Valida linha digitável de Concessionária / Arrecadação (48 dígitos, inicia com 8)
 */
function validarBoletoConcessionaria(numeros) {
  if (numeros.length !== 48 || numeros[0] !== '8') return null;

  const subTipo = numeros[1]; // 1: Prefeituras, 2: Saneamento, 3: Energia/Gás, 4: Telecom, etc.
  const tipoMoeda = numeros[2]; // 6 ou 8: Modulo 10; 7 ou 9: Modulo 11

  const b1 = numeros.substring(0, 11);
  const dv1 = parseInt(numeros.substring(11, 12), 10);

  const b2 = numeros.substring(12, 23);
  const dv2 = parseInt(numeros.substring(23, 24), 10);

  const b3 = numeros.substring(24, 35);
  const dv3 = parseInt(numeros.substring(35, 36), 10);

  const b4 = numeros.substring(36, 47);
  const dv4 = parseInt(numeros.substring(47, 48), 10);

  const usaModulo10 = (tipoMoeda === '6' || tipoMoeda === '8');
  const funcDV = usaModulo10 ? modulo10 : modulo11Concessionaria;

  const isValid = (
    funcDV(b1) === dv1 &&
    funcDV(b2) === dv2 &&
    funcDV(b3) === dv3 &&
    funcDV(b4) === dv4
  );

  // No segmento de arrecadação, o valor normalmente fica entre os dígitos 4 e 15 (desconsiderando os DVs)
  const corpoSemDv = b1 + b2 + b3 + b4;
  const valorStr = corpoSemDv.substring(4, 15);
  const valorCentavos = parseInt(valorStr, 10);

  let valorFormatado = null;
  if (!isNaN(valorCentavos) && valorCentavos > 0) {
    valorFormatado = (valorCentavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  const tiposNomes = {
    '1': 'Prefeitura / IPTU / ISS',
    '2': 'Saneamento / Água e Esgoto',
    '3': 'Energia Elétrica / Gás',
    '4': 'Telecomunicações / Internet / Telefone',
    '5': 'Órgãos Governamentais / GRU / GPS'
  };

  return {
    valido: isValid,
    tipo: `Conta de Serviço Público (${tiposNomes[subTipo] || 'Concessionária'})`,
    formato: 'ARRECADACAO',
    segmento: subTipo,
    segmentoNome: tiposNomes[subTipo] || null,
    valorCentavos: !isNaN(valorCentavos) && valorCentavos > 0 ? valorCentavos : null,
    valorCalculado: valorFormatado,
    dataVencimentoCalculada: null, // Concessionárias não possuem fator padronizado obrigatório
    mensagem: isValid
      ? 'Linha digitável de concessionária autêntica e validada com sucesso.'
      : 'Dígitos verificadores da concessionária não conferem.'
  };
}

/**
 * Função principal de validação para qualquer código de barras ou linha digitável brasileira
 */
export function validateBarcode(rawBarcode) {
  const digits = sanitizeBarcode(rawBarcode);
  if (!digits || (digits.length !== 47 && digits.length !== 48)) {
    return {
      valido: false,
      mensagem: 'Código de barras não identificado ou tamanho incompleto.'
    };
  }

  if (digits.length === 47) {
    return validarBoletoBancario(digits);
  }

  if (digits.length === 48) {
    return validarBoletoConcessionaria(digits);
  }

  return {
    valido: false,
    mensagem: 'Formato de linha digitável não reconhecido.'
  };
}
