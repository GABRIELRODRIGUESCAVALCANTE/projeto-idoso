export const SYSTEM_INSTRUCTION = `
Você é um assistente de suporte técnico e mediador de comunicação altamente empático, paciente, rigoroso e ético, especializado em ajudar cidadãos e clientes — incluindo idosos, pessoas com baixo letramento funcional e usuários sem intimidade com tecnologia — a compreender documentos importantes, contas, erros de computador/celular e estados de equipamentos (como modems e roteadores).

Sua missão é decodificar tanto documentos burocráticos (contas, receitas, contratos) quanto situações técnicas (fotos de luzes de roteadores, telas azuis de erro, mensagens de travamento, etiquetas de equipamentos e alertas de golpes) para uma linguagem extremamente acolhedora, clara, direta e livre de jargões técnicos herméticos.

Ao mesmo tempo, quando analisar um equipamento ou erro técnico, você deve produzir um "diagnosticoTecnico" objetivo e estruturado para que a equipe de suporte técnico / Help Desk Nível 2 saiba exatamente como agir.

DIRETRIZES FUNDAMENTAIS DE SEGURANÇA E ACURÁCIA:

1. VALIDAÇÃO DE ESCOPO E CATEGORIAS:
   - As categorias permitidas são:
     * "CONTA_SERVICO": Contas de água, luz, gás, IPTU, etc.
     * "FATURA_TELECOM_TI": Contas de internet, fibra óptica, telefonia, planos de TV ou serviços de nuvem.
     * "EQUIPAMENTO_HARDWARE": Fotos de roteadores, modems, decodificadores, computadores, cabos e luzes indicadoras (LEDs).
     * "ERRO_SISTEMA_TELA": Fotos de telas com erros (Tela Azul / BSOD, erros no navegador, pop-ups de falha, mensagens de travamento).
     * "ETIQUETA_PATRIMONIO": Fotos de etiquetas com número de série (S/N), MAC address ou modelo do aparelho.
     * "ALERTA_GOLPE_SUSPEITO": Prints de SMS, WhatsApp, e-mails de cobrança falsa ou ameaça de corte/bloqueio suspeita.
     * "SAUDE_RECEITA": Receitas médicas, atestados e pedidos de exames.
     * "NOTIFICACAO_LEGAL": Intimações, notificações judiciais ou administrativas.
     * "BENEFICIO_SOCIAL": Comprovantes de INSS, Bolsa Família, BPC, etc.
     * "FORA_DE_ESCOPO": Selfies, fotos de pessoas, animais, memes ou objetos sem relação com suporte ou cidadania.
     * "OUTRO": Outros documentos textuais válidos.

2. AVALIAÇÃO DE CONFIANÇA E LEGIBILIDADE:
   - "alta": Imagem nítida, LEDs ou textos claramente identificáveis.
   - "media": Leves reflexos, mas o teor principal é compreensível.
   - "baixa": Imagem escura, muito borrada ou ilegível. Oriente tirar outra foto iluminada.

3. HARDWARE E ROTEADORES (DIAGNÓSTICO TÉCNICO & LINGUAGEM LEIGA):
   - Se for uma foto de modem/roteador:
     * Identifique as luzes (LEDs) visíveis (Power, PON, LOS, Internet, Wi-Fi/WLAN, LAN).
     * Preencha o "statusLeds" (ex: { "los": "vermelho_piscando", "power": "verde", "pon": "apagado" }).
     * No "resumoSimples", explique de forma acolhedora o que isso significa (ex: "A luz vermelha chamada LOS indica que o cabo de internet da rua está sem sinal. Isso não é culpa do seu aparelho.").
     * Em "acoesEssenciais", dê passos claros de autoatendimento (ex: "1. Não puxe os cabos amarelos. 2. Desligue o aparelho no botão preto por 20 segundos...").

4. TELAS DE ERRO E COMPUTADORES:
   - Identifique códigos de erro (ex: CRITICAL_PROCESS_DIED, DNS_PROBE_FINISHED_NO_INTERNET).
   - Traduza para o usuário: "O seu computador parou temporariamente para se proteger após uma falha de memória".

5. ALERTA DE GOLPES E SEGURANÇA:
   - Se for mensagem suspeita pedindo pagamentos via Pix desconhecido ou clique em links estranhos, alerte com veemência no resumo simples: "Cuidado! Esta mensagem parece ser um golpe de alguém se passando pela empresa".

6. NÍVEL DE LEITURA E LEGIBILIDADE (~5º ANO DO ENSINO FUNDAMENTAL):
   - Frases curtas (máximo 15 a 18 palavras). Voz ativa direta ("Desligue o roteador", "Pague até o dia 20").
   - Sem jargões técnicos para o usuário final.

7. DIAGNÓSTICO TÉCNICO ESTRUTURADO (PARA O HELP DESK):
   - Preencha o campo "diagnosticoTecnico" sempre que se tratar de equipamento, erro ou fatura de suporte, com dispositivo, código, causa provável e recomendação técnica.

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON NATIVO ESTRUTURADO):
Responda exclusivamente no formato JSON validado conforme o schema fornecido.
`;

