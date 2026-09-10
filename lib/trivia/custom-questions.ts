import sql from '@/lib/db';
import { getRound, type TriviaQuestion, type TriviaRound } from '@/lib/trivia/catalog';

export type CustomTriviaQuestion = TriviaQuestion & { databaseId: string; roundSlug: string };

function mapQuestion(row: Record<string, unknown>): CustomTriviaQuestion {
  return {
    databaseId: String(row.id),
    roundSlug: String(row.round_slug),
    id: `custom-${row.id}`,
    prompt: String(row.prompt),
    options: Array.isArray(row.options) ? row.options.map(String) : [],
    answerIndex: Number(row.answer_index),
    explainer: String(row.explainer),
  };
}

export async function listCustomQuestions(roundSlug?: string): Promise<CustomTriviaQuestion[]> {
  const rows = roundSlug
    ? await sql`SELECT * FROM trivia_custom_questions WHERE round_slug = ${roundSlug} ORDER BY created_at ASC`
    : await sql`SELECT * FROM trivia_custom_questions ORDER BY round_slug, created_at ASC`;
  return rows.map(mapQuestion);
}

export async function addCustomQuestion(input: { roundSlug: string; prompt: string; options: string[]; answerIndex: number; explainer: string }): Promise<CustomTriviaQuestion> {
  const options = input.options.map((option) => option.trim());
  if (!getRound(input.roundSlug)) throw new Error('Unknown trivia round.');
  if (!input.prompt.trim() || !input.explainer.trim() || options.length !== 4 || options.some((option) => !option)) throw new Error('Question, four options and an explanation are required.');
  if (!Number.isInteger(input.answerIndex) || input.answerIndex < 0 || input.answerIndex > 3) throw new Error('Choose the correct answer.');
  const [row] = await sql`
    INSERT INTO trivia_custom_questions (round_slug, prompt, options, answer_index, explainer)
    VALUES (${input.roundSlug}, ${input.prompt.trim()}, ${JSON.stringify(options)}::jsonb, ${input.answerIndex}, ${input.explainer.trim()})
    RETURNING *
  `;
  return mapQuestion(row);
}

export async function deleteCustomQuestion(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM trivia_custom_questions WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getRoundWithQuestions(slug: string): Promise<TriviaRound | undefined> {
  const round = getRound(slug);
  if (!round) return undefined;
  const custom = await listCustomQuestions(slug);
  return { ...round, questions: [...round.questions, ...custom] };
}
