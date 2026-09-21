import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION, DOCUMENT_RESPONSE_SCHEMA } from '../prompts/documentPrompt.js';

// Função auxiliar para aguardar milissegundos
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeDocumentImage({ buffer, mimeType }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'sua_chave_da_api_gemini_aqui') {
    throw new Error(
      'Chave GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API no arquivo .env do backend.'
    );
  }

  const cleanApiKey = apiKey.trim();
  const ai = new GoogleGenAI({ apiKey: cleanApiKey });
  const base64Data = buffer.toString('base64');

  // Lista de modelos resilientes em ordem de prioridade
  const configured = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : [];
  const candidateModels = [
    ...configured,
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest'
  ];
  const uniqueModels = [...new Set(candidateModels)];

  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      console.log(`[LOG] Tentando análise com o modelo: ${modelName}...`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: base64Data
                }
              },
              {
                text: 'Analise este documento recebido e gere a explicação humanizada, acolhedora e acessível conforme suas diretrizes de mediador social.'
              }
            ]
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
