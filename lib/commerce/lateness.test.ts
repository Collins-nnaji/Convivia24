import { describe, expect, it } from 'vitest';
import { lateness } from './lateness';

const now = Date.parse('2026-11-16T12:00:00Z');
const at = (minsAgo: number) => new Date(now - minsAgo * 60000).toISOString();

describe('lateness', () => {
  it('flags a paid order nobody has started after an hour', () => {
    expect(lateness({ status: 'paid', updatedAt: at(45), createdAt: at(45) }, now).late).toBe(false);
    const late = lateness({ status: 'paid', updatedAt: at(130), createdAt: at(130) }, now);
    expect(late.late).toBe(true);
    expect(late.label).toBe('Waiting 2h');
  });

  it('flags a delivery 30 minutes past its promised arrival', () => {
    const r = lateness({ status: 'out_for_delivery', updatedAt: at(40), createdAt: at(200), etaAt: at(35) }, now);
    expect(r.late).toBe(true);
    expect(r.label).toBe('35m past ETA');
  });

  it('never flags finished orders', () => {
    expect(lateness({ status: 'delivered', updatedAt: at(9999), createdAt: at(9999) }, now).late).toBe(false);
  });
});
