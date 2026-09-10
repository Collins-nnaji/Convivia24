// Thin Azure OpenAI chat client used across the platform's AI features.

/** A text part, or an image the model should read (data: URI or https URL). */
export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' | 'auto' } };

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  /** A plain string, or content parts when an image is attached (vision-capable deployments only). */
  content: string | ContentPart[];
};

export function aiConfigured(): boolean {
  return !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY);
}

interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  /** Which deployment to target: the chat model (default) or the analysis model. */
  model?: 'chat' | 'analysis';
}

export class AzureAiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AzureAiError';
    this.status = status;
  }
}

function deploymentFor(model: 'chat' | 'analysis'): string {
  if (model === 'analysis') {
    return process.env.AZURE_OPENAI_ANALYSIS_DEPLOYMENT ||
      process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
      process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1';
  }
  return process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
    process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1';
}

/**
 * Call Azure OpenAI chat completions. Returns the assistant message content.
 * Throws if the service is not configured or the request fails.
 */
export async function chat({ messages, temperature = 0.7, maxTokens = 900, json = false, model = 'chat' }: ChatOptions): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const deployment = deploymentFor(model);
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

  if (!endpoint || !key) throw new Error('Azure OpenAI is not configured.');

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  // GPT-5 and the o-series use the completion-token field and do not accept arbitrary
  // temperatures. Keeping this here means cocktail copy and image extraction share the same
  // deployment safely instead of each route having its own subtly different Azure request.
  const usesReasoningParameters = /^(gpt-5|o[134](?:-|$))/i.test(deployment);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': key },
    body: JSON.stringify({
      messages,
      ...(usesReasoningParameters ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens, temperature }),
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AzureAiError(res.status, `Azure OpenAI error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim() ?? '';
  if (!content) throw new AzureAiError(502, 'Azure OpenAI returned an empty response.');
  return content;
}
