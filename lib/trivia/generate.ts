import { chat } from '@/lib/ai/azure';
import { TRIVIA_ROUNDS, type TriviaQuestion } from '@/lib/trivia/catalog';
import { DRINKS } from '@/lib/drinks/catalog';

export type DraftQuestion = Omit<TriviaQuestion, 'id'>;

/**
 * Drafts multiple-choice questions for a brand round. The desk reviews every draft before it
 * is saved — nothing here writes to the database.
 */
export async function generateQuestions(input: { roundSlug: string; count?: number; focus?: string | null }): Promise<DraftQuestion[]> {
  const round = TRIVIA_ROUNDS.find((r) => r.slug === input.roundSlug);
  if (!round) throw new Error('Unknown round.');
  const count = Math.min(10, Math.max(1, Math.floor(input.count ?? 5)));
  const bottle = DRINKS.find((d) => d.slug === round.prizeSlug);
  const existing = round.questions.map((q) => q.prompt);

  const raw = await chat({
    json: true,
    temperature: 0.7,
    maxTokens: 1800,
    messages: [
      {
        role: 'system',
        content:
          'You write pub-quiz questions about drinks brands for Convivia24, a Lagos drinks shop. Questions must be factually accurate, specific to the house, and answerable from general knowledge about the brand — history, region, production, style, signature bottles. Never encourage excess or underage drinking. Reply with JSON only.',
      },
      {
        role: 'user',
        content: `House: ${round.house}
Brand: ${round.brand}
About: ${round.blurb}
Prize bottle: ${round.prizeLabel}${bottle?.description ? ` — ${bottle.description}` : ''}
${input.focus ? `Focus on: ${input.focus}\n` : ''}Avoid repeating these existing questions:
${existing.map((p) => `- ${p}`).join('\n') || '- (none)'}

Write ${count} new multiple-choice questions. Each has exactly 4 options, one correct, plausible distractors, and a one-sentence explainer of the right answer. Mix difficulty. Return:
{"questions":[{"prompt":"...","options":["a","b","c","d"],"answerIndex":0,"explainer":"..."}]}`,
      },
    ],
  });

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI returned no JSON.');
  const parsed = JSON.parse(match[0]) as { questions?: unknown };
  const list = Array.isArray(parsed.questions) ? parsed.questions : [];
  const drafts: DraftQuestion[] = [];
  for (const q of list) {
    const row = (q || {}) as Record<string, unknown>;
    const prompt = String(row.prompt || '').trim();
    const options = Array.isArray(row.options) ? row.options.map((o) => String(o).trim()).filter(Boolean) : [];
    const answerIndex = Number(row.answerIndex);
    const explainer = String(row.explainer || '').trim();
    if (!prompt || options.length !== 4 || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) continue;
    drafts.push({ prompt: prompt.slice(0, 500), options, answerIndex, explainer: explainer.slice(0, 1000) });
  }
  if (drafts.length === 0) throw new Error('AI returned no usable questions — try again.');
  return drafts;
}
