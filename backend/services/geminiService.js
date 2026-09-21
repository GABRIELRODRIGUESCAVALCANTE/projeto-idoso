import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION, DOCUMENT_RESPONSE_SCHEMA } from '../prompts/documentPrompt.js';

export async function analyzeDocumentImage({ buffer, mimeType }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'sua_chave_da_api_gemini_aqui') {
    throw new Error(
      'Chave GEMINI_API_KEY não configurada. Por favor, adicione sua chave de API no arquivo .env do backend.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const base64Data = buffer.toString('base64');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    // Limpeza de possíveis blocos de markdown ```json se vierem anexados
    const cleanedText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleanedText);
  } catch (err) {
    console.error('Erro na chamada da API Gemini:', err);
    throw err;
  }
}
