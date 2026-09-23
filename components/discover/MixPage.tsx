'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CocktailMaker from '@/components/trivia/CocktailMaker';
import { useTriviaHub } from '@/components/trivia/use-hub';
import { hasTasteProfile } from '@/lib/trivia/taste';
import PageHeader from './PageHeader';

/** Standalone cocktail maker — taste profile or mix-card query params seed the form. */
export default function MixPage() {
  const hub = useTriviaHub();
  const params = useSearchParams();
  const built = hasTasteProfile(hub.profile);
  const preset = {
    spirit: params.get('spirit'),
    style: params.get('style'),
    ingredients: params.get('ingredients'),
  };
  const hasPreset = Boolean(preset.spirit || preset.style || preset.ingredients);

  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title="Cocktail maker"
        lead={
          hasPreset
            ? 'This mix is pre-filled from your taste page — change anything before you generate.'
            : 'Pick a base, a mood and what you have. One measured recipe, scaled for your group.'
        }
        action={
          <Link
            href="/discover/taste"
            className="text-[12px] font-bold uppercase tracking-[0.12em] text-obsidian/45 hover:text-ember"
          >
            {built ? 'Your taste →' : 'Build taste →'}
          </Link>
        }
      />
      <div className="p-4 sm:p-6">
        <CocktailMaker profile={hub.profile} embedded preset={hasPreset ? preset : null} />
      </div>
    </>
  );
}
