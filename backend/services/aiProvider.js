import * as geminiService from './geminiService.js';
import * as localAiService from './localAiService.js';
import { safeLog } from '../utils/logger.js';

/**
 * Obtém informações detalhadas sobre a configuração e estado do provedor de IA atual.
 */
export async function getAiProviderInfo() {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();
  const localUrl = process.env.LOCAL_AI_URL || 'http://127.0.0.1:11434';
  const localModel = process.env.LOCAL_AI_MODEL || 'qwen2.5-vl:3b';
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'sua_chave_da_api_gemini_aqui'
  );

  const localOnline = await localAiService.isLocalAiAvailable();

  return {
    configuredProvider: provider,
    geminiKeyConfigured: geminiConfigured,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    localAi: {
      url: localUrl,
      model: localModel,
      isOnline: localOnline
    }
  };
}

/**
 * Analisa as imagens do documento roteando de acordo com a estratégia configurada (gemini, local ou auto).
 */
export async function analyzeDocumentImages(input) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

  // 1. Provedor 100% Local (ex: Qwen no Ollama / LM Studio)
  if (provider === 'local') {
    safeLog.info('Roteando análise para o provedor local (Qwen)...');
    return await localAiService.analyzeDocumentImages(input);
  }

  // 2. Provedor Auto / Híbrido: Prefere local se estiver rodando; caso contrário, vai para o Gemini
  if (provider === 'auto' || provider === 'hybrid') {
    const isLocalOnline = await localAiService.isLocalAiAvailable();
    if (isLocalOnline) {
      try {
        safeLog.info('Modo híbrido: Servidor de IA local detectado ativo. Executando localmente com Qwen...');
        return await localAiService.analyzeDocumentImages(input);
      } catch (localErr) {
        safeLog.warn(
          'Falha na inferência local no modo híbrido. Ativando fallback automático para o Google Gemini:',
          localErr.message
        );
      }
    } else {
      safeLog.info('Modo híbrido: Servidor local offline. Utilizando Google Gemini na nuvem...');
    }

    return await geminiService.analyzeDocumentImages(input);
  }

  // 3. Padrão: Google Gemini (com contingência se esgotar cota 429)
  safeLog.info('Roteando análise para o provedor Google Gemini...');
  try {
    return await geminiService.analyzeDocumentImages(input);
  } catch (geminiErr) {
    const msg = geminiErr.message || '';
    const isQuotaOrDemand =
      msg.includes('cota') ||
      msg.includes('429') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('high demand') ||
      msg.includes('503');

    // Se o Gemini falhar por cota ou indisponibilidade, verifica se há IA local para socorrer
    if (isQuotaOrDemand) {
      const isLocalOnline = await localAiService.isLocalAiAvailable();
      if (isLocalOnline) {
        safeLog.warn('Limite temporário do Gemini atingido! Ativando contingência automática com modelo local Qwen...');
        return await localAiService.analyzeDocumentImages(input);
      }
    }

    throw geminiErr;
  }
}

/**
 * Responde dúvidas sobre o documento roteando de acordo com o provedor ativo.
 */
export async function answerDocumentQuestion(params) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

  if (provider === 'local') {
    return await localAiService.answerDocumentQuestion(params);
  }

  if (provider === 'auto' || provider === 'hybrid') {
    const isLocalOnline = await localAiService.isLocalAiAvailable();
    if (isLocalOnline) {
      try {
        return await localAiService.answerDocumentQuestion(params);
      } catch (localErr) {
        safeLog.warn('Fallback automático para Gemini na resposta de dúvida:', localErr.message);
      }
    }
    return await geminiService.answerDocumentQuestion(params);
  }

  try {
    return await geminiService.answerDocumentQuestion(params);
  } catch (geminiErr) {
    const msg = geminiErr.message || '';
    if (msg.includes('cota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      const isLocalOnline = await localAiService.isLocalAiAvailable();
      if (isLocalOnline) {
        safeLog.warn('Cota de Q&A do Gemini atingida! Respondendo dúvida através do modelo local...');
        return await localAiService.answerDocumentQuestion(params);
      }
    }
    throw geminiErr;
  }
}
