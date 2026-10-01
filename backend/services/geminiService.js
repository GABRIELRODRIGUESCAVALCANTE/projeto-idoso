import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION, DOCUMENT_RESPONSE_SCHEMA } from '../prompts/documentPrompt.js';
import { QA_SYSTEM_INSTRUCTION, buildQAPrompt } from '../prompts/qaPrompt.js';
import { safeLog } from '../utils/logger.js';
import { validateDocumentAnalysis } from '../schemas/documentSchema.js';

// Função auxiliar para aguardar milissegundos
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeDocumentImages(input) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'sua_chave_da_api_gemini_aqui') {
    throw new Error(
      'Chave GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API no arquivo .env do backend.'
    );
  }

  // Suporte flexível para array de arquivos ou objeto único (buffer, mimeType)
  const files = Array.isArray(input?.files)
    ? input.files
    : (input?.buffer ? [{ buffer: input.buffer, mimeType: input.mimeType }] : []);

  if (files.length === 0) {
    throw new Error('Nenhum arquivo ou imagem foi fornecido para análise.');
  }

  const cleanApiKey = apiKey.trim();
  const ai = new GoogleGenAI({ apiKey: cleanApiKey });

  // Modelos com suporte multimodal e alta estabilidade
  const configured = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : [];
  const candidateModels = [
    ...configured,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.8-flash'
  ];
  const uniqueModels = [...new Set(candidateModels)];

  // Monta as partes multimodais com todas as páginas/lados enviados
  const parts = files.map((file) => ({
    inlineData: {
      mimeType: file.mimeType || 'image/jpeg',
      data: file.buffer.toString('base64')
    }
  }));

  const schemaContract = `
Responda EXCLUSIVAMENTE em formato JSON com esta estrutura exata:
{
  "categoria": "CONTA_SERVICO" | "SAUDE_RECEITA" | "NOTIFICACAO_LEGAL" | "BENEFICIO_SOCIAL" | "FORA_DE_ESCOPO" | "OUTRO",
  "tipoDocumento": "Nome claro do documento",
  "confianca": "alta" | "media" | "baixa",
  "resumoSimples": "Resumo simples em 2 a 3 frases",
  "acoesEssenciais": ["Ação 1"],
  "valoresEPrazos": {
    "valorPrincipal": "Não se aplica ou valor em R$",
    "dataVencimento": "Não possui vencimento ou data",
    "consequenciaAtraso": "Nenhuma consequência ou detalhes",
    "avisoConferencia": ""
  },
  "pontosDeAtencao": [],
  "alertaEtico": "Aviso de segurança e conferência",
  "textoParaVoz": "Texto caloroso para leitura em voz alta",
  "detalhesReceita": {
    "possuiTrechoIlegivel": false,
    "medicamentosIdentificados": []
  }
}`;

  const promptText = files.length > 1
    ? `Analise as ${files.length} imagens/páginas recebidas deste documento (frente e verso ou páginas múltiplas) em conjunto. Cruze todas as informações de ambos os lados para gerar uma explicação única, completa, humanizada e acessível conforme suas diretrizes de mediador social.\n${schemaContract}`
    : `Analise este documento recebido e gere a explicação humanizada, acolhedora e acessível conforme suas diretrizes de mediador social.\n${schemaContract}`;

  parts.push({ text: promptText });

  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      safeLog.info(`Tentando análise com o modelo estável: ${modelName} (${files.length} páginas)`);

      const config = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.1 // Baixa temperatura para consistência e prevenção de alucinações
      };

      if (modelName.startsWith('gemini-3.8') || modelName.startsWith('gemini-1.5')) {
        config.responseSchema = DOCUMENT_RESPONSE_SCHEMA;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts
          }
        ],
        config
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('A IA não retornou texto na resposta.');
      }

      // Limpeza de possíveis blocos markdown ```json
      const cleanedText = responseText
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
        if (Array.isArray(parsed)) parsed = parsed[0];
      } catch (parseErr) {
        safeLog.warn(`JSON malformado retornado por ${modelName}:`, parseErr.message);
        throw new Error(`Resposta da IA não continha JSON válido (${parseErr.message})`);
      }

      // Validação estrita do payload estruturado com Zod antes de entregar ao frontend
      const validation = validateDocumentAnalysis(parsed);
      if (!validation.isValid) {
        safeLog.warn(`Validação Zod reprovada com ${modelName}:`, validation.error);
        throw new Error(`Estrutura da análise inválida: ${validation.error}`);
      }

      safeLog.info(`Sucesso na análise e validação Zod com o modelo ${modelName} (confiança: ${validation.data.confianca})`);
      return validation.data;
    } catch (err) {
      lastError = err;
      const errorMsg = err.message || '';
      safeLog.warn(`Falha ou rejeição com modelo ${modelName}:`, errorMsg);

      const isApiKeyError = errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('GEMINI_API_KEY');
      if (isApiKeyError) {
        throw err;
      }

      safeLog.info('Ativando retry com o próximo modelo estável da lista de fallback...');
      await sleep(1000);
      continue; // Tenta o próximo modelo resiliente
    }
  }

  // Se todos os modelos falharam por alta demanda, quota ou validação
  safeLog.error('Todos os modelos de fallback falharam:', lastError?.message);
  const lastMsg = lastError?.message || '';
  if (lastMsg.includes('429') || lastMsg.includes('RESOURCE_EXHAUSTED') || lastMsg.includes('quota')) {
    throw new Error(
      'A cota temporária de requisições da IA (Gemini Free Tier) foi atingida. Por favor, aguarde cerca de 1 minuto antes de enviar novamente.'
    );
  }
  if (lastMsg.includes('503') || lastMsg.includes('high demand') || lastMsg.includes('UNAVAILABLE')) {
    throw new Error(
      'Os servidores do Google Gemini estão com alta demanda temporária. Por favor, aguarde alguns segundos e tente novamente.'
    );
  }
  if (lastMsg.includes('500') || lastMsg.includes('INTERNAL') || lastMsg.includes('Internal error')) {
    throw new Error(
      'Os servidores da IA tiveram uma instabilidade momentânea interna. Por favor, tente enviar novamente em instantes.'
    );
  }
  throw new Error(
    'Não foi possível validar a leitura do documento no momento. Por favor, tente enviar novamente em instantes.'
  );
}

