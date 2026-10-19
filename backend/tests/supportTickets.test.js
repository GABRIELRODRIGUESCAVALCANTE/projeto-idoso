import { test } from 'node:test';
import assert from 'node:assert/strict';
import { documentSchema, createTicketSchema, validateDocumentAnalysis } from '../schemas/documentSchema.js';

test('valida documento com categoria EQUIPAMENTO_HARDWARE e diagnosticoTecnico', () => {
  const payload = {
    categoria: 'EQUIPAMENTO_HARDWARE',
    tipoDocumento: 'Roteador Wi-Fi / Fibra Óptica',
    confianca: 'alta',
    resumoSimples: 'A luz vermelha LOS indica que o cabo de fibra óptica está sem sinal.',
    acoesEssenciais: [
      'Verifique se o cabo amarelo está conectado.',
      'Reinicie o roteador na tomada por 20 segundos.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Gratuito',
      dataVencimento: 'Não possui',
      consequenciaAtraso: 'Nenhuma',
      avisoConferencia: 'Luzes: LOS vermelho'
    },
    linhaDigitavel: null,
    pontosDeAtencao: ['Luz PON apagada'],
    alertaEtico: 'Não olhe para o laser do cabo óptico',
    textoParaVoz: 'Atenção, a luz vermelha indica falta de sinal de internet.',
    diagnosticoTecnico: {
      dispositivoIdentificado: 'ONU ZTE GPON',
      statusLeds: { los: 'vermelho_piscando', pon: 'apagado' },
      codigoErroDetectado: 'LOS_OPTICAL_FAIL',
      causaProvavel: 'Rompimento da fibra externa',
      nivelGravidade: 'alta',
      acaoRecomendadaTecnico: 'Agendar fusão de fibra óptica'
    }
  };

  const validation = validateDocumentAnalysis(payload);
  assert.equal(validation.isValid, true);
  assert.equal(validation.data.categoria, 'EQUIPAMENTO_HARDWARE');
  assert.equal(validation.data.diagnosticoTecnico.nivelGravidade, 'alta');
});

test('valida documento com categoria ERRO_SISTEMA_TELA e ALERTA_GOLPE_SUSPEITO', () => {
  const telaPayload = {
    categoria: 'ERRO_SISTEMA_TELA',
    tipoDocumento: 'Tela Azul de Erro',
    confianca: 'media',
    resumoSimples: 'O computador desligou para proteger os arquivos.',
    acoesEssenciais: ['Aguarde reiniciar'],
    valoresEPrazos: {
      valorPrincipal: 'Não se aplica',
      dataVencimento: 'Não possui',
      consequenciaAtraso: 'Nenhuma',
      avisoConferencia: 'Código CRITICAL_PROCESS_DIED'
    },
    pontosDeAtencao: [],
    alertaEtico: 'Não forneça senhas por telefone',
    textoParaVoz: 'O computador reiniciará em instantes.'
  };

  const validation = validateDocumentAnalysis(telaPayload);
  assert.equal(validation.isValid, true);
  assert.equal(validation.data.categoria, 'ERRO_SISTEMA_TELA');
});

test('createTicketSchema valida campos obrigatórios de abertura de chamado', () => {
  const ticketValido = {
    nomeCliente: 'João Pereira',
    contato: '(11) 98765-4321',
    tipoProblema: 'Roteador Fibra sem Sinal',
    diagnosticoTecnico: { causaProvavel: 'Drop rompido', nivelGravidade: 'alta' },
    etapasTentadas: ['Reiniciou na tomada']
  };

  const result = createTicketSchema.safeParse(ticketValido);
  assert.equal(result.success, true);
  assert.equal(result.data.nomeCliente, 'João Pereira');

  // Teste de rejeição por falta de contato
  const ticketInvalido = {
    nomeCliente: 'Maria',
    contato: ''
  };
  const resultInvalido = createTicketSchema.safeParse(ticketInvalido);
  assert.equal(resultInvalido.success, false);
});
