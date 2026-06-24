import type { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center text-center px-8 py-14">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-copper/10 text-copper">
        <Icon size={26} strokeWidth={1.75} />
      </span>
      <h3 className="font-display text-xl italic text-ink mb-2">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm leading-relaxed">{description}</p>}
      {actionLabel && actionHref && (
        <Button href={actionHref} className="mt-6">{actionLabel}</Button>
      )}
      {actionLabel && onAction && !actionHref && (
        <button type="button" onClick={onAction} className="btn-primary mt-6">{actionLabel}</button>
      )}
    </div>
  );
}
