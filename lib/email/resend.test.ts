import { afterEach, describe, expect, it } from 'vitest';
import { adminNotifyEmail } from './resend';

const originalAdmins = process.env.CONVIVIA_ADMIN_EMAILS;
const originalNotify = process.env.ADMIN_NOTIFY_EMAIL;

afterEach(() => {
  if (originalAdmins === undefined) delete process.env.CONVIVIA_ADMIN_EMAILS;
  else process.env.CONVIVIA_ADMIN_EMAILS = originalAdmins;
  if (originalNotify === undefined) delete process.env.ADMIN_NOTIFY_EMAIL;
  else process.env.ADMIN_NOTIFY_EMAIL = originalNotify;
});

describe('adminNotifyEmail', () => {
  it('includes admin accounts in the notification recipients', () => {
    process.env.CONVIVIA_ADMIN_EMAILS = 'owner@example.com, collinsenofe@gmail.com';
    delete process.env.ADMIN_NOTIFY_EMAIL;
    expect(adminNotifyEmail()).toEqual(['owner@example.com', 'collinsenofe@gmail.com']);
  });

  it('combines, normalises and deduplicates both recipient lists', () => {
    process.env.CONVIVIA_ADMIN_EMAILS = 'OWNER@example.com; collinsenofe\\@gmail.com';
    process.env.ADMIN_NOTIFY_EMAIL = 'owner@example.com extra@example.com';
    expect(adminNotifyEmail()).toEqual([
      'owner@example.com',
      'collinsenofe@gmail.com',
      'extra@example.com',
    ]);
  });
});
