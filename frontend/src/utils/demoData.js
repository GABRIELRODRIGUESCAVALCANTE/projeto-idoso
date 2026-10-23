/**
 * Conjunto de dados de demonstração pré-configurados e auditados matematicamente.
 * Garante que a apresentação ao vivo funcione 100% mesmo se a internet do auditório oscilar.
 */

export const DEMO_PRESETS = {
  conta_luz: {
    id: 'conta_luz',
    titulo: 'Conta de Luz (Auditada)',
    descricao: 'Conta com jargões e código de barras 100% autêntico',
    tag: 'Autêntico',
    categoria: 'CONTA_SERVICO',
    tipoDocumento: 'Conta de Energia Elétrica (Enel)',
    confianca: 'alta',
    resumoSimples: 'Esta é a sua conta de luz do mês de outubro. O valor ficou um pouco mais alto porque o país usou usinas mais caras para gerar energia (bandeira amarela).',
    acoesEssenciais: [
      'Pagar a conta de R$ 142,50 até o dia 25 de outubro de 2026.',
      'Você pode pagar pelo aplicativo do banco, casa lotérica ou copiando a linha digitável.',
      'Guardar o comprovante de pagamento por 1 ano.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'R$ 142,50',
      dataVencimento: '25/10/2026',
      consequenciaAtraso: 'Após 15 dias de atraso pode haver cobrança de juros e aviso de corte.',
      avisoConferencia: '✅ Valor conferido matematicamente pelo código de barras: R$ 142,50 com vencimento em 25/10/2026'
    },
    linhaDigitavel: '836500000010425000000009000000000000000000000000',
    codigoBarrasInfo: {
      valido: true,
      tipo: 'Conta de Serviço Público (Energia Elétrica / Gás)',
      formato: 'ARRECADACAO',
      segmento: '3',
      segmentoNome: 'Energia Elétrica / Gás',
      valorCentavos: 14250,
      valorCalculado: 'R$ 142,50',
      dataVencimentoCalculada: null,
      mensagem: 'Linha digitável de concessionária autêntica e validada com sucesso.',
      auditoria: {
        status: 'consistente',
        alertas: [],
        valorLidoNoPapel: 'R$ 142,50'
      }
    },
    pontosDeAtencao: [
      'Veio cobrado um seguro residencial opcional de R$ 9,90 que você pode pedir para cancelar se não contratou.',
      'Seu consumo foi de 180 kWh, 15% menor do que no mês passado.'
    ],
    alertaEtico: 'Este resumo é uma ajuda cidadã. Em caso de dúvidas sobre cobrança indevida, ligue para a Enel pelo 0800 oficial.',
    textoParaVoz: 'Olá! Este documento é a sua conta de luz da Enel. O valor total é de cento e quarenta e dois reais e cinquenta centavos, e o vencimento é no dia vinte e cinco de outubro. Você precisa pagar até essa data para evitar juros ou corte. Um ponto de atenção é que veio cobrado um seguro opcional de nove reais e noventa centavos que pode ser cancelado se você não pediu.',
    meta: {
      provedor: 'gemini',
      modelo: 'gemini-2.5-flash',
      tempoProcessamentoMs: 1420,
      bytesRecebidos: 358400,
      arquivos: 1
    }
  },

  golpe_adulterado: {
    id: 'golpe_adulterado',
    titulo: 'Alerta Antifraude (Boleto Falso)',
    descricao: 'Conta que diz R$ 142,50, mas cobra R$ 987,00 no código',
    tag: 'Suspeita de Fraude',
    categoria: 'CONTA_SERVICO',
    tipoDocumento: 'Conta de Luz Falsa com Boleto Adulterado',
    confianca: 'baixa',
    resumoSimples: 'Cuidado! A aparência deste papel diz ser uma conta de luz da Enel de R$ 142,50, mas a linha de pagamento pertence a um banco comercial e cobra um valor quase sete vezes maior.',
    acoesEssenciais: [
      'NÃO realize o pagamento deste boleto sob hipótese alguma.',
      'Entre em contato imediatamente com o 0800 oficial impresso no verso ou vá à agência física da empresa.',
      'Se recebeu por e-mail ou WhatsApp de número desconhecido, bloqueie o remetente.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'R$ 142,50',
      dataVencimento: '25/10/2026',
      consequenciaAtraso: 'Não pague antes de confirmar a autenticidade.',
      avisoConferencia: '🚨 NÃO PAGUE AINDA: O papel mostra R$ 142,50, mas o código de barras cobra R$ 987,00. Contas de luz costumam começar com 8, mas este é um boleto bancário do Nubank. Ligue para a empresa pelo telefone oficial antes de pagar.'
    },
    linhaDigitavel: '26091234566789012345767890123457110000000098700',
    codigoBarrasInfo: {
      valido: true,
      tipo: 'Boleto Bancário (FEBRABAN)',
      formato: 'BANCARIO',
      codigoBanco: '260',
      banco: 'Nubank',
      valorCentavos: 98700,
      valorCalculado: 'R$ 987,00',
      dataVencimentoCalculada: '22/02/2025',
      mensagem: 'Código de barras de instituição financeira não condizente com a concessionária.',
      auditoria: {
        status: 'divergente',
        alertas: [
          'O papel mostra R$ 142,50, mas o código de barras cobra R$ 987,00.',
          'Contas de luz/gás costumam ter código começando com 8. Este é um boleto bancário do Nubank. Confirme no canal oficial da empresa.'
        ],
        valorLidoNoPapel: 'R$ 142,50'
      }
    },
    pontosDeAtencao: [
      '🚨 ALERTA CRÍTICO: Suspeita do golpe do boleto adulterado! O código de barras foi trocado para desviar o pagamento para outra conta bancária.',
      'O beneficiário do boleto não é a concessionária oficial de energia elétrica.'
    ],
    alertaEtico: 'Alerta preventivo antifraude gerado por auditoria determinística matemática.',
    textoParaVoz: 'Atenção urgente! Não pague este documento. Nossa auditoria matemática identificou que o código de barras cobra novecentos e oitenta e sete reais, enquanto o texto do papel diz cento e quarenta e dois reais. Além disso, o código é de um banco e não da concessionária. Isto é um indício grave de boleto falso.',
    meta: {
      provedor: 'gemini',
      modelo: 'gemini-2.5-flash',
      tempoProcessamentoMs: 1150,
      bytesRecebidos: 412000,
      arquivos: 1
    }
  },

  receita_medica: {
    id: 'receita_medica',
    titulo: 'Receita Médica (com Horários)',
    descricao: 'Prescrição com plano diário para cuidador e família',
    tag: 'Saúde / Remédios',
    categoria: 'SAUDE_RECEITA',
    tipoDocumento: 'Receita Médica Ambulatorial',
    confianca: 'alta',
    resumoSimples: 'Esta é uma receita médica com 3 medicamentos receitados para controle de pressão arterial e colesterol. As instruções de dosagem e horários foram organizadas para sua rotina diária.',
    acoesEssenciais: [
      'Comprar ou retirar os remédios no posto de saúde com esta receita original e documento com foto.',
      'Seguir os horários organizados no plano abaixo.',
      'Em caso de tontura ou enjoo, avise seu médico ou consulte o farmacêutico.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Gratuito no SUS / Farmácia Popular',
      dataVencimento: 'Receita válida por 30 dias',
      consequenciaAtraso: 'Não interrompa o tratamento sem falar com o médico.',
      avisoConferencia: 'Confira as caixas e miligramas com o farmacêutico antes de tomar.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'A Losartana deve ser tomada preferencialmente pela manhã com um copo cheio de água.',
      'A Sinvastatina funciona melhor quando tomada à noite, antes de dormir.',
      'Não tome remédios com estômago vazio se sentir desconforto.'
    ],
    alertaEtico: 'A IA apenas organiza a leitura do papel. Apenas o farmacêutico ou médico podem orientar trocas de medicamentos.',
    textoParaVoz: 'Olá! Esta é a sua receita médica. Foram identificados três medicamentos: Losartana de cinquenta miligramas para tomar de manhã; Anlodipino de cinco miligramas também pela manhã; e Sinvastatina de vinte miligramas para tomar à noite antes de deitar. Veja o plano detalhado abaixo para salvar no seu calendário ou enviar para seu cuidador.',
    detalhesReceita: {
      possuiTrechoIlegivel: false,
      medicamentosIdentificados: [
        {
          nome: 'Losartana Potássica',
          dosagem: '50mg',
          instrucao: 'Tomar 1 comprimido pela manhã (08:00) em jejum ou após o café.',
          legivel: true
        },
        {
          nome: 'Besilato de Anlodipino',
          dosagem: '5mg',
          instrucao: 'Tomar 1 comprimido junto com o café da manhã (08:00).',
          legivel: true
        },
        {
          nome: 'Sinvastatina',
          dosagem: '20mg',
          instrucao: 'Tomar 1 comprimido à noite, após o jantar ou ao deitar (21:30).',
          legivel: true
        }
      ]
    },
    meta: {
      provedor: 'gemini',
      modelo: 'gemini-2.5-flash',
      tempoProcessamentoMs: 1680,
      bytesRecebidos: 289000,
      arquivos: 1
    }
  },

  roteador_fibra: {
    id: 'roteador_fibra',
    titulo: 'Roteador Fibra (Luz LOS Vermelha)',
    descricao: 'Diagnóstico visual de aparelho sem sinal com luz vermelha',
    tag: 'Suporte Técnico',
    categoria: 'EQUIPAMENTO_HARDWARE',
    tipoDocumento: 'Roteador Wi-Fi / Modem de Fibra Óptica',
    confianca: 'alta',
    resumoSimples: 'Identificamos que a luz vermelha chamada LOS está piscando no seu roteador. Isso significa que o sinal de internet que vem da rua está interrompido. Não é defeito do seu computador ou celular.',
    acoesEssenciais: [
      'Verifique se o cabinho amarelo fino atrás do aparelho está bem encaixado na entrada verde, sem puxar com força.',
      'Não dobre nem amasse o cabo amarelo, pois ele é de vidro fino por dentro.',
      'Desligue o botão preto de energia atrás do roteador, aguarde 20 segundos e ligue novamente.',
      'Se a luz continuar piscando em vermelho após 3 minutos, use o botão abaixo para abrir chamado com nosso suporte.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Gratuito (Suporte Incluso)',
      dataVencimento: 'Atendimento Prioritário',
      consequenciaAtraso: 'Se não normalizar em 10 minutos, pode ser rompimento na rua.',
      avisoConferencia: 'Luzes detectadas: Power (Verde), PON (Apagada), LOS (Vermelho piscando)'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'A luz PON está apagada, o que confirma ausência de comunicação óptica com a central (OLT).',
      'As luzes de Wi-Fi continuam verdes, por isso seus celulares conectam no Wi-Fi mas não abrem sites.'
    ],
    alertaEtico: 'Nunca olhe diretamente para a ponta do conector óptico se o cabo estiver solto (risco de lesão ocular por laser invisível).',
    textoParaVoz: 'Olá! Analisamos a foto do seu roteador. A luz vermelha piscando na palavra LOS significa que o sinal de internet da rua foi interrompido. Primeiro, veja se o cabinho amarelo fino atrás do aparelho está firme no conector verde. Depois, desligue o aparelho no botão preto por 20 segundos e ligue de novo. Se continuar vermelho, clique no botão de abrir chamado para enviarmos um técnico.',
    diagnosticoTecnico: {
      dispositivoIdentificado: 'ONU / ONT Wi-Fi GPON (ZTE / Fiberhome)',
      statusLeds: {
        power: 'verde_fixo',
        pon: 'apagado',
        los: 'vermelho_piscando',
        lan: 'verde_fixo',
        wlan: 'verde_piscando'
      },
      codigoErroDetectado: 'OPTICAL_LOSS_OF_SIGNAL_LOS',
      causaProvavel: 'Rompimento físico do drop óptico externo ou conector SC/APC desconectado',
      nivelGravidade: 'alta',
      acaoRecomendadaTecnico: 'Verificar atenuação óptica no splitter da CTO ou agendar visita técnica para fusão'
    },
    meta: {
      provedor: 'gemini',
      modelo: 'gemini-2.5-flash',
      tempoProcessamentoMs: 1320,
      bytesRecebidos: 450000,
      arquivos: 1
    }
  },

  tela_azul: {
    id: 'tela_azul',
    titulo: 'Tela Azul de Erro (Windows BSOD)',
    descricao: 'Traduz o código de erro travado na tela do computador',
    tag: 'Suporte PC / Software',
    categoria: 'ERRO_SISTEMA_TELA',
    tipoDocumento: 'Tela de Erro do Sistema Operacional (BSOD)',
    confianca: 'alta',
    resumoSimples: 'Seu computador desligou de repente para proteger seus arquivos após uma falha de memória ou programa corrompido. O código do erro é CRITICAL_PROCESS_DIED.',
    acoesEssenciais: [
      'Aguarde a tela atingir 100% da contagem para reiniciar sozinho.',
      'Se o computador não ligar sozinho após 5 minutos, segure o botão de ligar por 10 segundos até desligar e aperte uma vez para religar.',
      'Se o computador ligar normalmente, salve seus arquivos abertos e atualize o sistema.',
      'Se a tela azul voltar a aparecer na inicialização, acione nosso suporte técnico com o protocolo abaixo.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Suporte de TI Remoto',
      dataVencimento: 'Ação Imediata',
      consequenciaAtraso: 'Evite desligar puxando da tomada diretamente.',
      avisoConferencia: 'Código detectado: CRITICAL_PROCESS_DIED'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'Não há sinal de vírus ou ataque no erro identificado, tratando-se de falha de driver ou atualização recente.',
      'Seus documentos pessoais não foram apagados por este erro.'
    ],
    alertaEtico: 'Nunca passe senhas de e-mail ou do computador para pessoas que entrarem em contato dizendo ser do suporte.',
    textoParaVoz: 'Atenção. Esta foto mostra uma tela de erro do Windows. O seu computador travou para se proteger e está reiniciando. Aguarde o computador reiniciar sozinho. Se ele voltar ao normal, não há perigo. Se travar novamente, clique no botão de abrir chamado.',
    diagnosticoTecnico: {
      dispositivoIdentificado: 'Windows 10/11 Desktop/Notebook',
      statusLeds: null,
      codigoErroDetectado: 'CRITICAL_PROCESS_DIED (0x000000EF)',
      causaProvavel: 'Encerramento abrupto de serviço crítico do sistema (csrss.exe ou winlogon.exe) por driver ou falha de disco/RAM',
      nivelGravidade: 'media',
      acaoRecomendadaTecnico: 'Iniciar em Modo Seguro, executar sfc /scannow e checar logs de eventos do sistema (Event Viewer)'
    },
    meta: {
      provedor: 'gemini',
      modelo: 'gemini-2.5-flash',
      tempoProcessamentoMs: 1410,
      bytesRecebidos: 520000,
      arquivos: 1
    }
  },

  golpe_falso_suporte: {
    id: 'golpe_falso_suporte',
    titulo: 'SMS de Falso Cancelamento de Internet',
    descricao: 'Mensagem golpista ameaçando corte imediato com link desconhecido',
    tag: 'Alerta Antifraude',
    categoria: 'ALERTA_GOLPE_SUSPEITO',
    tipoDocumento: 'Mensagem de Texto com Engenharia Social (Phishing)',
    confianca: 'alta',
    resumoSimples: '🚨 CUIDADO: Esta mensagem de SMS é um GOLPE! Golpistas estão usando o nome da nossa empresa para assustar você com um corte falso e roubar dinheiro via Pix.',
    acoesEssenciais: [
      'NÃO clique no link que veio na mensagem.',
      'NÃO faça nenhum pagamento nem transfira dinheiro por Pix.',
      'Bloqueie o número que enviou este SMS.',
      'Lembre-se: nossa empresa nunca envia links encurtados nem cobra dinheiro por mensagem urgente.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Cobrança Falsa (Golpe)',
      dataVencimento: 'Não Pague',
      consequenciaAtraso: 'Sua internet NÃO será cortada por causa deste SMS.',
      avisoConferencia: 'Remetente não oficial identificado. Link suspeito bloqueado.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'O link na mensagem termina em domínio suspeito e não no site oficial da empresa.',
      'O tom da mensagem usa ameaça psicológica e pressa para induzir ao erro.'
    ],
    alertaEtico: 'Alerta preventivo de segurança gerado para proteção do consumidor contra fraudes eletrônicas.',
    textoParaVoz: 'Atenção urgente! Esta mensagem de celular é um golpe. Não clique em links e não faça pagamentos. Os golpistas estão tentando se passar pelo nosso suporte para pedir dinheiro. Sua internet continua ativa e segura. Pode apagar essa mensagem.',
    diagnosticoTecnico: {
      dispositivoIdentificado: 'Smartphone (SMS / WhatsApp)',
      statusLeds: null,
      codigoErroDetectado: 'SMISHING_ATTEMPT_EXTERNAL',
      causaProvavel: 'Disparo em massa de engenharia social (Smishing) simulando provedor de telecomunicações',
      nivelGravidade: 'critica',
      acaoRecomendadaTecnico: 'Registrar domínio falso para denúncia de take-down e orientar cliente a não compartilhar senhas'
    },
    meta: {
      provedor: 'gemini',
      modelo: 'gemini-2.5-flash',
      tempoProcessamentoMs: 1100,
      bytesRecebidos: 310000,
      arquivos: 1
    }
  },
  // ===================== MODO SAÚDE: Clínica Odontológica & Posto de Saúde (UBS) =====================

  pos_extracao: {
    id: 'pos_extracao',
    titulo: 'Cuidados Após Extração de Dente',
    descricao: 'Folha de orientações do dentista explicada em passos simples',
    tag: 'Odontologia',
    categoria: 'ORIENTACAO_POS_PROCEDIMENTO',
    tipoDocumento: 'Orientações Pós-Operatórias de Extração Dentária',
    confianca: 'alta',
    resumoSimples: 'Esta folha explica os cuidados para depois de tirar o dente. Seguir esses passos ajuda a parar o sangramento e evita infecção. O retorno para tirar os pontos é em 7 dias.',
    acoesEssenciais: [
      'Morda a gaze com firmeza por 30 minutos, sem ficar trocando.',
      'Nas primeiras 24 horas, não cuspa, não faça bochecho e não use canudo.',
      'Coloque gelo enrolado em um pano no rosto, 20 minutos sim e 20 minutos não, no primeiro dia.',
      'Coma alimentos frios ou mornos e pastosos, como sopa morna, purê, iogurte e vitamina.',
      'Escove os outros dentes normalmente, com cuidado perto do local da extração.',
      'Durma com a cabeça mais alta, usando dois travesseiros.',
      'Volte ao dentista em 7 dias para tirar os pontos.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Não se aplica',
      dataVencimento: 'Retorno em 7 dias',
      consequenciaAtraso: 'Não deixe de voltar: os pontos precisam ser retirados pelo dentista.',
      avisoConferencia: 'Confira na folha original a data do retorno marcada pelo dentista.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'Não fume e não beba bebida alcoólica por pelo menos 3 dias.',
      'Evite comida quente, dura ou apimentada nos primeiros dias.',
      'Um pouco de inchaço e de sangue na saliva no primeiro dia é esperado.'
    ],
    sinaisDeAlerta: [
      'Sangramento forte que não para mesmo mordendo a gaze por 30 minutos.',
      'Febre (temperatura acima de 38 °C).',
      'Inchaço que continua aumentando depois do 3º dia.',
      'Dor forte que piora depois do 3º dia ou mau cheiro no local.',
      'Dificuldade para engolir ou para respirar (procure a emergência ou ligue 192).'
    ],
    alertaEtico: 'Estas orientações reorganizam o que o dentista escreveu. Em caso de dúvida, ligue para a clínica.',
    textoParaVoz: 'Olá! Esta folha explica os cuidados depois de tirar o dente. Morda a gaze com firmeza por trinta minutos. Hoje, não cuspa, não faça bochecho e não use canudo. Coloque gelo enrolado em um pano no rosto. Coma comidas frias ou mornas e pastosas. Durma com a cabeça mais alta. Volte ao dentista em sete dias para tirar os pontos. Se o sangramento não parar, se tiver febre ou se o inchaço aumentar depois do terceiro dia, procure a clínica.',
    meta: { provedor: 'gemini', modelo: 'gemini-2.5-flash', tempoProcessamentoMs: 1390, bytesRecebidos: 301000, arquivos: 1 }
  },

  receita_odontologica: {
    id: 'receita_odontologica',
    titulo: 'Receita do Dentista',
    descricao: 'Antibiótico, remédio para dor e enxaguante com horários',
    tag: 'Odontologia',
    categoria: 'ODONTOLOGIA',
    tipoDocumento: 'Receita Odontológica',
    confianca: 'alta',
    resumoSimples: 'Esta é a receita do dentista com 3 remédios: um antibiótico contra infecção, um remédio para dor e um líquido para bochecho. O antibiótico deve ser tomado até o fim, mesmo que a dor passe.',
    acoesEssenciais: [
      'Tome a Amoxicilina de 8 em 8 horas, por 7 dias, até acabar o tratamento.',
      'Tome a Dipirona somente se sentir dor, com intervalo mínimo de 6 horas.',
      'Faça bochecho com a Clorexidina 2 vezes por dia, por 1 minuto, e cuspa. Não engula.',
      'Antes de começar, avise o dentista se você tem alergia a penicilina ou a algum remédio.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Não se aplica',
      dataVencimento: 'Tratamento de 7 dias',
      consequenciaAtraso: 'Parar o antibiótico antes do tempo pode fazer a infecção voltar.',
      avisoConferencia: 'Confira as caixas e os miligramas com o farmacêutico antes de tomar.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'A Clorexidina pode deixar os dentes um pouco manchados e mudar o gosto da comida. Isso passa depois do tratamento.',
      'Espere 30 minutos depois de escovar os dentes para fazer o bochecho.'
    ],
    sinaisDeAlerta: [
      'Manchas vermelhas ou coceira forte na pele depois de tomar o remédio.',
      'Inchaço nos lábios, na língua ou no rosto.',
      'Falta de ar ou chiado no peito: ligue 192 (SAMU) imediatamente.'
    ],
    alertaEtico: 'A IA apenas organiza a leitura da receita. Somente o dentista ou o farmacêutico podem orientar trocas de remédio.',
    textoParaVoz: 'Olá! Esta é a receita do dentista. A Amoxicilina é um antibiótico: tome uma cápsula de oito em oito horas, por sete dias, até acabar, mesmo que a dor passe. A Dipirona é para dor: tome só se precisar, com intervalo de seis horas. A Clorexidina é para bochecho, duas vezes por dia, sem engolir. Se aparecerem manchas vermelhas na pele, inchaço no rosto ou falta de ar, ligue um nove dois.',
    detalhesReceita: {
      possuiTrechoIlegivel: false,
      medicamentosIdentificados: [
        { nome: 'Amoxicilina', dosagem: '500mg', instrucao: 'Tomar 1 cápsula de 8 em 8 horas por 7 dias.', legivel: true },
        { nome: 'Dipirona', dosagem: '500mg', instrucao: 'Tomar 1 comprimido de 6 em 6 horas somente se houver dor.', legivel: true },
        { nome: 'Digluconato de Clorexidina 0,12%', dosagem: '15 ml', instrucao: 'Bochechar por 1 minuto de 12 em 12 horas e cuspir. Não engolir.', legivel: true }
      ]
    },
    meta: { provedor: 'gemini', modelo: 'gemini-2.5-flash', tempoProcessamentoMs: 1510, bytesRecebidos: 276000, arquivos: 1 }
  },

  protese_dentaria: {
    id: 'protese_dentaria',
    titulo: 'Cuidados com a Dentadura',
    descricao: 'Higiene da prótese e da boca para o paciente idoso',
    tag: 'Odontologia',
    categoria: 'ODONTOLOGIA',
    tipoDocumento: 'Orientações de Uso e Higiene de Prótese Dentária (Dentadura)',
    confianca: 'alta',
    resumoSimples: 'Esta folha ensina a limpar a dentadura e a cuidar da boca. Com a limpeza certa, a prótese dura mais e a gengiva fica saudável.',
    acoesEssenciais: [
      'Tire a dentadura e escove depois de cada refeição, com escova macia e sabão neutro ou de coco.',
      'Não use pasta de dente na dentadura, porque ela risca a prótese.',
      'Limpe também a gengiva, o céu da boca e a língua com escova macia ou gaze úmida.',
      'Para dormir, tire a dentadura e deixe dentro de um copo com água limpa.',
      'Nunca coloque a dentadura em água quente, porque ela pode entortar.',
      'Vá ao dentista pelo menos 1 vez por ano, mesmo usando dentadura.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Não se aplica',
      dataVencimento: 'Consulta de revisão 1 vez por ano',
      consequenciaAtraso: 'Dentadura frouxa ou quebrada pode machucar a gengiva.',
      avisoConferencia: 'Siga sempre o produto de limpeza indicado pelo seu dentista.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'Segure a dentadura sobre uma pia com água ou uma toalha ao limpar. Se cair, ela pode quebrar.',
      'Dormir sem a dentadura deixa a gengiva descansar.'
    ],
    sinaisDeAlerta: [
      'Ferida, mancha branca ou vermelha na boca que não cicatriza em 15 dias: procure o dentista para avaliação.',
      'Dentadura que machuca, balança ou está quebrada.',
      'Dor ou inchaço na gengiva.'
    ],
    alertaEtico: 'Orientação educativa. A avaliação da prótese deve ser feita pelo dentista.',
    textoParaVoz: 'Olá! Esta folha ensina a cuidar da sua dentadura. Depois de cada refeição, tire e escove a dentadura com escova macia e sabão neutro. Não use pasta de dente nela. Limpe também a gengiva e a língua. Para dormir, deixe a dentadura num copo com água limpa, nunca quente. Se aparecer uma ferida na boca que não sara em quinze dias, procure o dentista.',
    meta: { provedor: 'gemini', modelo: 'gemini-2.5-flash', tempoProcessamentoMs: 1280, bytesRecebidos: 254000, arquivos: 1 }
  },

  pedido_exame: {
    id: 'pedido_exame',
    titulo: 'Pedido de Exame de Sangue',
    descricao: 'Preparo do exame explicado: jejum, urina e documentos',
    tag: 'Posto de Saúde',
    categoria: 'PEDIDO_EXAME',
    tipoDocumento: 'Pedido de Exames Laboratoriais (UBS)',
    confianca: 'alta',
    resumoSimples: 'O médico pediu exames de sangue e de urina. Para o resultado sair certo, você precisa fazer um preparo antes. O mais importante é ficar 8 horas sem comer.',
    acoesEssenciais: [
      'Fique 8 horas sem comer antes do exame. Você pode beber água.',
      'Colete a primeira urina da manhã no frasco do laboratório. Jogue fora o primeiro jato e guarde o restante.',
      'Leve este pedido, um documento com foto e o Cartão do SUS.',
      'Tome os remédios de uso diário normalmente, a não ser que o médico tenha falado o contrário.',
      'Volte ao posto para mostrar o resultado ao médico.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Gratuito pelo SUS',
      dataVencimento: 'Validade do pedido: confira no papel',
      consequenciaAtraso: 'Se o pedido vencer, será preciso pedir outro ao médico.',
      avisoConferencia: 'Exames pedidos: Hemograma, Glicemia em jejum, Colesterol total e frações, Urina tipo 1.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'Não faça exercício físico pesado no dia anterior.',
      'Evite bebida alcoólica nos 3 dias antes do exame.',
      'Se você tem diabetes e usa insulina, pergunte ao posto como fazer o jejum com segurança.'
    ],
    sinaisDeAlerta: [
      'Se você tem diabetes e sentir tremor, suor frio ou tontura durante o jejum, coma algo doce e avise a equipe.'
    ],
    alertaEtico: 'O preparo pode variar. Siga sempre as instruções do laboratório e do médico que pediu o exame.',
    textoParaVoz: 'Olá! O médico pediu exames de sangue e de urina. Fique oito horas sem comer antes do exame, mas pode beber água. Colete a primeira urina da manhã no frasco do laboratório. Leve este pedido, um documento com foto e o Cartão do SUS. Depois, volte ao posto para mostrar o resultado ao médico.',
    meta: { provedor: 'gemini', modelo: 'gemini-2.5-flash', tempoProcessamentoMs: 1350, bytesRecebidos: 288000, arquivos: 1 }
  },

  resultado_exame: {
    id: 'resultado_exame',
    titulo: 'Resultado de Exame (sem diagnóstico)',
    descricao: 'Explica os termos do laudo sem dar diagnóstico',
    tag: 'Posto de Saúde',
    categoria: 'RESULTADO_EXAME',
    tipoDocumento: 'Laudo de Exames Laboratoriais',
    confianca: 'alta',
    resumoSimples: 'Este é o resultado dos seus exames de sangue. O papel mostra o valor de cada exame e, ao lado, a faixa de referência do laboratório. Só o médico pode dizer o que esses números significam para a sua saúde.',
    acoesEssenciais: [
      'Agende uma consulta no posto para mostrar este resultado ao médico.',
      'Leve também os resultados de exames antigos, se tiver.',
      'Não comece, não pare e não troque nenhum remédio por causa deste papel.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Não se aplica',
      dataVencimento: 'Mostrar ao médico na próxima consulta',
      consequenciaAtraso: 'Guarde o resultado para comparar com exames futuros.',
      avisoConferencia: 'Confira se o seu nome e a data de nascimento no laudo estão corretos.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      '"Valores de referência" é a faixa que o laboratório usa para comparar. Ela pode mudar de um laboratório para outro.',
      '"mg/dL" é só a unidade de medida, como "metros" ou "quilos".',
      'Um resultado marcado com asterisco (*) está fora da faixa de referência. Isso não é motivo para pânico: mostre ao médico.'
    ],
    sinaisDeAlerta: [],
    alertaEtico: 'Este aplicativo não interpreta exames nem faz diagnóstico. A avaliação é sempre do médico ou do dentista.',
    textoParaVoz: 'Olá! Este é o resultado dos seus exames de sangue. Ao lado de cada número, o laboratório mostra a faixa de referência. Um asterisco indica que o valor está fora dessa faixa, mas isso não é motivo para pânico. Só o médico pode explicar o que significa para você. Agende uma consulta no posto e leve este papel.',
    meta: { provedor: 'gemini', modelo: 'gemini-2.5-flash', tempoProcessamentoMs: 1460, bytesRecebidos: 312000, arquivos: 1 }
  },

  vacinacao_idoso: {
    id: 'vacinacao_idoso',
    titulo: 'Caderneta de Vacinação do Idoso',
    descricao: 'Mostra quais vacinas conferir na sala de vacina',
    tag: 'Posto de Saúde',
    categoria: 'VACINACAO',
    tipoDocumento: 'Caderneta de Vacinação da Pessoa Idosa',
    confianca: 'media',
    resumoSimples: 'Esta é a sua caderneta de vacinação. Algumas vacinas parecem estar atrasadas, como a da gripe deste ano e o reforço contra tétano. A equipe da sala de vacina do posto vai conferir tudo com você.',
    acoesEssenciais: [
      'Leve esta caderneta, um documento com foto e o Cartão do SUS à sala de vacina do posto.',
      'Pergunte se a vacina da gripe deste ano ainda está disponível.',
      'Pergunte sobre o reforço da vacina dupla adulto (difteria e tétano): a última dose foi há mais de 10 anos.',
      'Pergunte sobre a 3ª dose da hepatite B: aparecem só 2 doses anotadas.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Gratuito pelo SUS',
      dataVencimento: 'Procurar a sala de vacina',
      consequenciaAtraso: 'Vacinas atrasadas deixam você menos protegido contra doenças graves.',
      avisoConferencia: 'Algumas anotações estão apagadas. A equipe de vacinação vai conferir no sistema.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'Gripe: última dose anotada em 2025.',
      'Dupla adulto (dT): última dose anotada em 2014.',
      'Covid-19: confira com a equipe se há reforço indicado para a sua idade.'
    ],
    sinaisDeAlerta: [
      'Depois de vacinar: falta de ar, inchaço no rosto ou manchas pelo corpo exigem atendimento imediato (192).'
    ],
    alertaEtico: 'O calendário de vacinas muda. Quem confirma as vacinas indicadas é a equipe de saúde do posto.',
    textoParaVoz: 'Olá! Esta é a sua caderneta de vacinação. A vacina da gripe deste ano e o reforço contra o tétano parecem estar atrasados. Leve a caderneta, um documento com foto e o Cartão do SUS à sala de vacina do posto. A equipe vai conferir tudo com você. As vacinas são gratuitas.',
    meta: { provedor: 'gemini', modelo: 'gemini-2.5-flash', tempoProcessamentoMs: 1520, bytesRecebidos: 341000, arquivos: 1 }
  },

  golpe_sus: {
    id: 'golpe_sus',
    titulo: 'SMS Falso de Agendamento do SUS',
    descricao: 'Golpe que cobra "taxa" para não cancelar consulta',
    tag: 'Alerta Antifraude',
    categoria: 'ALERTA_GOLPE_SUSPEITO',
    tipoDocumento: 'Mensagem Falsa em Nome do SUS (Golpe)',
    confianca: 'alta',
    resumoSimples: '🚨 CUIDADO: Esta mensagem é um GOLPE! O SUS é gratuito e nunca cobra taxa por Pix para confirmar ou manter consulta, exame ou cirurgia.',
    acoesEssenciais: [
      'NÃO clique no link da mensagem.',
      'NÃO faça Pix e não informe senhas, códigos ou dados do banco.',
      'Para confirmar sua consulta, vá ao posto de saúde ou use o aplicativo oficial Meu SUS Digital.',
      'Em caso de dúvida, ligue para o Disque Saúde: 136.',
      'Bloqueie o número e avise seus familiares.'
    ],
    valoresEPrazos: {
      valorPrincipal: 'Cobrança Falsa (Golpe)',
      dataVencimento: 'Não Pague',
      consequenciaAtraso: 'Sua consulta NÃO será cancelada por causa desta mensagem.',
      avisoConferencia: 'O SUS não cobra taxas. Link e remetente não são oficiais.'
    },
    linhaDigitavel: null,
    codigoBarrasInfo: null,
    pontosDeAtencao: [
      'A mensagem usa pressa ("cancelamento em 2 horas") para assustar.',
      'O link não termina em ".gov.br", que é o final dos sites oficiais do governo.'
    ],
    sinaisDeAlerta: [],
    alertaEtico: 'Alerta preventivo contra golpes que usam o nome do SUS e de unidades de saúde.',
    textoParaVoz: 'Atenção! Esta mensagem é um golpe. O SUS é gratuito e nunca cobra taxa por Pix para manter sua consulta. Não clique no link e não faça pagamento. Para confirmar sua consulta, vá ao posto de saúde ou ligue para o Disque Saúde, um três seis.',
    meta: { provedor: 'gemini', modelo: 'gemini-2.5-flash', tempoProcessamentoMs: 1080, bytesRecebidos: 198000, arquivos: 1 }
  }
};

/**
 * Exemplos exibidos no Modo Saúde (clínica odontológica e posto de saúde), na ordem da apresentação.
 */
export const HEALTH_DEMO_KEYS = [
  'pos_extracao',
  'receita_odontologica',
  'protese_dentaria',
  'pedido_exame',
  'resultado_exame',
  'vacinacao_idoso',
  'receita_medica',
  'golpe_sus'
];

/**
 * Exemplos exibidos no modo completo, na ordem da apresentação.
 */
export const FULL_DEMO_KEYS = [
  'conta_luz',
  'golpe_adulterado',
  'receita_medica',
  'roteador_fibra',
  'tela_azul',
  'golpe_falso_suporte'
];
