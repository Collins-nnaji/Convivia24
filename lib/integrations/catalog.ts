export type IntegrationCategory = 'calendar' | 'maps' | 'comms' | 'email' | 'payments';
export type IntegrationStatus = 'connected' | 'ready' | 'beta' | 'coming_soon';

export interface IntegrationDef {
  id: string;
  name: string;
  tagline: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  icon: 'calendar' | 'mail' | 'message' | 'map' | 'credit' | 'smartphone';
  benefits: string[];
  envKeys?: string[];
  connectLabel?: string;
}

export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    tagline: 'Sync bookings to your calendar',
    category: 'calendar',
    status: 'ready',
    icon: 'calendar',
    benefits: ['One-tap add from any event', 'Upcoming bookings on My calendar', 'Organiser run-of-show view'],
    connectLabel: 'Use add-to-calendar links',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    tagline: 'Ticket receipts & guest updates',
    category: 'email',
    status: 'beta',
    icon: 'mail',
    benefits: ['Compose guest updates in Gmail', 'Booking confirmations (coming)', 'Post-event follow-ups'],
    envKeys: ['RESEND_API_KEY', 'SENDGRID_API_KEY'],
    connectLabel: 'Connect email provider',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    tagline: 'Share tickets & reach guests',
    category: 'comms',
    status: 'ready',
    icon: 'message',
    benefits: ['Share tickets with friends', 'Broadcast reminders to guests', 'Door list check-in alerts'],
    envKeys: ['WHATSAPP_BUSINESS_TOKEN'],
    connectLabel: 'Share via WhatsApp',
  },
  {
    id: 'google_maps',
    name: 'Google Maps',
    tagline: 'Directions to every venue',
    category: 'maps',
    status: 'ready',
    icon: 'map',
    benefits: ['Open venue in Maps from event page', 'Ride-share friendly deep links', 'Multi-stop run sheets (soon)'],
    connectLabel: 'Open in Maps',
  },
  {
    id: 'apple_calendar',
    name: 'Apple Calendar',
    tagline: 'Download .ics for any booking',
    category: 'calendar',
    status: 'ready',
    icon: 'smartphone',
    benefits: ['Works with iPhone & Mac Calendar', 'Offline ticket reminders', 'No account required'],
    connectLabel: 'Download .ics file',
  },
  {
    id: 'paystack',
    name: 'Paystack',
    tagline: 'Collect payments in NGN',
    category: 'payments',
    status: 'beta',
    icon: 'credit',
    benefits: ['Card & bank transfer checkout', 'Webhook-driven ticket fulfilment', 'Organiser payout reports'],
    envKeys: ['PAYSTACK_SECRET_KEY', 'PAYMENT_PROVIDER'],
    connectLabel: 'Configure Paystack',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    tagline: 'Global card payments',
    category: 'payments',
    status: 'beta',
    icon: 'credit',
    benefits: ['GBP, USD, EUR checkout', 'Refunds & disputes', 'Connect payouts for co-hosts'],
    envKeys: ['STRIPE_SECRET_KEY', 'PAYMENT_PROVIDER'],
    connectLabel: 'Configure Stripe',
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    tagline: 'Microsoft 365 calendar sync',
    category: 'calendar',
    status: 'coming_soon',
    icon: 'calendar',
    benefits: ['Two-way sync for organisers', 'Teams meeting links', 'Shared organiser calendars'],
    connectLabel: 'Coming soon',
  },
];

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  calendar: 'Calendar',
  maps: 'Maps & venues',
  comms: 'Messaging',
  email: 'Email',
  payments: 'Payments',
};

export function integrationStatusFromEnv(id: string): IntegrationStatus {
  switch (id) {
    case 'paystack':
      return process.env.PAYSTACK_SECRET_KEY ? 'connected' : 'beta';
    case 'stripe':
      return process.env.STRIPE_SECRET_KEY ? 'connected' : 'beta';
    case 'gmail':
      return process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY ? 'connected' : 'beta';
    case 'whatsapp':
      return process.env.WHATSAPP_BUSINESS_TOKEN ? 'connected' : 'ready';
    default:
      return 'ready';
  }
}
