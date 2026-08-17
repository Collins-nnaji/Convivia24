/**
 * Brand-education trivia. Each round is sponsored by a house and carries a
 * complimentary-bottle draw. Questions are house facts, not marketing claims —
 * every answer ships with an explainer so a wrong answer still teaches.
 */

export type TriviaQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explainer: string;
};

export type TriviaRound = {
  slug: string;
  brand: string;
  house: string;
  category: string;
  blurb: string;
  /** Correct answers needed to qualify for the draw. */
  passScore: number;
  /** Shop slug of the bottle the sponsor is putting up. */
  prizeSlug: string;
  prizeLabel: string;
  questions: TriviaQuestion[];
};

export const TRIVIA_ROUNDS: TriviaRound[] = [
  {
    slug: 'hennessy',
    brand: 'Hennessy',
    house: 'Cognac · Maison Hennessy',
    category: 'cognac',
    blurb: 'Cognac grades, grapes and the Charente. Five questions on the biggest house in the region.',
    passScore: 4,
    prizeSlug: 'hennessy-vs',
    prizeLabel: 'Hennessy VS 70cl',
    questions: [
      {
        id: 'hen-1',
        prompt: 'What does the “VS” on a bottle of cognac stand for?',
        options: ['Very Special', 'Vintage Selection', 'Very Smooth', 'Vieux Supérieur'],
        answerIndex: 0,
        explainer: 'VS means Very Special — the youngest eau-de-vie in the blend has aged at least two years.',
      },
      {
        id: 'hen-2',
        prompt: 'Cognac can only be made in which country?',
        options: ['Spain', 'Italy', 'France', 'Belgium'],
        answerIndex: 2,
        explainer: 'Cognac is a protected appellation around the town of Cognac in south-west France.',
      },
      {
        id: 'hen-3',
        prompt: 'Which grape dominates cognac production?',
        options: ['Merlot', 'Ugni Blanc', 'Chardonnay', 'Pinot Noir'],
        answerIndex: 1,
        explainer: 'Ugni Blanc is high in acid and low in alcohol — ideal for double distillation.',
      },
      {
        id: 'hen-4',
        prompt: 'How many times is cognac distilled?',
        options: ['Once', 'Twice', 'Three times', 'Four times'],
        answerIndex: 1,
        explainer: 'Cognac is double-distilled in copper pot stills called alambics charentais.',
      },
      {
        id: 'hen-5',
        prompt: 'Which grade sits above VSOP in age?',
        options: ['VS', 'XO', 'Blanc', 'Fine'],
        answerIndex: 1,
        explainer: 'XO (Extra Old) requires a minimum of ten years for the youngest eau-de-vie in the blend.',
      },
    ],
  },
  {
    slug: 'johnnie-walker',
    brand: 'Johnnie Walker',
    house: 'Scotch whisky · Diageo',
    category: 'whisky',
    blurb: 'The striding man, the labels, and what blended Scotch actually means.',
    passScore: 4,
    prizeSlug: 'johnnie-walker-black',
    prizeLabel: 'Johnnie Walker Black Label 75cl',
    questions: [
      {
        id: 'jw-1',
        prompt: 'Johnnie Walker Black Label carries which minimum age statement?',
        options: ['8 years', '10 years', '12 years', '15 years'],
        answerIndex: 2,
        explainer: 'Every whisky in the Black Label blend has matured at least 12 years.',
      },
      {
        id: 'jw-2',
        prompt: 'What is a “blended Scotch whisky”?',
        options: [
          'Malt and grain whiskies blended together',
          'Whisky blended with water only',
          'Two single malts from the same distillery',
          'Whisky blended with sherry',
        ],
        answerIndex: 0,
        explainer: 'A blend marries single malt whiskies with grain whiskies from multiple distilleries.',
      },
      {
        id: 'jw-3',
        prompt: 'Scotch whisky must be matured in oak casks in Scotland for at least how long?',
        options: ['1 year', '2 years', '3 years', '5 years'],
        answerIndex: 2,
        explainer: 'Three years in oak, in Scotland, is the legal minimum before it can be called Scotch.',
      },
      {
        id: 'jw-4',
        prompt: 'Which label is the top of the core Johnnie Walker range?',
        options: ['Red', 'Green', 'Gold Reserve', 'Blue'],
        answerIndex: 3,
        explainer: 'Blue Label is the flagship, drawn from a small pool of rare casks.',
      },
      {
        id: 'jw-5',
        prompt: 'Johnnie Walker Green Label is made entirely from what?',
        options: ['Grain whisky', 'Single malts', 'Rye', 'Peated whisky only'],
        answerIndex: 1,
        explainer: 'Green Label is a blended malt — only single malts, no grain whisky.',
      },
    ],
  },
  {
    slug: 'moet-chandon',
    brand: 'Moët & Chandon',
    house: 'Champagne · Épernay',
    category: 'champagne',
    blurb: 'Bubbles, dosage and the méthode champenoise — how the house actually makes it.',
    passScore: 4,
    prizeSlug: 'moet-imperial',
    prizeLabel: 'Moët & Chandon Impérial Brut 75cl',
    questions: [
      {
        id: 'moet-1',
        prompt: 'Where does the second fermentation in champagne take place?',
        options: ['In a steel tank', 'In the bottle', 'In an oak barrel', 'In the press'],
        answerIndex: 1,
        explainer: 'The méthode champenoise runs the second fermentation inside the bottle — that is where the bubbles come from.',
      },
      {
        id: 'moet-2',
        prompt: 'Which three grapes dominate champagne?',
        options: [
          'Chardonnay, Pinot Noir, Pinot Meunier',
          'Merlot, Syrah, Grenache',
          'Riesling, Chenin, Viognier',
          'Ugni Blanc, Colombard, Folle Blanche',
        ],
        answerIndex: 0,
        explainer: 'Chardonnay brings acidity, Pinot Noir body, Pinot Meunier fruit and approachability.',
      },
      {
        id: 'moet-3',
        prompt: 'On a champagne label, “Brut” tells you what?',
        options: ['It is very dry', 'It is sweet', 'It is aged 10 years', 'It is a single vineyard'],
        answerIndex: 0,
        explainer: 'Brut is a dryness level — under 12 grams of residual sugar per litre.',
      },
      {
        id: 'moet-4',
        prompt: 'What does “non-vintage” mean on a champagne?',
        options: [
          'Blended from several harvest years',
          'Made without grapes',
          'Bottled the same year it was picked',
          'Aged under one year',
        ],
        answerIndex: 0,
        explainer: 'Non-vintage blends multiple years so the house style stays consistent bottle to bottle.',
      },
      {
        id: 'moet-5',
        prompt: 'Roughly what serving temperature suits champagne best?',
        options: ['0–2°C', '8–10°C', '16–18°C', 'Room temperature'],
        answerIndex: 1,
        explainer: 'Around 8–10°C. Ice-cold mutes the aromatics; warm flattens the mousse.',
      },
    ],
  },
  {
    slug: 'jameson',
    brand: 'Jameson',
    house: 'Irish whiskey · Midleton',
    category: 'whisky',
    blurb: 'Triple distillation, pot still character, and what separates Irish from Scotch.',
    passScore: 4,
    prizeSlug: 'jameson-original',
    prizeLabel: 'Jameson Original 70cl',
    questions: [
      {
        id: 'jam-1',
        prompt: 'Jameson is famously distilled how many times?',
        options: ['Once', 'Twice', 'Three times', 'Five times'],
        answerIndex: 2,
        explainer: 'Triple distillation is the house signature and gives Jameson its smoother profile.',
      },
      {
        id: 'jam-2',
        prompt: 'Irish whiskey is spelled with an “e”. Scotch is spelled…',
        options: ['Whiskey', 'Whisky', 'Wiskey', 'Whyskie'],
        answerIndex: 1,
        explainer: 'Scotland, Japan and Canada write whisky; Ireland and most of the US write whiskey.',
      },
      {
        id: 'jam-3',
        prompt: 'Single pot still Irish whiskey is made from what mash?',
        options: [
          'Malted and unmalted barley',
          'Corn only',
          'Rye and wheat',
          'Malted barley only',
        ],
        answerIndex: 0,
        explainer: 'The mix of malted and unmalted barley in one pot still gives that creamy, spicy texture.',
      },
      {
        id: 'jam-4',
        prompt: 'Jameson Black Barrel gets its name from what?',
        options: [
          'Double-charred bourbon barrels',
          'Barrels painted black',
          'Barrels from Black Forest oak',
          'A black label',
        ],
        answerIndex: 0,
        explainer: 'The bourbon barrels are charred a second time, pushing vanilla and toasted wood forward.',
      },
      {
        id: 'jam-5',
        prompt: 'Irish whiskey must be matured in Ireland for a minimum of how long?',
        options: ['1 year', '2 years', '3 years', '6 years'],
        answerIndex: 2,
        explainer: 'Three years in wooden casks on the island of Ireland is the legal minimum.',
      },
    ],
  },
];

export function getRound(slug: string): TriviaRound | undefined {
  return TRIVIA_ROUNDS.find((r) => r.slug === slug);
}

export function isPass(round: TriviaRound, score: number): boolean {
  return score >= round.passScore;
}
