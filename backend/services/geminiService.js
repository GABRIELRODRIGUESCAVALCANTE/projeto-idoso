import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION, DOCUMENT_RESPONSE_SCHEMA } from '../prompts/documentPrompt.js';
import { QA_SYSTEM_INSTRUCTION, buildQAPrompt } from '../prompts/qaPrompt.js';

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

  // Lista de modelos resilientes em ordem de prioridade (flash-lite tem resposta instantânea e sem fila de 503)
  const configured = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : [];
  const candidateModels = [
    ...configured,
    'gemini-flash-lite-latest',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash'
  ];
  const uniqueModels = [...new Set(candidateModels)];

  // Monta as partes multimodais com todas as páginas/lados enviados
  const parts = files.map((file) => ({
    inlineData: {
      mimeType: file.mimeType || 'image/jpeg',
      data: file.buffer.toString('base64')
    }
  }));

  const promptText = files.length > 1
    ? `Analise as ${files.length} imagens/páginas recebidas deste documento (frente e verso ou páginas múltiplas) em conjunto. Cruze todas as informações de ambos os lados para gerar uma explicação única, completa, humanizada e acessível conforme suas diretrizes de mediador social.`
    : 'Analise este documento recebido e gere a explicação humanizada, acolhedora e acessível conforme suas diretrizes de mediador social.';

  parts.push({ text: promptText });

  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      console.log(`[LOG] Tentando análise de ${files.length} página(s) com o modelo: ${modelName}...`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts
          }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: DOCUMENT_RESPONSE_SCHEMA,
          temperature: 0.2
        }
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

      const parsed = JSON.parse(cleanedText);
      console.log(`[LOG] Sucesso na análise com o modelo ${modelName}!`);
      return parsed;
    } catch (err) {
      lastError = err;
      const errorMsg = err.message || '';
      console.warn(`[AVISO] Falha temporária com ${modelName}:`, errorMsg);

      const isHighDemand = errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE');
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');

      if (isHighDemand || isRateLimit) {
        console.log('[LOG] Alta demanda detectada. Aguardando 1.5s antes de tentar o próximo modelo...');
        await sleep(1500);
        continue; // Tenta o próximo modelo
      }

      // Se for outro tipo de erro fatal (como formato de arquivo), lança direto
      throw err;
    }
  }

  // Se todos os modelos falharam por alta demanda
  console.error('[ERRO] Todos os modelos de fallback falharam:', lastError?.message);
  throw new Error(
    'Os servidores do Google estão enfrentando um pico temporário de demanda neste minuto. Por favor, tente clicar novamente em "Explicar Documento" em alguns instantes.'
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
    'gemini-flash-lite-latest',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash'
  ];
  const uniqueModels = [...new Set(candidateModels)];

  const promptText = buildQAPrompt({ documentData, question, history });
  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      console.log(`[LOG] Respondendo dúvida com o modelo: ${modelName}...`);

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

      console.log(`[LOG] Resposta da dúvida gerada com sucesso com ${modelName}!`);
      return responseText.trim();
    } catch (err) {
      lastError = err;
      const errorMsg = err.message || '';
      console.warn(`[AVISO] Falha temporária no Q&A com ${modelName}:`, errorMsg);

      const isHighDemand = errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE');
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');

      if (isHighDemand || isRateLimit) {
        console.log('[LOG] Alta demanda no Q&A. Aguardando 1.5s antes do próximo modelo...');
        await sleep(1500);
        continue;
      }

      throw err;
    }
  }

  console.error('[ERRO] Todos os modelos de fallback falharam no Q&A:', lastError?.message);
  throw new Error(
    'Os servidores do Google estão enfrentando alta demanda. Por favor, tente enviar sua pergunta novamente em alguns segundos.'
  );
}

