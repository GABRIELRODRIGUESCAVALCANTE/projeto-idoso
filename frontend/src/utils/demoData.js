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
  }
};
