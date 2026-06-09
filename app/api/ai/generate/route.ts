import { NextRequest, NextResponse } from 'next/server';
import { chat, aiConfigured } from '@/lib/ai/azure';

/**
 * AI event-copy generator for organizers.
 * body: { title, category, city, venue, vibe }
 * Returns: { tagline, description, lineup_ideas[], ticket_suggestions[], tags[] }
 */
export async function POST(req: NextRequest) {
  try {
    const { title, category, city, venue, vibe } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: 'Give your event a working title first.' }, { status: 400 });

    if (!aiConfigured()) {
      // Graceful fallback so the feature still demos without AI keys.
      return NextResponse.json({
        tagline: `${city || 'The city'}'s next unmissable ${category || 'event'}`,
        description: `${title} is coming to ${venue || city || 'a venue near you'}. ${vibe || 'An unforgettable night'} — expect great energy, great people, and a night you will talk about for weeks. Secure your tickets before they sell out.`,
        lineup_ideas: ['Headline act', 'Special guest', 'Resident DJ'],
        ticket_suggestions: [
          { name: 'Early Bird', note: 'Limited cheap release to build momentum' },
          { name: 'General', note: 'Standard admission' },
          { name: 'VIP', note: 'Premium experience with perks' },
        ],
        tags: [category, city].filter(Boolean),
        fallback: true,
      });
    }

    const system = `You are the marketing copywriter for Convivia24, a premium AI-powered events and ticketing platform for parties and events across Africa and the diaspora. Write punchy, aspirational, modern copy. Respond ONLY with strict JSON.`;
    const user = `Create launch copy for this event.
Title: ${title}
Category: ${category || 'party'}
City: ${city || 'Lagos'}
Venue: ${venue || 'TBA'}
Vibe / notes: ${vibe || 'high energy night out'}

Return JSON with exactly these keys:
{
  "tagline": "a short punchy tagline (max 8 words)",
  "description": "2-3 vivid sentences selling the event to potential attendees",
  "lineup_ideas": ["3-5 suggested acts/segments"],
  "ticket_suggestions": [{"name": "tier name", "note": "what it includes"}],
  "tags": ["4-6 lowercase keyword tags"]
}`;

    const raw = await chat({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.85,
      json: true,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned an unexpected response. Try again.' }, { status: 502 });
    }
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[POST /api/ai/generate]', err);
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 });
  }
}
