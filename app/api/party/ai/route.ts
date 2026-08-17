import { NextRequest, NextResponse } from 'next/server';
import { chat, aiConfigured } from '@/lib/ai/azure';
import { recommendDrinks, type PartyVibe } from '@/lib/party/drinks-plan';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { formatNgn } from '@/lib/drinks/catalog';

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`party-ai:${clientIp(req)}`, 12, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const guests = Number(body.guests) || 40;
    const hours = Number(body.hours) || 5;
    const vibe = (body.vibe || 'balanced') as PartyVibe;
    const budgetNgn = body.budgetNgn ? Number(body.budgetNgn) : undefined;
    const question = String(body.question || '').trim().slice(0, 500);
    const occasion = String(body.occasion || '').trim().slice(0, 60);

    const plan = recommendDrinks({ guests, hours, vibe, budgetNgn });
    const planText = plan.lines
      .map((l) => `${l.qty}× ${l.name} (${formatNgn(l.priceNgn * l.qty)}) — ${l.reason}`)
      .join('\n');

    if (!aiConfigured()) {
      return NextResponse.json({
        plan,
        advice: `For ${guests} guests over ~${hours}h${occasion ? ` (${occasion})` : ''}: aim for about ${plan.drinksPerGuest} pours each. This basket totals ${formatNgn(plan.totalNgn)}.`,
        ai: false,
      });
    }

    const advice = await chat({
      messages: [
        {
          role: 'system',
          content:
            'You are the Convivia24 party planner for Lagos. Be practical, concise, and nightlife-aware. Recommend drinks, quantities and hosting tips for the occasion. Never encourage underage or excessive drinking.',
        },
        {
          role: 'user',
          content: `Party: ${guests} guests, ${hours} hours, vibe=${vibe}${occasion ? `, occasion=${occasion}` : ''}${budgetNgn ? `, budget ${budgetNgn}` : ''}.\nSuggested basket:\n${planText}\n\n${question || 'Give a short hosting plan and any tweaks to the basket.'}`,
        },
      ],
      temperature: 0.6,
      maxTokens: 550,
    });

    return NextResponse.json({ plan, advice, ai: true });
  } catch (err) {
    captureApiError(err, { route: 'party/ai' });
    return NextResponse.json({ error: 'Planner unavailable right now.' }, { status: 500 });
  }
}
