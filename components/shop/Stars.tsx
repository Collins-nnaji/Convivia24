import { Star } from 'lucide-react';

/** Star row. Half-stars are drawn by clipping a filled star over an empty one. */
export default function Stars({
  value,
  size = 14,
  className = '',
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-obsidian/15" fill="currentColor" />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star size={size} className="text-amber-400" fill="currentColor" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
