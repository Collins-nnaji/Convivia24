'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

export const adminInputClass =
  'w-full rounded-lg border border-obsidian/12 bg-white px-3 py-2.5 text-sm text-obsidian placeholder:text-obsidian/30 focus:border-ember focus:ring-0 disabled:bg-obsidian/[0.03] disabled:text-obsidian/40';

export function AdminLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">{children}</span>
      {hint && <span className="text-[11px] font-normal normal-case tracking-normal text-obsidian/35">{hint}</span>}
    </span>
  );
}

export function AdminField({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <AdminLabel hint={hint}>{label}</AdminLabel>
      {children}
    </label>
  );
}

export type SelectOption = { value: string; label: string };

/**
 * Every field whose valid values we already know renders as this, not a free-text box — it removes
 * a whole class of typo that used to reach the database (statuses, categories, tags, couriers).
 */
export function AdminSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  disabled,
  className = '',
  allowCustom,
  customLabel = 'Other…',
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  /** Adds an "Other…" entry so a rare unlisted value is still reachable. */
  allowCustom?: boolean;
  customLabel?: string;
}) {
  const opts: SelectOption[] = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  // A value loaded from the database that is not in the list must still display.
  const unlisted = value && !opts.some((o) => o.value === value);

  const control = (
    <span className="relative block">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${adminInputClass} appearance-none pr-9 ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {unlisted && <option value={value}>{value}</option>}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {allowCustom && <option value="__custom">{customLabel}</option>}
      </select>
      <ChevronDown
        size={15}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-obsidian/40"
      />
    </span>
  );

  if (!label) return control;
  return (
    <label className="block">
      <AdminLabel hint={hint}>{label}</AdminLabel>
      {control}
    </label>
  );
}

export function AdminInput({
  label,
  hint,
  className = '',
  ...props
}: { label?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const control = <input {...props} className={`${adminInputClass} ${className}`} />;
  if (!label) return control;
  return (
    <label className="block">
      <AdminLabel hint={hint}>{label}</AdminLabel>
      {control}
    </label>
  );
}

export function AdminTextArea({
  label,
  hint,
  className = '',
  ...props
}: { label?: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const control = <textarea {...props} className={`${adminInputClass} min-h-[90px] resize-y ${className}`} />;
  if (!label) return control;
  return (
    <label className="block">
      <AdminLabel hint={hint}>{label}</AdminLabel>
      {control}
    </label>
  );
}
