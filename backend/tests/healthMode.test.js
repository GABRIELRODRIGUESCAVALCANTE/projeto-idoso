import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDocumentAnalysis } from '../schemas/documentSchema.js';

const basePayload = {
  tipoDocumento: 'Orientações Após Extração de Dente',
  confianca: 'alta',
  resumoSimples: 'Esta folha explica os cuidados depois de tirar o dente.',
  acoesEssenciais: ['Morda a gaze por 30 minutos.'],
  valoresEPrazos: {
    valorPrincipal: 'Não se aplica',
    dataVencimento: 'Retorno em 7 dias',
    consequenciaAtraso: 'Nenhuma',
    avisoConferencia: ''
  },
  linhaDigitavel: null,
  pontosDeAtencao: [],
  alertaEtico: 'Siga sempre a orientação do seu dentista.',
  textoParaVoz: 'Olá! Estes são os cuidados depois de tirar o dente.'
};

test('aceita as novas categorias de saúde e odontologia', () => {
  for (const categoria of ['ODONTOLOGIA', 'ORIENTACAO_POS_PROCEDIMENTO', 'PEDIDO_EXAME', 'RESULTADO_EXAME', 'VACINACAO']) {
    const validation = validateDocumentAnalysis({ ...basePayload, categoria });
    assert.equal(validation.isValid, true, `categoria ${categoria} deveria ser válida`);
    assert.equal(validation.data.categoria, categoria);
  }
});

test('preserva sinaisDeAlerta e usa lista vazia quando ausente', () => {
  const comAlertas = validateDocumentAnalysis({
    ...basePayload,
    categoria: 'ORIENTACAO_POS_PROCEDIMENTO',
    sinaisDeAlerta: ['Sangramento que não para depois de 2 horas', 'Febre acima de 38 °C']
  });
  assert.equal(comAlertas.isValid, true);
  assert.deepEqual(comAlertas.data.sinaisDeAlerta, ['Sangramento que não para depois de 2 horas', 'Febre acima de 38 °C']);

  const semAlertas = validateDocumentAnalysis({ ...basePayload, categoria: 'CONTA_SERVICO' });
  assert.equal(semAlertas.isValid, true);
  assert.deepEqual(semAlertas.data.sinaisDeAlerta, []);
});
