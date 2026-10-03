/** Legacy business ledgers can have richer details; redact credential fields on output. */
export function auditDetail(value: unknown, depth = 0): unknown {
  if (depth > 8) return '[truncated]';
  if (Array.isArray(value)) return value.slice(0, 100).map(item => auditDetail(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
      /password|secret|token|cookie|authorization|api.?key|access.?key/i.test(key) ? '[redacted]' : auditDetail(item, depth + 1),
    ]));
  }
  return typeof value === 'string' ? value.slice(0, 3000) : value;
}
