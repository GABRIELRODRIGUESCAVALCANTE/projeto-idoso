import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { SYSTEM_INSTRUCTION } from '../prompts/documentPrompt.js';
import { QA_SYSTEM_INSTRUCTION, buildQAPrompt } from '../prompts/qaPrompt.js';
import { safeLog } from '../utils/logger.js';
import { validateDocumentAnalysis } from '../schemas/documentSchema.js';
import { applyBarcodeAudit } from '../utils/barcodeAudit.js';

const execFileAsync = promisify(execFile);

/**
 * Converte as primeiras páginas de um PDF em buffers de imagem PNG usando pdftoppm (se disponível no sistema)
 */
async function convertPdfToImages(pdfBuffer) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-conv-'));
  const inputPdf = path.join(tmpDir, 'input.pdf');

  try {
    await fs.promises.writeFile(inputPdf, pdfBuffer);
    // Converte até 2 páginas (frente e verso) com 150 DPI para equilíbrio ideal entre legibilidade e velocidade
    await execFileAsync('pdftoppm', ['-png', '-r', '150', '-f', '1', '-l', '2', inputPdf, path.join(tmpDir, 'page')]);

    const files = (await fs.promises.readdir(tmpDir))
      .filter((f) => f.startsWith('page-') && f.endsWith('.png'))
      .sort();

    if (files.length === 0) {
      throw new Error('Nenhuma página de imagem gerada a partir do PDF.');
    }

    const images = [];
    for (const f of files) {
      images.push(await fs.promises.readFile(path.join(tmpDir, f)));
    }
    return images;
  } finally {
    try {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

// Configurações com valores padrão resilientes
const getLocalConfig = () => {
  const rawUrl = process.env.LOCAL_AI_URL || 'http://127.0.0.1:11434';
  const url = rawUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const model = process.env.LOCAL_AI_MODEL || 'qwen2.5vl:3b';
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
    confianca: ['alta', 'media', 'baixa'].includes(raw.confianca) ? raw.confianca : 'baixa',
    resumoSimples: raw.resumoSimples || 'Informações resumidas do documento.',
    acoesEssenciais: Array.isArray(raw.acoesEssenciais) ? raw.acoesEssenciais : [],
    valoresEPrazos: {
      valorPrincipal: raw.valoresEPrazos?.valorPrincipal || 'Não se aplica',
      dataVencimento: raw.valoresEPrazos?.dataVencimento || 'Não possui vencimento',
      consequenciaAtraso: raw.valoresEPrazos?.consequenciaAtraso || 'Nenhuma consequência imediata identificada',
      avisoConferencia: raw.valoresEPrazos?.avisoConferencia || ''
    },
    linhaDigitavel: raw.linhaDigitavel || null,
    codigoBarrasInfo: null,
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
        temperature: 0.1,
        num_ctx: 8192
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
    const combinedMsg = `${err.message || ''} ${lastError?.message || ''}`;
    if (combinedMsg.includes('Failed to load image')) {
      throw new Error(
        'O modelo local de IA não conseguiu decodificar a imagem enviada. Certifique-se de que o arquivo é uma foto/imagem válida (JPG, PNG ou WebP).'
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
  const rawFiles = Array.isArray(input?.files)
    ? input.files
    : (input?.buffer ? [{ buffer: input.buffer, mimeType: input.mimeType }] : []);

  if (rawFiles.length === 0) {
    throw new Error('Nenhum arquivo ou imagem foi fornecido para análise.');
  }

  safeLog.info(`Iniciando análise com modelo local: ${model} via ${url} (${rawFiles.length} arquivos recebidos)`);

  // Converte arquivos PDF em imagens PNG (o modelo local de visão aceita apenas imagens)
  const base64Images = [];
  for (const file of rawFiles) {
    const isPdf =
      file.mimeType === 'application/pdf' ||
      (file.buffer && file.buffer.slice(0, 5).toString('ascii').startsWith('%PDF'));

    if (isPdf) {
      try {
        safeLog.info('Documento em formato PDF detectado. Convertendo páginas em PNG para o modelo de visão...');
        const pageBuffers = await convertPdfToImages(file.buffer);
        for (const buf of pageBuffers) {
          base64Images.push(buf.toString('base64'));
        }
        safeLog.info(`PDF convertido com sucesso em ${pageBuffers.length} página(s) de imagem.`);
      } catch (convErr) {
        safeLog.warn('Falha na conversão de PDF para imagem:', convErr.message);
        throw new Error(
          'O modelo local de IA (Ollama / Qwen-VL) aceita apenas arquivos de imagem (JPG, PNG, WebP). Para analisar este documento, envie uma foto ou print da página, ou configure a chave da API do Google Gemini no arquivo .env.'
        );
      }
    } else {
      base64Images.push(file.buffer.toString('base64'));
    }
  }

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

  const promptText = base64Images.length > 1
    ? `Analise as ${base64Images.length} imagens/páginas deste documento em conjunto. Cruze todas as informações de ambos os lados para gerar uma explicação única, completa, humanizada e acessível conforme suas diretrizes de mediador social.\n${schemaContract}`
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
    safeLog.warn('Saída do modelo local não pôde ser convertida em JSON estruturado.');
    throw new Error('O modelo local gerou uma resposta que não continha um JSON válido.');
  }

  // Normalização e validação Zod
  const normalized = normalizeDocumentData(parsed);
  const validation = validateDocumentAnalysis(normalized);

  if (!validation.isValid) {
    safeLog.warn(`Validação Zod reprovada no modelo local ${model}:`, validation.error);
    throw new Error(`Estrutura da análise do modelo local é inválida: ${validation.error}`);
  }

  const docData = validation.data;

  // Verificação determinística + auditoria antifraude do código de barras (B1)
  applyBarcodeAudit(docData, safeLog);

  docData.meta = { provedor: 'local', modelo: model };

  safeLog.info(`Sucesso na análise com modelo local ${model} (confiança: ${docData.confianca})`);
  return docData;
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