export const analyzeDocumentImage = analyzeDocumentImages;

export async function answerDocumentQuestion({ documentData, question, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'sua_chave_da_api_gemini_aqui') {
    throw new Error(
      'Chave GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API no arquivo .env do backend.'
    );
  }

  if (!documentData || !question || question.trim() === '') {
    throw new Error('Dados do documento ou pergunta não fornecidos.');
  }

  const cleanApiKey = apiKey.trim();
  const ai = new GoogleGenAI({ apiKey: cleanApiKey });

  const configured = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : [];
  const candidateModels = [
    ...configured,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.8-flash'
  ];
  const uniqueModels = [...new Set(candidateModels)];

  const promptText = buildQAPrompt({ documentData, question, history });
  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      safeLog.info(`Respondendo dúvida com o modelo: ${modelName}`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ],
        config: {
          systemInstruction: QA_SYSTEM_INSTRUCTION,
          temperature: 0.3
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('A IA não retornou resposta para a pergunta.');
      }

      safeLog.info(`Resposta da dúvida gerada com sucesso com ${modelName}`);
      return responseText.trim();
    } catch (err) {
      lastError = err;
      const errorMsg = err.message || '';
      safeLog.warn(`Falha temporária no Q&A com ${modelName}:`, errorMsg);

      const isApiKeyError = errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('GEMINI_API_KEY');
      if (isApiKeyError) {
        throw err;
      }

      safeLog.info('Ativando fallback de Q&A para o próximo modelo disponível...');
      await sleep(1000);
      continue;
    }
  }

  safeLog.error('Todos os modelos de fallback falharam no Q&A:', lastError?.message);
  const lastMsg = lastError?.message || '';
  if (lastMsg.includes('429') || lastMsg.includes('RESOURCE_EXHAUSTED') || lastMsg.includes('quota')) {
    throw new Error(
      'A cota temporária de requisições da IA foi atingida. Por favor, aguarde cerca de 1 minuto antes de enviar sua pergunta.'
    );
  }
  if (lastMsg.includes('503') || lastMsg.includes('high demand') || lastMsg.includes('UNAVAILABLE')) {
    throw new Error(
      'Os servidores do Google estão enfrentando alta demanda temporária. Por favor, tente enviar sua pergunta novamente em alguns segundos.'
    );
  }
  if (lastMsg.includes('500') || lastMsg.includes('INTERNAL') || lastMsg.includes('Internal error')) {
    throw new Error(
      'Os servidores da IA tiveram uma instabilidade momentânea interna. Por favor, tente enviar sua pergunta novamente.'
    );
  }
  throw new Error(
    'Não foi possível responder sua dúvida no momento. Por favor, tente novamente em instantes.'
  );
}

