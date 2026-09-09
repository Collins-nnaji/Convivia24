import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';
import { DRINKS } from '@/lib/drinks/catalog';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';

export default function HomeTriviaCard() {
  const round = TRIVIA_ROUNDS[0];
  const bottle = DRINKS.find((drink) => drink.slug === round.prizeSlug);

  return (
    <section className="bg-paper pb-10 sm:pb-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <Link
          href="/discover"
          className="group relative grid min-h-[260px] overflow-hidden brand-gradient text-white sm:grid-cols-[minmax(0,1fr)_280px] sm:min-h-[320px]"
        >
          <div className="relative z-10 flex flex-col justify-center p-6 sm:p-10">
            <p className="text-[9px] font-wordmark-sm text-white/60 mb-3">Drink trivia</p>
            <h2 className="font-wordmark text-3xl sm:text-4xl">Know your {round.brand}?</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
              Answer {round.questions.length} questions, earn 250 points and enter the draw for a {round.prizeLabel}.
            </p>
            <span className="mt-6 inline-flex w-fit items-center gap-2 bg-white px-5 py-3 text-[10px] font-wordmark-sm text-obsidian transition-transform group-hover:translate-x-1">
              Play trivia <ArrowRight size={13} />
            </span>
          </div>

          <div className="absolute right-2 top-1/2 h-[220px] w-[130px] -translate-y-1/2 opacity-50 sm:relative sm:right-auto sm:top-auto sm:h-auto sm:w-auto sm:translate-y-0 sm:opacity-100">
            <div className="absolute inset-0 bg-ember/20 blur-3xl" aria-hidden />
            {bottle?.image && (
              <Image
                src={bottle.image}
                alt={bottle.name}
                fill
                sizes="(max-width: 640px) 130px, 280px"
                className="relative object-contain p-5 drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)] sm:p-8"
              />
            )}
            <span className="absolute right-4 top-4 hidden items-center gap-1.5 bg-white/10 px-2.5 py-1 text-[9px] font-wordmark-sm sm:inline-flex">
              <Gift size={12} /> Bottle draw
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
