import { SYSTEM_INSTRUCTION } from '../prompts/documentPrompt.js';
import { QA_SYSTEM_INSTRUCTION, buildQAPrompt } from '../prompts/qaPrompt.js';
import { safeLog } from '../utils/logger.js';
import { validateDocumentAnalysis } from '../schemas/documentSchema.js';

// Configurações com valores padrão resilientes
const getLocalConfig = () => {
  const rawUrl = process.env.LOCAL_AI_URL || 'http://127.0.0.1:11434';
  const url = rawUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const model = process.env.LOCAL_AI_MODEL || 'qwen2.5-vl:3b';
  const timeoutMs = parseInt(process.env.LOCAL_AI_TIMEOUT || '180000', 10); // 3 minutos para inferência local em CPU
  return { url, model, timeoutMs };
};

/**
 * Extrai e sanitiza JSON a partir do texto gerado por modelos locais
 * (lida com blocos markdown ```json, textos explicativos antes/depois e pequenos desvios).
 */
function extractJsonFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();

  // 1. Tentativa direta de parsing
  try {
    return JSON.parse(trimmed);
  } catch (_) {}

  // 2. Remove blocos de código markdown ```json ... ```
  const cleanMarkdown = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleanMarkdown);
  } catch (_) {}

  // 3. Procura pela primeira abertura { e última fechamento }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {}
  }

  return null;
}

/**
 * Normaliza os campos do objeto retornado pelo modelo local antes da validação Zod,
 * garantindo valores padrão caso o modelo omita campos opcionais.
 */
function normalizeDocumentData(raw) {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    categoria: raw.categoria || 'OUTRO',
    tipoDocumento: raw.tipoDocumento || 'Documento analisado',
    confianca: ['alta', 'media', 'baixa'].includes(raw.confianca) ? raw.confianca : 'media',
    resumoSimples: raw.resumoSimples || 'Informações resumidas do documento.',
    acoesEssenciais: Array.isArray(raw.acoesEssenciais) ? raw.acoesEssenciais : [],
    valoresEPrazos: {
      valorPrincipal: raw.valoresEPrazos?.valorPrincipal || 'Não se aplica',
      dataVencimento: raw.valoresEPrazos?.dataVencimento || 'Não possui vencimento',
      consequenciaAtraso: raw.valoresEPrazos?.consequenciaAtraso || 'Nenhuma consequência imediata identificada',
      avisoConferencia: raw.valoresEPrazos?.avisoConferencia || ''
    },
    pontosDeAtencao: Array.isArray(raw.pontosDeAtencao) ? raw.pontosDeAtencao : [],
    alertaEtico: raw.alertaEtico || 'Sempre confira os dados originais no documento físico ou consulte o órgão emissor.',
    textoParaVoz: raw.textoParaVoz || raw.resumoSimples || 'Documento analisado com sucesso.',
    detalhesReceita: {
      possuiTrechoIlegivel: Boolean(raw.detalhesReceita?.possuiTrechoIlegivel),
      medicamentosIdentificados: Array.isArray(raw.detalhesReceita?.medicamentosIdentificados)
        ? raw.detalhesReceita.medicamentosIdentificados
        : []
    }
  };
}

/**
 * Verifica rapidamente se o servidor local de IA está acessível e respondendo.
 */
