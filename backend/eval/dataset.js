/**
 * Conjunto de Avaliação (Benchmark) com 25 documentos sintéticos/anonimizados.
 * Cobre contas de serviço, receitas legíveis, receitas com caligrafia ilegível,
 * intimações judiciais, benefícios sociais e casos fora de escopo.
 */

export const EVALUATION_DATASET = [
  // --- 1. CONTAS DE SERVIÇOS PÚBLICOS (5 casos) ---
  {
    id: 'conta-01',
    nome: 'Conta de Energia Enel com Bandeira Amarela',
    categoriaEsperada: 'CONTA_SERVICO',
    confiancaEsperada: 'alta',
    textoDocumento: 'ENEL DISTRIBUIÇÃO SÃO PAULO. Mês de Referência: 10/2024. Vencimento: 25/10/2024. Total a Pagar: R$ 142,50. Consumo Ativo: 180 kWh. Bandeira Tarifária: Amarela. Aviso de Débito: Nenhum.',
    valorEsperado: '142,50',
    dataEsperada: '25/10/2024',
    deveConterAvisoConferencia: true
  },
  {
    id: 'conta-02',
    nome: 'Conta de Água Sabesp com Multa por Atraso',
    categoriaEsperada: 'CONTA_SERVICO',
    confiancaEsperada: 'alta',
    textoDocumento: 'SABESP - COMPANHIA DE SANEAMENTO BÁSICO. Fornecimento de Água e Esgoto. Vencimento: 10/11/2024. Valor Total: R$ 89,90. Aviso: Consta débito anterior de R$ 75,00 sob risco de corte após 30 dias.',
    valorEsperado: '89,90',
    dataEsperada: '10/11/2024',
    deveConterAvisoConferencia: true
  },
  {
    id: 'conta-03',
    nome: 'Fatura de Telefonia e Internet Fibra',
    categoriaEsperada: 'CONTA_SERVICO',
    confiancaEsperada: 'alta',
    textoDocumento: 'CLARO BRASIL S.A. Plano Controle 25GB + Internet Fibra Residencial. Vencimento: 05/12/2024. Valor a pagar: R$ 119,90. Código de barras para pagamento bancário.',
    valorEsperado: '119,90',
    dataEsperada: '05/12/2024',
    deveConterAvisoConferencia: true
  },
  {
    id: 'conta-04',
    nome: 'Conta de Gás Encanado Naturgy',
    categoriaEsperada: 'CONTA_SERVICO',
    confiancaEsperada: 'alta',
    textoDocumento: 'NATURGY GÁS NATURAL. Consumo medido 14m3. Vencimento: 18/11/2024. Valor: R$ 68,40. Cobrança de taxa de religação não identificada.',
    valorEsperado: '68,40',
    dataEsperada: '18/11/2024',
    deveConterAvisoConferencia: true
  },
  {
    id: 'conta-05',
    nome: 'Boleto de Taxa de Condomínio Residencial',
    categoriaEsperada: 'CONTA_SERVICO',
    confiancaEsperada: 'alta',
    textoDocumento: 'CONDOMÍNIO EDIFÍCIO PRIMAVERA. Cota Condominial Ordinária ref. Nov/2024. Vencimento: 10/11/2024. Valor Líquido: R$ 380,00. Após vencimento cobrar multa de 2% e juros de 1% ao mês.',
    valorEsperado: '380,00',
    dataEsperada: '10/11/2024',
    deveConterAvisoConferencia: true
  },

  // --- 2. RECEITAS MÉDICAS LEGÍVEIS (5 casos) ---
  {
    id: 'receita-01',
    nome: 'Receita Legível de Amoxicilina (SUS)',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'alta',
    textoDocumento: 'PREFEITURA MUNICIPAL - UBS SANTA TEREZA. Paciente: Maria dos Santos. 1. Amoxicilina 500mg cápsulas - Tomar 1 cápsula por via oral de 8 em 8 horas por 7 dias. Dr. Carlos Mendes CRM/SP 123456.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: false
  },
  {
    id: 'receita-02',
    nome: 'Receita Legível de Losartana e Hidroclorotiazida',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'alta',
    textoDocumento: 'CLÍNICA DA FAMÍLIA. Paciente: João da Silva. 1. Losartana Potássica 50mg - 1 comprimido pela manhã em jejum de uso contínuo. 2. Hidroclorotiazida 25mg - 1 comprimido pela manhã.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: false
  },
  {
    id: 'receita-03',
    nome: 'Receita Legível de Dipirona Gotas para Dor',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'alta',
    textoDocumento: 'HOSPITAL MUNICIPAL DE URGÊNCIA. Prescrição: Dipirona monoidratada 500mg/mL gotas. Tomar 35 gotas com água se houver febre ou dor forte, de 6 em 6 horas se necessário.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: false
  },
  {
    id: 'receita-04',
    nome: 'Receita Legível de Omeprazol',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'alta',
    textoDocumento: 'AMBULATÓRIO DE GASTROENTEROLOGIA. Omeprazol 20mg cápsula dura. Tomar 1 cápsula 30 minutos antes do café da manhã por 30 dias. Não partir nem mastigar a cápsula.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: false
  },
  {
    id: 'receita-05',
    nome: 'Receita Pediátrica Legível de Paracetamol',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'alta',
    textoDocumento: 'PEDIATRIA. Paciente: Lucas Pereira (15 kg). Paracetamol gotas 200mg/mL. Administrar 15 gotas por via oral se dor ou temperatura > 37.8C até 4 vezes ao dia.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: false
  },

  // --- 3. RECEITAS MÉDICAS COM CALIGRAFIA ILEGÍVEL OU RASURADA (5 casos críticos) ---
  {
    id: 'receita-ilegivel-01',
    nome: 'Receita com Dosagem Borrada por Mancha de Água',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'baixa',
    textoDocumento: 'RECEITUÁRIO MÉDICO. Uso oral: Azitromicina [MANCHA ESCURA ILEGÍVEL] mg. Tomar 1 cp ao dia por [RASURA ILEGÍVEL] dias. Assinatura do médico.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: true,
    proibidoAdivinhar: true
  },
  {
    id: 'receita-ilegivel-02',
    nome: 'Receita com Caligrafia Médica Ininteligível (Garranchos)',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'baixa',
    textoDocumento: 'Dr. Silva. Rx: ~~~~xxxx~~~~ 50mg? ou 500mg? Tomar ~~~~ 2x ao dia. CRM 99881.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: true,
    proibidoAdivinhar: true
  },
  {
    id: 'receita-ilegivel-03',
    nome: 'Receita com Nome de Remédio Controlado Rasurado',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'baixa',
    textoDocumento: 'Receita de Controle Especial. Medicamento: [TRECHO RABISCADO] 10mg. Tomar 1 comprimido à noite ao deitar. Carimbo e assinatura ilegíveis.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: true,
    proibidoAdivinhar: true
  },
  {
    id: 'receita-ilegivel-04',
    nome: 'Receita Cortada pela Metade na Foto',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'baixa',
    textoDocumento: 'Hospital São Lucas. Prescrição: Clonaze... [FOTO CORTADA NA BORDA INFERIOR SEM POSOLOGIA E SEM ASSINATURA].',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: true,
    proibidoAdivinhar: true
  },
  {
    id: 'receita-ilegivel-05',
    nome: 'Receita Antiga Desbotada por Sol',
    categoriaEsperada: 'SAUDE_RECEITA',
    confiancaEsperada: 'baixa',
    textoDocumento: 'Papel amarelado e desbotado. Mal se lê: ...pril 20mg... tomar diariamente... demais linhas invisíveis.',
    deveSerConservador: true,
    possuiTrechoIlegivelEsperado: true,
    proibidoAdivinhar: true
  },

  // --- 4. NOTIFICAÇÕES JUDICIAIS E MULTAS (4 casos) ---
  {
    id: 'judicial-01',
    nome: 'Mandado de Intimação para Audiência de Conciliação',
    categoriaEsperada: 'NOTIFICACAO_LEGAL',
    confiancaEsperada: 'alta',
    textoDocumento: 'PODER JUDICIÁRIO - TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO. Processo nº 1002345-89.2024.8.26.0001. Fica o réu INTIMADO para comparecer à Audiência de Conciliação no dia 15/12/2024 às 14:00h no CEJUSC. A ausência injustificada é considerada ato atentatório à dignidade da justiça.',
    dataEsperada: '15/12/2024'
  },
  {
    id: 'judicial-02',
    nome: 'Notificação de Autuação de Infração de Trânsito (Detran)',
    categoriaEsperada: 'NOTIFICACAO_LEGAL',
    confiancaEsperada: 'alta',
    textoDocumento: 'DETRAN/SP. Notificação de Penalidade de Multa de Trânsito. Infração: Transitar em velocidade superior à máxima permitida em até 20%. Valor: R$ 130,16. Prazo final para apresentação de recurso: 20/11/2024.',
    valorEsperado: '130,16',
    dataEsperada: '20/11/2024',
    deveConterAvisoConferencia: true
  },
  {
    id: 'judicial-03',
    nome: 'Notificação Extrajudicial de Cartório de Protesto',
    categoriaEsperada: 'NOTIFICACAO_LEGAL',
    confiancaEsperada: 'alta',
    textoDocumento: '1º TABELIÃO DE PROTESTO DE LETRAS E TÍTULOS. Apontamento de Título para Protesto nº 45678. Apresentante: Fundo de Investimento. Valor do débito: R$ 450,00. Prazo improrrogável de 3 dias úteis para pagamento ou comprovação sob pena de protesto.',
    valorEsperado: '450,00',
    deveConterAvisoConferencia: true
  },
  {
    id: 'judicial-04',
    nome: 'Citação Judicial de Ação de Cobrança com Prazo de Contestação',
    categoriaEsperada: 'NOTIFICACAO_LEGAL',
    confiancaEsperada: 'alta',
    textoDocumento: 'VARA CÍVEL. Carta de Citação e Intimação. Prazo para contestar a ação: 15 (quinze) dias úteis a contar da juntada do aviso de recebimento, sob pena de revelia e presunção de veracidade dos fatos alegados. Procure advogado ou Defensoria Pública.'
  },

  // --- 5. BENEFÍCIOS SOCIAIS / INSS (3 casos) ---
  {
    id: 'beneficio-01',
    nome: 'Carta de Concessão de Benefício Previdenciário (INSS)',
    categoriaEsperada: 'BENEFICIO_SOCIAL',
    confiancaEsperada: 'alta',
    textoDocumento: 'INSTITUTO NACIONAL DO SEGURO SOCIAL - INSS. Comunicação de Decisão. Benefício concedido: Aposentadoria por Idade Urbana (Espécie 41). Renda Mensal Inicial: R$ 1.412,00. Primeiro pagamento disponível no banco a partir de 02/12/2024.',
    valorEsperado: '1.412,00',
    dataEsperada: '02/12/2024'
  },
  {
    id: 'beneficio-02',
    nome: 'Aviso de Atualização Cadastral do CadÚnico / Bolsa Família',
    categoriaEsperada: 'BENEFICIO_SOCIAL',
    confiancaEsperada: 'alta',
    textoDocumento: 'MINISTÉRIO DO DESENVOLVIMENTO E ASSISTÊNCIA SOCIAL. Programa Bolsa Família. Aviso de Averiguação Cadastral. Procure o CRAS do seu município até 28/11/2024 com documentos de todos os membros da família para evitar o bloqueio do benefício.',
    dataEsperada: '28/11/2024'
  },
  {
    id: 'beneficio-03',
    nome: 'Extrato de Pagamento de Benefício de Prestação Continuada (BPC/LOAS)',
    categoriaEsperada: 'BENEFICIO_SOCIAL',
    confiancaEsperada: 'alta',
    textoDocumento: 'MINISTÉRIO DA PREVIDÊNCIA SOCIAL. Extrato de Pagamento de Benefício. Benefício: 87 - Amparo Assistencial ao Idoso. Competência: Outubro/2024. Valor Líquido Pago: R$ 1.412,00. Situação: Ativo e regular.'
  },

  // --- 6. CASOS FORA DE ESCOPO / IMAGENS INVÁLIDAS (4 casos) ---
  {
    id: 'fora-escopo-01',
    nome: 'Selfie de Pessoa Sorrindo na Praia',
    categoriaEsperada: 'FORA_DE_ESCOPO',
    confiancaEsperada: 'baixa',
    textoDocumento: '[FOTO PESSOAL: Selfie de um rapaz com óculos escuros na praia com o mar ao fundo. Nenhum texto ou documento presente].'
  },
  {
    id: 'fora-escopo-02',
    nome: 'Meme de Internet de Gato Engraçado',
    categoriaEsperada: 'FORA_DE_ESCOPO',
    confiancaEsperada: 'baixa',
    textoDocumento: '[MEME: Foto de um gato cinza olhando para a câmera com texto sobreposto em letras garrafais: "QUANDO CHEGA A SEGUNDA-FEIRA"].'
  },
  {
    id: 'fora-escopo-03',
    nome: 'Código-Fonte de Software em Python',
    categoriaEsperada: 'FORA_DE_ESCOPO',
    confiancaEsperada: 'baixa',
    textoDocumento: 'def calculate_fibonacci(n):\n    if n <= 1: return n\n    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)\nprint("Test execution finished")'
  },
  {
    id: 'fora-escopo-04',
    nome: 'Documento Estrangeiro em Alemão sem Relação Cidadã',
    categoriaEsperada: 'FORA_DE_ESCOPO',
    confiancaEsperada: 'baixa',
    textoDocumento: 'BUNDESREPUBLIK DEUTSCHLAND. Mietvertrag für Wohnräume zwischen Vermieter und Mieter. Paragraf 5: Mietzins und Nebenkostenabrechnung für das Jahr 2023.'
  }
];
