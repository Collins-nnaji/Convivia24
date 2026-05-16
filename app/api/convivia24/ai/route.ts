import { NextRequest, NextResponse } from 'next/server';

const MOCK_RESPONSES = [
  "Your seating chart looks well-balanced. Consider grouping the plus-ones near the bar — they tend to mingle.",
  "Based on your guest count, the venue capacity gives you a comfortable 20% buffer. That's good planning.",
  "The RSVP deadline is two weeks out. A gentle reminder to pending guests now typically lifts response rates.",
  "For a morning ceremony, guests appreciate knowing parking details in the invite. Worth adding to your event notes.",
  "Your gift registry has a healthy mix of items and experiences. The contribution-style gifts usually see the most activity.",
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { messages, event_context } = body as {
    messages?: { role: string; content: string }[];
    event_context?: string;
  };

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'messages array required' }, { status: 400 });
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey   = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

  if (endpoint && apiKey) {
    const systemPrompt = [
      'You are Convivia24 — a polished, sparse event planning concierge. Voice: warm, present-tense, second-person. Like a maître d\'. Never exclamation marks. No emoji. No "Absolutely!" or "Great question!". Just answers.',
      'You help hosts plan weddings, birthdays, corporate parties, club nights, dinners, funerals, festivals, baby showers, and engagements.',
      'When asked about venues, vendors, themes, logistics, or weather: give concrete, plausible names, neighborhoods, price tiers, and dates. Format answers as short, scannable blocks with bolded leads when listing options.',
      event_context ? `\nEvent context:\n${event_context}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[convivia24/ai] Azure OpenAI error', response.status, err);
      return NextResponse.json({ error: 'AI unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ reply });
  }

  // No credentials — return a contextual mock
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const seed = lastUserMessage.length % MOCK_RESPONSES.length;
  const reply = MOCK_RESPONSES[seed];

  return NextResponse.json({ reply, mock: true });
}
