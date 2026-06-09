// Thin Azure OpenAI chat client used across the platform's AI features.

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export function aiConfigured(): boolean {
  return !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY);
}

interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

/**
 * Call Azure OpenAI chat completions. Returns the assistant message content.
 * Throws if the service is not configured or the request fails.
 */
export async function chat({ messages, temperature = 0.7, maxTokens = 900, json = false }: ChatOptions): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const deployment =
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    'gpt-4.1';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

  if (!endpoint || !key) throw new Error('Azure OpenAI is not configured.');

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': key },
    body: JSON.stringify({
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Azure OpenAI error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? '';
}
