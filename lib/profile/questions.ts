// The onboarding questionnaire — multiple-choice questions whose answers shape
// how the companion plans. Shared by the client flow and the server so the two
// never drift. Each answer is also mirrored into companion_memory as a fact.

/** Map of questionId → selected option value(s). */
export type ProfileData = Record<string, string[]>;

export interface OnboardingOption {
  value: string;
  label: string;
  /** lucide-react icon name, resolved on the client. */
  icon?: string;
}

export interface OnboardingQuestion {
  id: string;
  /** Short label stored as the companion memory key. */
  memoryKey: string;
  title: string;
  subtitle?: string;
  multi?: boolean;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'ideal_day',
    memoryKey: 'ideal_day_feeling',
    title: 'What does a great day feel like to you?',
    subtitle: 'So I can shape your days toward it.',
    options: [
      { value: 'calm', label: 'Calm & unhurried', icon: 'Waves' },
      { value: 'productive', label: 'Productive & focused', icon: 'Target' },
      { value: 'balanced', label: 'Balanced', icon: 'Scale' },
      { value: 'social', label: 'Full of people', icon: 'Users' },
      { value: 'adventurous', label: 'Spontaneous', icon: 'Compass' },
    ],
  },
  {
    id: 'peak_energy',
    memoryKey: 'peak_energy_time',
    title: 'When are you at your sharpest?',
    subtitle: "I'll protect that window for what matters.",
    options: [
      { value: 'early_morning', label: 'Early morning', icon: 'Sunrise' },
      { value: 'morning', label: 'Mid-morning', icon: 'Sun' },
      { value: 'afternoon', label: 'Afternoon', icon: 'CloudSun' },
      { value: 'evening', label: 'Evening', icon: 'Sunset' },
      { value: 'night', label: 'Late night', icon: 'Moon' },
    ],
  },
  {
    id: 'stressor',
    memoryKey: 'main_stressor',
    title: 'What stresses you most?',
    subtitle: "I'll help you guard against it.",
    options: [
      { value: 'overcommitment', label: 'Too much on my plate', icon: 'Layers' },
      { value: 'no_routine', label: 'No real routine', icon: 'Shuffle' },
      { value: 'deadlines', label: 'Deadlines & pressure', icon: 'AlarmClock' },
      { value: 'no_me_time', label: 'No time for myself', icon: 'HeartCrack' },
      { value: 'saying_yes', label: 'Saying yes too often', icon: 'MessageSquareWarning' },
    ],
  },
  {
    id: 'priorities',
    memoryKey: 'current_priorities',
    title: "What matters most right now?",
    subtitle: 'Pick all that feel true.',
    multi: true,
    options: [
      { value: 'career', label: 'Work & career', icon: 'Briefcase' },
      { value: 'health', label: 'Health & fitness', icon: 'Dumbbell' },
      { value: 'relationships', label: 'Relationships', icon: 'Heart' },
      { value: 'rest', label: 'Rest & recovery', icon: 'BedDouble' },
      { value: 'growth', label: 'Personal growth', icon: 'Sprout' },
      { value: 'money', label: 'Money & stability', icon: 'PiggyBank' },
    ],
  },
  {
    id: 'recharge',
    memoryKey: 'how_i_recharge',
    title: 'How do you recharge?',
    multi: true,
    options: [
      { value: 'alone', label: 'Quiet alone time', icon: 'Coffee' },
      { value: 'people', label: 'Friends & family', icon: 'Users' },
      { value: 'outdoors', label: 'Being outdoors', icon: 'Trees' },
      { value: 'exercise', label: 'Moving my body', icon: 'Activity' },
      { value: 'creative', label: 'Something creative', icon: 'Palette' },
    ],
  },
  {
    id: 'week_load',
    memoryKey: 'typical_week_load',
    title: 'How full is a typical week?',
    options: [
      { value: 'packed', label: 'Packed — barely a gap', icon: 'CalendarX' },
      { value: 'busy', label: 'Busy but managing', icon: 'CalendarClock' },
      { value: 'moderate', label: 'Moderate', icon: 'CalendarDays' },
      { value: 'light', label: 'Pretty light', icon: 'CalendarCheck' },
    ],
  },
  {
    id: 'downtime',
    memoryKey: 'downtime_preference',
    title: 'When do you most want protected downtime?',
    subtitle: "I'll keep it sacred on your calendar.",
    options: [
      { value: 'mornings', label: 'Slow mornings', icon: 'Sunrise' },
      { value: 'evenings', label: 'Evenings off', icon: 'Sunset' },
      { value: 'daily_breaks', label: 'Breaks through the day', icon: 'Pause' },
      { value: 'weekends', label: 'Weekends', icon: 'Tent' },
    ],
  },
];

/** A readable sentence for a single answer — used to build companion memory. */
export function describeAnswer(q: OnboardingQuestion, values: string[]): string {
  const labels = values
    .map((v) => q.options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);
  return labels.join(', ');
}
