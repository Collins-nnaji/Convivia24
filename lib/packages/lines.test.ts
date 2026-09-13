import { describe, expect, it } from 'vitest';
import { EVENT_PACKAGES } from './catalog';
import { expandPackLines } from './lines';

describe('expandPackLines', () => {
  const pkg = EVENT_PACKAGES[0];

  it('replaces a pack with its bottles, multiplied by the pack quantity', () => {
    const out = expandPackLines([{ slug: pkg.slug, qty: 2 }]);
    expect(out.find((l) => l.slug === pkg.slug)).toBeUndefined();
    for (const c of pkg.components) expect(out.find((l) => l.slug === c.slug)?.qty).toBe(c.qty * 2);
  });

  it('merges a bottle bought on its own with the same bottle inside a pack', () => {
    const c = pkg.components[0];
    const out = expandPackLines([{ slug: pkg.slug, qty: 1 }, { slug: c.slug, qty: 3 }]);
    expect(out.find((l) => l.slug === c.slug)?.qty).toBe(c.qty + 3);
  });

  it('leaves plain bottles alone', () => {
    expect(expandPackLines([{ slug: 'hennessy-vs', qty: 1 }])).toEqual([{ slug: 'hennessy-vs', qty: 1 }]);
  });
});
