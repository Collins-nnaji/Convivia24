import { NextRequest, NextResponse } from 'next/server';
import { aiConfigured, chat } from '@/lib/ai/azure';
import { clientIp, rateLimit } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

type Recipe = {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  garnish: string;
  glass: string;
  strength: string;
  variations: { name: string; change: string }[];
};

function fallbackRecipe(spirit: string, ingredients: string, style: string, servings: number): Recipe {
  const base = spirit === 'no-alcohol' ? 'sparkling water' : spirit;
  return {
    name: style === 'refreshing' ? 'Convivia Citrus Highball' : 'Convivia House Mix',
    description: `A simple ${style} serve built around ${base}.`,
    ingredients: [
      `${servings * 45} ml ${base}`,
      `${servings * 25} ml fresh lime or lemon juice`,
      `${servings * 15} ml simple syrup`,
      `${servings * 60} ml chilled soda water`,
      ...(ingredients ? [`Your extras: ${ingredients}`] : []),
      'Plenty of ice',
    ],
    steps: [
      'Fill the glasses with ice.',
      'Add the base, citrus and syrup, then stir well.',
      'Top with soda water and stir once more.',
    ],
    garnish: 'A citrus wheel or peel',
    glass: 'Highball',
    strength: spirit === 'no-alcohol' ? 'Alcohol-free' : 'Moderate — one measured serve per person',
    variations: [
      { name: 'Make it fruity', change: 'Add pineapple or orange juice and reduce the soda by the same amount.' },
      { name: 'Make it sharper', change: 'Add a little more citrus and use less syrup.' },
      { name: 'Make it lighter', change: 'Use half the base and add more chilled soda water.' },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`cocktail-ai:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many recipes requested. Try again shortly.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const spirit = String(body.spirit || 'gin').trim().slice(0, 40);
    const ingredients = String(body.ingredients || '').trim().slice(0, 400);
    const style = String(body.style || 'refreshing').trim().slice(0, 40);
    const servings = Math.max(1, Math.min(20, Math.floor(Number(body.servings) || 2)));

    if (!aiConfigured()) {
      return NextResponse.json({ recipe: fallbackRecipe(spirit, ingredients, style, servings), ai: false });
    }

    const raw = await chat({
      json: true,
      temperature: 0.7,
      maxTokens: 700,
      messages: [
        {
          role: 'system',
          content:
            'You are a careful cocktail developer for adults 18+. Create one practical recipe using common Nigerian supermarket ingredients. Use exact metric amounts scaled to the requested servings. Never exceed 60 ml of 40% spirit per person, never encourage rapid or excessive drinking, never make health claims, and never mix alcohol with medicines or dangerous substances. If alcohol-free is requested, use no alcohol. Return JSON only with: name, description, ingredients (string array), steps (string array), garnish, glass, strength, variations (exactly 3 objects with name and a concise change).',
        },
        {
          role: 'user',
          content: `Base: ${spirit}\nStyle: ${style}\nServings: ${servings}\nIngredients available or preferences: ${ingredients || 'No extras specified; use accessible ingredients.'}`,
        },
      ],
    });

    const parsed = JSON.parse(raw) as Recipe;
    if (!parsed.name || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
      throw new Error('Incomplete recipe');
    }
    parsed.variations = Array.isArray(parsed.variations) ? parsed.variations.slice(0, 3) : [];
    return NextResponse.json({ recipe: parsed, ai: true });
  } catch (error) {
    captureApiError(error, { route: 'ai/cocktail' });
    return NextResponse.json({ error: 'The cocktail maker is unavailable right now.' }, { status: 500 });
  }
}
