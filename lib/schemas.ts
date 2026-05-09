import { z } from 'zod';
import { PAYOUT_PROVIDERS } from '@/lib/staffing';

/** Extract the first human-readable message from a Zod 4 parse error. */
export function zodFirstError(err: z.ZodError): string {
  try {
    const issues = JSON.parse(err.message) as { message?: string }[];
    return issues[0]?.message || 'Invalid input.';
  } catch {
    return 'Invalid input.';
  }
}

export const ShiftApplySchema = z.object({
  payout_provider: z.enum(PAYOUT_PROVIDERS),
  payout_phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone too long')
    .regex(/^\d+$/, 'Phone must be digits only'),
  note: z.string().max(300, 'Note too long').optional(),
});

export const ShiftPostSchema = z.object({
  title: z.string().min(3, 'Title required').max(120),
  location: z.string().min(2, 'Location required').max(200),
  city: z.string().min(2).max(60),
  area: z.string().max(60).optional(),
  event_time: z.string().datetime({ offset: true }),
  max_guests: z.number().int().min(1).max(500),
  ticket_price: z.number().int().min(0).max(10_000_000).optional(),
  dress_code: z.string().max(200).optional(),
  brief: z.string().max(1000).optional(),
});

export const ProfilePatchSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  open_to_meet: z.boolean().optional(),
  watchlist_cities: z.array(z.string().max(60)).max(20).optional(),
  certifications: z.array(z.string().max(80)).max(30).optional(),
});

export const InquirySchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  email: z.string().email('Valid email required'),
  company: z.string().max(100).optional(),
  inquiry_type: z.string().min(1).max(60),
  message: z.string().min(1, 'Message required').max(2000),
});

export const WaitlistSchema = z.object({
  email: z.string().email('Valid email required'),
  company: z.string().max(100).optional(),
  name: z.string().max(100).optional(),
});
