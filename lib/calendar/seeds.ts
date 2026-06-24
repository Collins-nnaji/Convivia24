// Seeded suggestion activities — gentle, colour-coded ideas the app offers so
// a day is never blank. Deterministic per weekday so they don't reshuffle.

export interface DaySeed {
  title: string;
  priority: 'low' | 'normal' | 'high';
  time: string; // HH:MM
}

const SEED_BY_WEEKDAY: Record<number, DaySeed[]> = {
  0: [ // Sunday
    { title: 'Slow morning, no screens', priority: 'low', time: '09:30' },
    { title: 'A walk to reset', priority: 'normal', time: '12:00' },
    { title: 'Call someone you love', priority: 'normal', time: '17:00' },
  ],
  1: [ // Monday
    { title: 'Plan the week ahead', priority: 'high', time: '08:30' },
    { title: 'Deep work block', priority: 'high', time: '10:00' },
    { title: 'Evening wind-down', priority: 'low', time: '20:30' },
  ],
  2: [ // Tuesday
    { title: 'Morning movement', priority: 'normal', time: '07:30' },
    { title: 'Focused execution', priority: 'high', time: '14:00' },
    { title: 'Read before bed', priority: 'low', time: '21:30' },
  ],
  3: [ // Wednesday
    { title: 'Tackle the hard thing first', priority: 'high', time: '09:00' },
    { title: 'Team catch-up', priority: 'normal', time: '11:00' },
    { title: 'Midweek reset walk', priority: 'low', time: '18:00' },
  ],
  4: [ // Thursday
    { title: 'Clear the backlog', priority: 'high', time: '10:00' },
    { title: 'Lunch away from the desk', priority: 'normal', time: '13:00' },
    { title: 'Something creative', priority: 'low', time: '20:00' },
  ],
  5: [ // Friday
    { title: 'Wrap up the week', priority: 'high', time: '10:00' },
    { title: 'Tidy loose ends', priority: 'normal', time: '15:00' },
    { title: 'Dinner with friends', priority: 'normal', time: '19:30' },
  ],
  6: [ // Saturday
    { title: 'Lie-in & a proper breakfast', priority: 'low', time: '10:00' },
    { title: 'Time outdoors', priority: 'normal', time: '13:00' },
    { title: 'Something just for you', priority: 'normal', time: '16:00' },
  ],
};

export function seedsForDay(d: Date): DaySeed[] {
  return SEED_BY_WEEKDAY[d.getDay()] ?? [];
}

/** Turn a seed into a concrete start/end on a given day (60-minute block). */
export function seedToTimes(d: Date, seed: DaySeed): { starts_at: string; ends_at: string } {
  const [h, m] = seed.time.split(':').map(Number);
  const start = new Date(d);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + 60 * 60000);
  return { starts_at: start.toISOString(), ends_at: end.toISOString() };
}
