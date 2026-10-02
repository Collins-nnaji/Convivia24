import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminNotifyEmail, sendEmail } from './resend';

const originalAdmins = process.env.CONVIVIA_ADMIN_EMAILS;
const originalNotify = process.env.ADMIN_NOTIFY_EMAIL;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  if (originalAdmins === undefined) delete process.env.CONVIVIA_ADMIN_EMAILS;
  else process.env.CONVIVIA_ADMIN_EMAILS = originalAdmins;
  if (originalNotify === undefined) delete process.env.ADMIN_NOTIFY_EMAIL;
  else process.env.ADMIN_NOTIFY_EMAIL = originalNotify;
});

describe('adminNotifyEmail', () => {
  it('includes admin accounts in the notification recipients', () => {
    process.env.CONVIVIA_ADMIN_EMAILS = 'owner@example.com, collinsenofe@gmail.com';
    delete process.env.ADMIN_NOTIFY_EMAIL;
    expect(adminNotifyEmail()).toEqual(['owner@example.com', 'collinsenofe@gmail.com', 'bobbynathus@yahoo.com']);
  });

  it('combines, normalises and deduplicates both recipient lists', () => {
    process.env.CONVIVIA_ADMIN_EMAILS = 'OWNER@example.com; collinsenofe\\@gmail.com';
    process.env.ADMIN_NOTIFY_EMAIL = 'owner@example.com extra@example.com';
    expect(adminNotifyEmail()).toEqual([
      'owner@example.com',
      'collinsenofe@gmail.com',
      'bobbynathus@yahoo.com',
      'extra@example.com',
    ]);
  });
});


describe('grouped admin delivery', () => {
  it('includes both required accounts even when deployment lists omit them', () => {
    process.env.CONVIVIA_ADMIN_EMAILS = '';
    process.env.ADMIN_NOTIFY_EMAIL = '';
    expect(adminNotifyEmail()).toEqual(['bobbynathus@yahoo.com', 'collinsenofe@gmail.com']);
  });

  it('sends one provider request addressed to every admin and notification recipient', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('RESEND_FROM', 'test@example.com');
    process.env.CONVIVIA_ADMIN_EMAILS = 'owner@example.com';
    process.env.ADMIN_NOTIFY_EMAIL = 'notify@example.com,owner@example.com';
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'mail-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    expect(await sendEmail({ to: adminNotifyEmail()!, subject: 'Admin notification', html: '<p>New order</p>' })).toEqual({ sent: true, id: 'mail-id' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).to).toEqual([
      'owner@example.com', 'bobbynathus@yahoo.com', 'collinsenofe@gmail.com', 'notify@example.com',
    ]);
  });
});
