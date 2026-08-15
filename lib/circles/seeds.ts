export type CircleVibe =
  | 'beach'
  | 'rooftop'
  | 'trail'
  | 'afterparty'
  | 'day-party'
  | 'lounge';

export type CirclePost = {
  id: string;
  author: string;
  place: string;
  area: string;
  vibe: CircleVibe[];
  body: string;
  image: string;
  meetupAt: string;
  likes: number;
  circleName: string;
};

export const VIBE_LABELS: Record<CircleVibe, string> = {
  beach: 'Beach',
  rooftop: 'Rooftop',
  trail: 'Trail',
  afterparty: 'Afterparty',
  'day-party': 'Day party',
  lounge: 'Lounge',
};

export const CIRCLE_POSTS: CirclePost[] = [
  {
    id: 'c1',
    author: 'Tolu',
    place: 'Elegushi stretch',
    area: 'Lekki',
    vibe: ['beach', 'afterparty'],
    body: 'Sunset pours → club drop. Bring mixers; we’ll order the bottles as a Crew.',
    image: '/The Spaces.png',
    meetupAt: 'Sat 5:30pm',
    likes: 24,
    circleName: 'Lekki Outdoor',
  },
  {
    id: 'c2',
    author: 'Amaka',
    place: 'Rooftop · Admiralty',
    area: 'Lekki Phase 1',
    vibe: ['rooftop', 'day-party'],
    body: 'Like-minded outdoor people only — soft music until 8, then we move.',
    image: '/Homepage2.png',
    meetupAt: 'Sun 3pm',
    likes: 41,
    circleName: 'Altitude Crew',
  },
  {
    id: 'c3',
    author: 'Kemi',
    place: 'Trail → VI lounge',
    area: 'Ikoyi → VI',
    vibe: ['trail', 'lounge'],
    body: 'Morning hike, evening Cognac. Join the Circle if you finish what you start.',
    image: '/Convivium.png',
    meetupAt: 'Sat 7am / 8pm',
    likes: 18,
    circleName: 'Trail to Toast',
  },
  {
    id: 'c4',
    author: 'Chidi',
    place: 'Private terrace',
    area: 'Yaba',
    vibe: ['day-party', 'afterparty'],
    body: 'Grill out, then Party Pack · 20. Host locks the cart at 6.',
    image: '/dealrooms.png',
    meetupAt: 'Fri 4pm',
    likes: 33,
    circleName: 'Mainland Moves',
  },
  {
    id: 'c5',
    author: 'Zainab',
    place: 'Beach club daybed',
    area: 'Oniru',
    vibe: ['beach', 'lounge'],
    body: 'Zero-proof welcome — spirits optional. Outdoor people who don’t gatekeep vibes.',
    image: '/The Spaces2.png',
    meetupAt: 'Sat 1pm',
    likes: 52,
    circleName: 'Salt & Soft',
  },
];

export const CIRCLES = [
  {
    id: 'lekki-outdoor',
    name: 'Lekki Outdoor',
    members: 128,
    blurb: 'Beach hangs, rooftops, and the afterparty in between.',
  },
  {
    id: 'altitude',
    name: 'Altitude Crew',
    members: 86,
    blurb: 'High places, low drama. Day parties that stay classy.',
  },
  {
    id: 'trail-toast',
    name: 'Trail to Toast',
    members: 64,
    blurb: 'Move your body, then pour with intention.',
  },
  {
    id: 'mainland',
    name: 'Mainland Moves',
    members: 97,
    blurb: 'Yaba to Ikeja outdoor energy — always a Crew cart open.',
  },
];
