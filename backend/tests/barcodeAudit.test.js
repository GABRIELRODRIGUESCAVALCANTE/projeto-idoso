/**
 * Testes da auditoria antifraude de boletos (node --test).
 * Executar: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBarcode } from '../utils/barcodeValidator.js';
import { auditBarcode, applyBarcodeAudit, parseBRLToCents } from '../utils/barcodeAudit.js';

// ---------- Geradores de linhas digitáveis válidas (somente para teste) ----------
function mod10(bloco) {
  let soma = 0;
  let peso = 2;
  for (let i = bloco.length - 1; i >= 0; i--) {
    let m = Number(bloco[i]) * peso;
    if (m > 9) m = Math.floor(m / 10) + (m % 10);
    soma += m;
    peso = peso === 2 ? 1 : 2;
  }
  const r = soma % 10;
  return r === 0 ? 0 : 10 - r;
}

function mod11Febraban(bloco) {
  let soma = 0;
  let peso = 2;
  for (let i = bloco.length - 1; i >= 0; i--) {
    soma += Number(bloco[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const dv = 11 - (soma % 11);
  return dv === 0 || dv === 10 || dv === 11 ? 1 : dv;
}

export function gerarLinhaBancaria({ banco = '341', fator = '1000', valorCentavos = 14250, campoLivre = '1234567890123456789012345' }) {
  const valor = String(valorCentavos).padStart(10, '0');
  const semDv = `${banco}9${fator}${valor}${campoLivre}`;
  const dvGeral = mod11Febraban(semDv);
  const c1 = `${banco}9${campoLivre.slice(0, 5)}`;
  const c2 = campoLivre.slice(5, 15);
  const c3 = campoLivre.slice(15, 25);
  return `${c1}${mod10(c1)}${c2}${mod10(c2)}${c3}${mod10(c3)}${dvGeral}${fator}${valor}`;
}

export function gerarLinhaArrecadacao({ segmento = '3', valorCentavos = 14250 }) {
  // Identificador de valor 6 => DV por módulo 10
  const valor = String(valorCentavos).padStart(11, '0');
  const corpoSemDvGeral = `8${segmento}6${valor}` + '0'.repeat(44 - 3 - 11 - 1);
  const dvGeral = mod10(corpoSemDvGeral);
  const corpo = corpoSemDvGeral.slice(0, 3) + dvGeral + corpoSemDvGeral.slice(3);
  const blocos = [0, 11, 22, 33].map((i) => corpo.slice(i, i + 11));
  return blocos.map((b) => `${b}${mod10(b)}`).join('');
}

// ---------- Testes ----------
test('parseBRLToCents entende formatos brasileiros', () => {
  assert.equal(parseBRLToCents('R$ 142,50'), 14250);
  assert.equal(parseBRLToCents('R$ 1.234,56'), 123456);
  assert.equal(parseBRLToCents('Total: 89,90 reais'), 8990);
  assert.equal(parseBRLToCents('Não se aplica'), null);
});

test('boleto bancário válido identifica o banco emissor', () => {
  const info = validateBarcode(gerarLinhaBancaria({ banco: '104' }));
  assert.equal(info.valido, true);
  assert.equal(info.banco, 'Caixa Econômica Federal');
  assert.equal(info.valorCentavos, 14250);
});

test('valor do papel igual ao código => consistente', () => {
  const doc = {
    categoria: 'OUTRO',
    tipoDocumento: 'Boleto de mensalidade',
    linhaDigitavel: gerarLinhaBancaria({ valorCentavos: 14250 }),
    valoresEPrazos: { valorPrincipal: 'R$ 142,50' }
  };
  assert.equal(auditBarcode(doc).auditoria.status, 'consistente');
});

test('valor do papel diferente do código => divergente (suspeita de golpe)', () => {
  const doc = {
    categoria: 'OUTRO',
    tipoDocumento: 'Boleto de mensalidade',
    linhaDigitavel: gerarLinhaBancaria({ valorCentavos: 98700 }),
    valoresEPrazos: { valorPrincipal: 'R$ 142,50' },
    pontosDeAtencao: []
  };
  const out = applyBarcodeAudit(doc);
  assert.equal(out.codigoBarrasInfo.auditoria.status, 'divergente');
  assert.equal(out.confianca, 'baixa');
  assert.match(out.valoresEPrazos.avisoConferencia, /NÃO PAGUE/);
  // O valor do papel não pode ser sobrescrito silenciosamente
  assert.equal(out.valoresEPrazos.valorPrincipal, 'R$ 142,50');
});

test('conta de luz com boleto bancário => atenção', () => {
  const doc = {
    categoria: 'CONTA_SERVICO',
    tipoDocumento: 'Conta de Energia Elétrica (Enel)',
    linhaDigitavel: gerarLinhaBancaria({ banco: '260' }),
    valoresEPrazos: { valorPrincipal: 'R$ 142,50' }
  };
  assert.equal(auditBarcode(doc).auditoria.status, 'atencao');
});

test('conta de luz com código de arrecadação de energia => consistente', () => {
  const doc = {
    categoria: 'CONTA_SERVICO',
    tipoDocumento: 'Conta de Energia Elétrica (Enel)',
    linhaDigitavel: gerarLinhaArrecadacao({ segmento: '3' }),
    valoresEPrazos: { valorPrincipal: 'R$ 142,50' }
  };
  const info = auditBarcode(doc);
  assert.equal(info.valido, true);
  assert.equal(info.auditoria.status, 'consistente');
});

test('conta de luz com código de telecom => atenção', () => {
  const doc = {
    categoria: 'CONTA_SERVICO',
    tipoDocumento: 'Conta de Luz',
    linhaDigitavel: gerarLinhaArrecadacao({ segmento: '4' }),
    valoresEPrazos: { valorPrincipal: 'R$ 142,50' }
  };
  assert.equal(auditBarcode(doc).auditoria.status, 'atencao');
});

test('dígito verificador adulterado => ilegível', () => {
  const linha = gerarLinhaBancaria({});
  const adulterada = linha.slice(0, 9) + ((Number(linha[9]) + 1) % 10) + linha.slice(10);
  const doc = { linhaDigitavel: adulterada, valoresEPrazos: { valorPrincipal: 'R$ 142,50' }, pontosDeAtencao: [] };
  const out = applyBarcodeAudit(doc);
  assert.equal(out.codigoBarrasInfo.auditoria.status, 'ilegivel');
  assert.equal(out.confianca, 'baixa');
});
