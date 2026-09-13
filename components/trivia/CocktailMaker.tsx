'use client';

import { useEffect, useState } from 'react';
import { GlassWater, LoaderCircle } from 'lucide-react';
import type { TasteProfile } from '@/lib/trivia/taste';

type Recipe = {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  garnish: string;
  glass: string;
  strength: string;
  variations?: { name: string; change: string }[];
};

const inputClass = 'w-full rounded-xl border border-obsidian/12 bg-white px-3.5 py-3 text-sm text-obsidian focus:border-ember focus:ring-0';
const COMMON_INGREDIENTS = ['Lime', 'Lemon', 'Pineapple juice', 'Orange juice', 'Tonic', 'Soda water', 'Ginger beer', 'Cola', 'Mint', 'Simple syrup'];

/** Maps a taste profile onto the maker's base and style so the first recipe already fits. */
export function cocktailDefaults(profile: TasteProfile | null): { spirit: string; style: string } {
  if (!profile) return { spirit: 'gin', style: 'refreshing' };
  const first = profile.spirits[0];
  const spirit =
    first === 'wines' || first === 'champagne' ? 'wine' : first && ['cognac', 'whisky', 'vodka', 'tequila'].includes(first) ? first : 'gin';
  const f = new Set(profile.flavours);
  const style = f.has('sweet')
    ? 'sweet'
    : f.has('citrus')
      ? 'refreshing'
      : f.has('rich') || f.has('oak') || f.has('smoky')
        ? 'strong and spirit-forward'
        : 'refreshing';
  return { spirit, style };
}

export default function CocktailMaker({
  profile = null,
  embedded = false,
}: {
  /** Pre-fills base and style; changes re-seed the form until the drinker touches it. */
  profile?: TasteProfile | null;
  /** Skip the page wrapper — the parent owns the heading and spacing. */
  embedded?: boolean;
}) {
  const defaults = cocktailDefaults(profile);
  const [spirit, setSpirit] = useState(defaults.spirit);
  const [style, setStyle] = useState(defaults.style);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched) return;
    setSpirit(defaults.spirit);
    setStyle(defaults.style);
  }, [defaults.spirit, defaults.style, touched]);
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ai/cocktail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spirit,
          style,
          servings,
          ingredients: [...selectedIngredients, ingredients.trim()].filter(Boolean).join(', '),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not create a recipe.');
      setRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a recipe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={embedded ? '' : 'mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-16 sm:pt-8'}>
      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr] lg:gap-6">
        <section className="rounded-2xl border border-obsidian/10 bg-white p-5 sm:p-6">
          {!embedded && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember">AI cocktail maker</p>
              <h1 className="mt-2 font-wordmark text-2xl text-obsidian sm:text-3xl">Build a drink from what you have</h1>
            </>
          )}
          <p className={`text-[14px] leading-relaxed text-obsidian/60 ${embedded ? '' : 'mt-1.5'}`}>
            {profile && profile.spirits.length > 0 ? 'Base and style are set from your taste profile — change anything.' : 'Choose a base, a mood and what you have. One measured recipe, scaled for your group.'}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-[13px] font-bold text-obsidian/60">Base
              <select value={spirit} onChange={(e) => { setTouched(true); setSpirit(e.target.value); }} className={`${inputClass} mt-1.5`}>
                <option value="gin">Gin</option><option value="vodka">Vodka</option><option value="rum">Rum</option><option value="whisky">Whisky</option><option value="tequila">Tequila</option><option value="cognac">Cognac</option><option value="wine">Wine</option><option value="no-alcohol">No alcohol</option>
              </select>
            </label>
            <label className="text-[13px] font-bold text-obsidian/60">Style
              <select value={style} onChange={(e) => { setTouched(true); setStyle(e.target.value); }} className={`${inputClass} mt-1.5`}>
                <option value="refreshing">Refreshing</option><option value="fruity">Fruity</option><option value="sweet">Sweet</option><option value="strong and spirit-forward">Spirit-forward</option><option value="creamy">Creamy</option><option value="low-sugar">Low sugar</option>
              </select>
            </label>
            <label className="text-[13px] font-bold text-obsidian/60 sm:col-span-2">Number of servings
              <input type="number" min={1} max={20} value={servings} onChange={(e) => setServings(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className={`${inputClass} mt-1.5`} />
            </label>
            <label className="text-[13px] font-bold text-obsidian/60 sm:col-span-2">What ingredients do you have? <span className="font-normal text-obsidian/35">(optional)</span>
              <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} maxLength={400} rows={3} placeholder="Lime, pineapple juice, ginger, mint…" className={`${inputClass} mt-1.5 resize-y`} />
            </label>
            <div className="sm:col-span-2">
              <p className="text-[13px] font-bold text-obsidian/60">Or select common ingredients</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMMON_INGREDIENTS.map((item) => {
                  const active = selectedIngredients.includes(item);
                  return (
                    <button key={item} type="button" aria-pressed={active} onClick={() => setSelectedIngredients((current) => active ? current.filter((value) => value !== item) : [...current, item])} className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors ${active ? 'border-ember bg-ember text-white' : 'border-obsidian/12 text-obsidian/55 hover:border-ember/35'}`}>
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-ember">{error}</p>}
          <button type="button" onClick={generate} disabled={loading} className="btn-brand mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-60">
            {loading ? <><LoaderCircle size={16} className="animate-spin" /> Mixing your recipe…</> : 'Make my cocktail'}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-obsidian/35">Adults 18+ only. Measure every pour, offer water, and never drink and drive.</p>
        </section>

        <section className="min-h-[420px] rounded-2xl brand-gradient p-5 text-white sm:p-8">
          {recipe ? (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Your recipe</p>
              <h2 className="mt-2 font-wordmark text-3xl sm:text-4xl">{recipe.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">{recipe.description}</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div><h3 className="text-xs font-black uppercase tracking-wider text-white/50">Ingredients</h3><ul className="mt-3 space-y-2 text-sm">{recipe.ingredients.map((item) => <li key={item}>· {item}</li>)}</ul></div>
                <div><h3 className="text-xs font-black uppercase tracking-wider text-white/50">Method</h3><ol className="mt-3 space-y-3 text-sm">{recipe.steps.map((step, index) => <li key={step} className="flex gap-2"><span className="text-ember">{index + 1}.</span>{step}</li>)}</ol></div>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-xs"><div><span className="block text-white/40">Glass</span>{recipe.glass}</div><div><span className="block text-white/40">Garnish</span>{recipe.garnish}</div><div><span className="block text-white/40">Strength</span>{recipe.strength}</div></div>
              {recipe.variations && recipe.variations.length > 0 && (
                <div className="mt-7 border-t border-white/10 pt-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white/50">More ways to make it</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {recipe.variations.map((variation) => (
                      <div key={variation.name} className="border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-sm font-semibold">{variation.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/55">{variation.change}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[370px] flex-col items-center justify-center text-center"><GlassWater size={54} strokeWidth={1.2} className="text-white/25" /><h2 className="mt-5 font-wordmark text-2xl">Your recipe will appear here</h2><p className="mt-2 max-w-sm text-sm text-white/50">Tell us what is on your shelf and the cocktail maker will handle the measurements and method.</p></div>
          )}
        </section>
      </div>
    </div>
  );
}