export async function isLocalAiAvailable() {
  const { url } = getLocalConfig();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout para checagem rápida

    // Tenta primeiro endpoint nativo do Ollama (/api/tags)
    let response = await fetch(`${url}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    }).catch(() => null);

    // Se falhar, tenta endpoint OpenAI-compatível (/v1/models)
    if (!response || !response.ok) {
      response = await fetch(`${url}/v1/models`, {
        method: 'GET',
        signal: controller.signal
      }).catch(() => null);
    }

    clearTimeout(timeoutId);
    return Boolean(response && response.ok);
  } catch (_) {
    return false;
  }
}

/**
 * Envia uma mensagem multimodal (imagens + prompt) para a IA local.
 * Suporta o endpoint nativo do Ollama (/api/chat) com fallback para padrão OpenAI (/v1/chat/completions).
 */
async function callLocalVisionModel({ systemPrompt, userPrompt, base64Images = [], jsonFormat = false }) {
  const { url, model, timeoutMs } = getLocalConfig();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let lastError = null;

  // Tentativa 1: Endpoint nativo do Ollama (/api/chat)
  try {
    const ollamaPayload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userPrompt,
          ...(base64Images.length > 0 ? { images: base64Images } : {})
        }
      ],
      stream: false,
      ...(jsonFormat ? { format: 'json' } : {}),
      options: {
        temperature: 0.1
      }
    };

    const res = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaPayload),
      signal: controller.signal
    });

    if (res.ok) {
      const data = await res.json();
      clearTimeout(timeoutId);
      return data?.message?.content || '';
    } else {
      const errorText = await res.text().catch(() => '');
      lastError = new Error(`Ollama retornou status ${res.status}: ${errorText}`);
    }
  } catch (err) {
    lastError = err;
  }

  // Tentativa 2: Fallback para formato universal OpenAI-compatível (/v1/chat/completions)
  // Utilizado por LM Studio, vLLM, LocalAI e llama-server
  try {
    const userContent = [{ type: 'text', text: userPrompt }];
    for (const imgBase64 of base64Images) {
      userContent.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${imgBase64}` }
      });
    }

    const openAiPayload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: base64Images.length > 0 ? userContent : userPrompt }
      ],
      temperature: 0.1,
      ...(jsonFormat ? { response_format: { type: 'json_object' } } : {})
    };

    const res = await fetch(`${url}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(openAiPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || '';
    } else {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Servidor local (/v1) retornou status ${res.status}: ${errorText}`);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(
        `Tempo limite esgotado (${Math.round(timeoutMs / 1000)}s) aguardando resposta da IA local. Na CPU, modelos de visão podem demorar mais ou o modelo pode não ter carregado.`
      );
    }
    throw new Error(
      `Não foi possível comunicar com o servidor de IA local em ${url}. Verifique se o Ollama/servidor local está rodando (erro: ${err.message || lastError?.message})`
    );
  }
}

/**
 * Análise de documentos utilizando o modelo local (ex: Qwen2-VL / Qwen2.5-VL)
 */
export async function analyzeDocumentImages(input) {
  const { model, url } = getLocalConfig();
  const files = Array.isArray(input?.files)
    ? input.files
    : (input?.buffer ? [{ buffer: input.buffer, mimeType: input.mimeType }] : []);

  if (files.length === 0) {
    throw new Error('Nenhum arquivo ou imagem foi fornecido para análise.');
  }

  safeLog.info(`Iniciando análise com modelo local: ${model} via ${url} (${files.length} páginas)`);

  const base64Images = files.map((file) => file.buffer.toString('base64'));

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
    "avisoConferencia": "Confira no papel: ..."
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
    ? `Analise as ${files.length} imagens/páginas deste documento em conjunto. Cruze todas as informações de ambos os lados para gerar uma explicação única, completa, humanizada e acessível conforme suas diretrizes de mediador social.\n${schemaContract}`
    : `Analise este documento recebido e gere a explicação humanizada, acolhedora e acessível conforme suas diretrizes de mediador social.\n${schemaContract}`;

  const rawOutput = await callLocalVisionModel({
    systemPrompt: SYSTEM_INSTRUCTION,
    userPrompt: promptText,
    base64Images,
    jsonFormat: true
  });

  if (!rawOutput) {
    throw new Error('O modelo local não retornou conteúdo na resposta.');
  }

  const parsed = extractJsonFromText(rawOutput);
  if (!parsed) {
    safeLog.warn('Saída bruta do modelo local não pôde ser convertida em JSON:', rawOutput.slice(0, 300));
    throw new Error('O modelo local gerou uma resposta que não continha um JSON válido.');
  }

  // Normalização e validação Zod
  const normalized = normalizeDocumentData(parsed);
  const validation = validateDocumentAnalysis(normalized);

  if (!validation.isValid) {
    safeLog.warn(`Validação Zod reprovada no modelo local ${model}:`, validation.error);
    throw new Error(`Estrutura da análise do modelo local é inválida: ${validation.error}`);
  }

  safeLog.info(`Sucesso na análise com modelo local ${model} (confiança: ${validation.data.confianca})`);
  return validation.data;
}

/**
 * Responde dúvidas sobre o documento utilizando o modelo local
 */
export async function answerDocumentQuestion({ documentData, question, history = [] }) {
  const { model, url } = getLocalConfig();

  if (!documentData || !question || question.trim() === '') {
    throw new Error('Dados do documento ou pergunta não fornecidos.');
  }

  safeLog.info(`Respondendo dúvida com o modelo local: ${model} via ${url}`);

  const promptText = buildQAPrompt({ documentData, question, history });

  const rawOutput = await callLocalVisionModel({
    systemPrompt: QA_SYSTEM_INSTRUCTION,
    userPrompt: promptText,
    base64Images: [],
    jsonFormat: false
  });

  if (!rawOutput) {
    throw new Error('O modelo local não retornou resposta para a pergunta.');
  }

  safeLog.info(`Dúvida respondida com sucesso pelo modelo local ${model}`);
  return rawOutput.trim();
}
