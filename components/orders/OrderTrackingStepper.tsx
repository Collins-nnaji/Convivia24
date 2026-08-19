import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';

const PIPELINE: OrderStatus[] = ['paid', 'processing', 'packed', 'out_for_delivery', 'delivered'];

export type TrackingInfo = {
  status: OrderStatus;
  courierName?: string | null;
  riderPhone?: string | null;
  etaAt?: string | null;
  trackingNote?: string | null;
};

function formatEta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-NG', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function OrderTrackingStepper({ status, courierName, riderPhone, etaAt, trackingNote }: TrackingInfo) {
  if (status === 'cancelled' || status === 'refunded') {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="w-2 h-2 rounded-full bg-obsidian/30" />
        <p className="text-xs text-obsidian/50">
          {status === 'cancelled' ? 'This order was cancelled.' : 'This order was refunded.'}
        </p>
      </div>
    );
  }

  // 'fulfilled' is a legacy alias for 'delivered'.
  const effective = status === 'fulfilled' ? 'delivered' : status;
  const activeIndex = PIPELINE.indexOf(effective);
  const stepIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className="py-1">
      <div className="flex items-center">
        {PIPELINE.map((step, i) => {
          const done = i <= stepIndex;
          const isLast = i === PIPELINE.length - 1;
          return (
            <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
              <div className="flex flex-col items-center shrink-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-ember' : 'bg-obsidian/15'}`}
                  aria-hidden
                />
                <span
                  className={`mt-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-center leading-tight max-w-[4.5rem] ${
                    done ? 'text-obsidian/70' : 'text-obsidian/30'
                  }`}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </div>
              {!isLast && <div className={`h-0.5 flex-1 -mt-4 ${i < stepIndex ? 'bg-ember' : 'bg-obsidian/10'}`} />}
            </div>
          );
        })}
      </div>

      {(courierName || etaAt || trackingNote) && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-obsidian/55 border-t border-obsidian/8 pt-3">
          {courierName && (
            <span>
              Rider <span className="font-medium text-obsidian">{courierName}</span>
              {riderPhone ? ` · ${riderPhone}` : ''}
            </span>
          )}
          {etaAt && <span>ETA <span className="font-medium text-obsidian">{formatEta(etaAt)}</span></span>}
          {trackingNote && <span className="w-full">{trackingNote}</span>}
        </div>
      )}
    </div>
  );
}
