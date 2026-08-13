/**
 * Bill maths.
 *
 * Convivia24 never touches money. It answers one question, before the table
 * even sits down: *what is this evening going to cost me?* Every line on the
 * order belongs to one or more people, and each person carries their share of
 * that line plus their share of service and VAT.
 */

import { getMenuItem, type Venue } from '@/lib/dining/venues';

export interface Attendee {
  id: string;
  name: string;
  /** What this person is willing to spend tonight. Optional, in naira. */
  budget?: number;
}

export interface OrderLine {
  id: string;
  itemId: string;
  qty: number;
  /** Attendee ids carrying this line. One id = a personal plate; many = shared. */
  payerIds: string[];
}

export interface PersonTotal {
  attendeeId: string;
  name: string;
  /** Items only, before service and tax. */
  subtotal: number;
  service: number;
  vat: number;
  tip: number;
  total: number;
  budget?: number;
  /** Positive = headroom left, negative = over budget. Undefined without a budget. */
  remaining?: number;
  overBudget: boolean;
  lines: PersonLine[];
}

export interface PersonLine {
  lineId: string;
  name: string;
  qty: number;
  /** What this person carries of the line, after sharing. */
  share: number;
  sharedWith: number;
}

export interface BillSummary {
  people: PersonTotal[];
  subtotal: number;
  service: number;
  vat: number;
  tip: number;
  total: number;
  /** Total ÷ heads — what an even split would have cost. */
  evenSplit: number;
  /** Lines whose item is no longer on the venue's menu. */
  orphanedLines: string[];
}

export interface ComputeOptions {
  /** Percentage of subtotal added as a tip on top of service charge. */
  tipPct?: number;
}

/** Round to whole naira — nobody settles kobo at a table. */
const naira = (n: number) => Math.round(n);

export function computeBill(
  venue: Venue,
  attendees: Attendee[],
  lines: OrderLine[],
  options: ComputeOptions = {},
): BillSummary {
  const tipPct = options.tipPct ?? 0;
  const servicePct = venue.serviceChargePct / 100;
  const vatPct = venue.vatPct / 100;
  const orphanedLines: string[] = [];

  const byPerson = new Map<string, PersonLine[]>();
  const subtotals = new Map<string, number>();
  for (const a of attendees) {
    byPerson.set(a.id, []);
    subtotals.set(a.id, 0);
  }

  for (const line of lines) {
    const item = getMenuItem(venue, line.itemId);
    if (!item) {
      orphanedLines.push(line.id);
      continue;
    }
    // A line with no payers left (someone was removed) falls to the whole table.
    const payers = line.payerIds.filter((id) => subtotals.has(id));
    const carriers = payers.length > 0 ? payers : attendees.map((a) => a.id);
    if (carriers.length === 0) continue;

    const lineTotal = item.price * line.qty;
    const share = lineTotal / carriers.length;

    for (const id of carriers) {
      subtotals.set(id, (subtotals.get(id) ?? 0) + share);
      byPerson.get(id)!.push({
        lineId: line.id,
        name: item.name,
        qty: line.qty,
        share,
        sharedWith: carriers.length,
      });
    }
  }

  const people: PersonTotal[] = attendees.map((a) => {
    const subtotal = subtotals.get(a.id) ?? 0;
    const service = subtotal * servicePct;
    // VAT in Nigeria applies to the service charge as well as the food.
    const vat = (subtotal + service) * vatPct;
    const tip = subtotal * (tipPct / 100);
    const total = subtotal + service + vat + tip;
    const remaining = a.budget != null ? a.budget - total : undefined;

    return {
      attendeeId: a.id,
      name: a.name,
      subtotal: naira(subtotal),
      service: naira(service),
      vat: naira(vat),
      tip: naira(tip),
      total: naira(total),
      budget: a.budget,
      remaining: remaining != null ? naira(remaining) : undefined,
      overBudget: remaining != null && remaining < 0,
      lines: byPerson.get(a.id) ?? [],
    };
  });

  const sum = (pick: (p: PersonTotal) => number) => people.reduce((acc, p) => acc + pick(p), 0);
  const total = sum((p) => p.total);

  return {
    people,
    subtotal: sum((p) => p.subtotal),
    service: sum((p) => p.service),
    vat: sum((p) => p.vat),
    tip: sum((p) => p.tip),
    total,
    evenSplit: people.length ? naira(total / people.length) : 0,
    orphanedLines,
  };
}

/**
 * What the evening costs before anyone has ordered — the number people
 * actually want when deciding whether to come out.
 */
export function estimatePerHead(venue: Venue, tipPct = 0): number {
  const base = venue.typicalPerHead;
  const service = base * (venue.serviceChargePct / 100);
  const vat = (base + service) * (venue.vatPct / 100);
  return naira(base + service + vat + base * (tipPct / 100));
}