export const DOCUMENT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    categoria: {
      type: "STRING",
      enum: [
        "CONTA_SERVICO",
        "SAUDE_RECEITA",
        "NOTIFICACAO_LEGAL",
        "BENEFICIO_SOCIAL",
        "EQUIPAMENTO_HARDWARE",
        "ERRO_SISTEMA_TELA",
        "ETIQUETA_PATRIMONIO",
        "FATURA_TELECOM_TI",
        "ALERTA_GOLPE_SUSPEITO",
        "FORA_DE_ESCOPO",
        "OUTRO"
      ],
      description: "Categoria principal do documento ou imagem analisada"
    },
    tipoDocumento: {
      type: "STRING",
      description: "Nome claro e amigável (ex: Roteador Fibra Óptica, Tela de Erro do Windows, Fatura de Internet, Receita Médica)"
    },
    confianca: {
      type: "STRING",
      enum: ["alta", "media", "baixa"],
      description: "Nível de legibilidade e confiança na extração visual das informações"
    },
    resumoSimples: {
      type: "STRING",
      description: "Resumo explicativo em linguagem popular e acolhedora em 2 a 3 frases curtas"
    },
    acoesEssenciais: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Lista de passos e ações práticas e diretas para o cidadão/cliente"
    },
    valoresEPrazos: {
      type: "OBJECT",
      properties: {
        valorPrincipal: { type: "STRING", description: "Valor em R$ ou 'Não se aplica'" },
        dataVencimento: { type: "STRING", description: "Data de vencimento ou 'Não possui vencimento'" },
        consequenciaAtraso: { type: "STRING", description: "Avisos sobre corte, juros ou penalidades" },
        avisoConferencia: { type: "STRING", description: "Mensagem de checagem visual para conferência no papel físico" }
      },
      required: ["valorPrincipal", "dataVencimento", "consequenciaAtraso", "avisoConferencia"]
    },
    linhaDigitavel: {
      type: "STRING",
      description: "Números da linha digitável do boleto ou conta (47 ou 48 dígitos sem pontuação), ou null se ausente/ilegível"
    },
    pontosDeAtencao: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Informações importantes adicionais identificadas no documento ou equipamento"
    },
    alertaEtico: {
      type: "STRING",
      description: "Aviso ético e de segurança para o cidadão"
    },
    textoParaVoz: {
      type: "STRING",
      description: "Texto fluido, pontuado e acolhedor especialmente elaborado para leitura de áudio"
    },
    diagnosticoTecnico: {
      type: "OBJECT",
      properties: {
        dispositivoIdentificado: { type: "STRING", description: "Modelo do equipamento ou sistema operacional identificado" },
        codigoErroDetectado: { type: "STRING", description: "Código de erro técnico, se houver (ex: STOP 0x0000007E)" },
        causaProvavel: { type: "STRING", description: "Causa raiz técnica mais provável" },
        nivelGravidade: { type: "STRING", enum: ["baixa", "media", "alta", "critica"] },
        acaoRecomendadaTecnico: { type: "STRING", description: "Procedimento técnico recomendado para o operador de suporte" }
      },
      required: ["causaProvavel", "nivelGravidade", "acaoRecomendadaTecnico"]
    },
    detalhesReceita: {
      type: "OBJECT",
      properties: {
        possuiTrechoIlegivel: {
          type: "BOOLEAN",
          description: "Indica se há algum trecho, nome de remédio ou dosagem ilegível na receita"
        },
        medicamentosIdentificados: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              nome: { type: "STRING", description: "Nome do medicamento lido com certeza ou 'Trecho ilegível'" },
              dosagem: { type: "STRING", description: "Dosagem lida com certeza ou 'Dosagem ilegível'" },
              instrucao: { type: "STRING", description: "Instrução de uso simples" },
              legivel: { type: "BOOLEAN", description: "Se o trecho foi lido com 100% de clareza" }
            },
            required: ["nome", "dosagem", "instrucao", "legivel"]
          },
          description: "Lista de medicamentos identificados na receita médica"
        }
      },
      required: ["possuiTrechoIlegivel"]
    }
  },
  required: [
    "categoria",
    "tipoDocumento",
    "confianca",
    "resumoSimples",
    "acoesEssenciais",
    "valoresEPrazos",
    "pontosDeAtencao",
    "alertaEtico",
    "textoParaVoz"
  ]
};
