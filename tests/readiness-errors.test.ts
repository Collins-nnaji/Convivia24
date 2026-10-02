import { describe, expect, it } from 'vitest';
import { readinessFailureMessage } from '@/lib/launch-readiness';

describe('readiness error diagnosis', () => {
  it.each(['42P01', '42703', '42883'])('identifies missing schema for %s', code => {
    expect(readinessFailureMessage({ code })).toContain('npm run db:migrate');
    expect(readinessFailureMessage({ code })).toContain('DATABASE_URL used by this deployment');
  });
  it('identifies insufficient permissions without recommending migrations', () => {
    expect(readinessFailureMessage({ code: '42501' })).toContain('permissions');
    expect(readinessFailureMessage({ code: '42501' })).not.toContain('db:migrate');
  });
  it('does not mistake connection failures for missing migrations or expose secrets', () => {
    const message = readinessFailureMessage(new Error('fetch failed: postgres://secret'));
    expect(message).toContain('server logs');
    expect(message).not.toContain('db:migrate');
    expect(message).not.toContain('secret');
  });
});
