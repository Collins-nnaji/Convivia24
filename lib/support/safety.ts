// Crisis-safety net for the Companion chat — runs independently of the AI
// model so a banner with real resources still shows even when Azure OpenAI
// isn't configured, the JSON parse fails, or the model under-calls risk.

export type RiskLevel = 'none' | 'elevated' | 'crisis';

export interface Risk {
  level: RiskLevel;
  reason?: string;
}

/** Explicit self-harm/suicide intent, plan, or means — the regex tripwire. */
export const CRISIS_HINTS = /\b(kill myself|suicide|end my life|want to die|hurt myself|self[- ]?harm|no reason to live)\b/i;

const SEVERITY: Record<RiskLevel, number> = { none: 0, elevated: 1, crisis: 2 };

/** Takes the more severe of two risk levels — used to combine model output with the regex tripwire. */
export function moreSevere(a: RiskLevel, b: RiskLevel): RiskLevel {
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}

/** International/generic — the app has no single target region, so this avoids one hardcoded country hotline. */
export const RESOURCES = {
  headline: "If you're in immediate danger, please contact your local emergency number right now.",
  body: "You don't have to go through this alone. Findahelpline.com lists crisis lines by country, free and confidential, day or night.",
  linkLabel: 'Find a helpline near you',
  linkHref: 'https://findahelpline.com',
};
