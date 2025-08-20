import React from 'react';

const CATEGORY_STYLES = {
  champagne: { from: '#FDE68A', to: '#F59E0B', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.35)]' },
  wine: { from: '#7F1D1D', to: '#B91C1C', glow: 'shadow-[0_0_30px_rgba(185,28,28,0.35)]' },
  spirits: { from: '#0EA5E9', to: '#0369A1', glow: 'shadow-[0_0_30px_rgba(14,165,233,0.35)]' },
  tequila: { from: '#D97706', to: '#A16207', glow: 'shadow-[0_0_30px_rgba(217,119,6,0.35)]' },
  gin: { from: '#059669', to: '#065F46', glow: 'shadow-[0_0_30px_rgba(5,150,105,0.35)]' },
  vodka: { from: '#60A5FA', to: '#1D4ED8', glow: 'shadow-[0_0_30px_rgba(96,165,250,0.35)]' },
  default: { from: '#9CA3AF', to: '#4B5563', glow: 'shadow-[0_0_30px_rgba(156,163,175,0.35)]' }
};

const BottlePlaceholder = ({ 
  category = 'default', 
  tier = 'mainstream', 
  size = 128,
  className = ''
}) => {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
  const isPremium = tier === 'premium';

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 1.6 }}
    >
      {/* Glow */}
      <div className={`absolute inset-0 blur-xl ${isPremium ? style.glow : ''}`} />

      {/* Bottle */}
      <svg
        viewBox="0 0 128 220"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-sm"
        style={{ width: size, height: size * 1.6 }}
      >
        <defs>
          <linearGradient id="bottleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={style.from} />
            <stop offset="100%" stopColor={style.to} />
          </linearGradient>
        </defs>

        {/* Neck */}
        <rect x="55" y="10" width="18" height="35" rx="6" fill="#111827" opacity="0.8" />
        <rect x="52" y="45" width="24" height="12" rx="6" fill="#111827" opacity="0.8" />

        {/* Body */}
        <path
          d="M38 58 C38 50, 90 50, 90 58 L90 160 C90 178, 100 190, 100 205 C100 214, 28 214, 28 205 C28 190, 38 178, 38 160 Z"
          fill="url(#bottleGradient)"
        />

        {/* Label */}
        <rect x="38" y="90" width="52" height="38" rx="6" fill="#F9FAFB" opacity="0.92" />
        {isPremium && (
          <rect x="40" y="92" width="48" height="6" rx="3" fill="#F59E0B" opacity="0.85" />
        )}
        <rect x="44" y="104" width="40" height="4" rx="2" fill="#9CA3AF" />
        <rect x="44" y="112" width="28" height="4" rx="2" fill="#D1D5DB" />

        {/* Shine */}
        <path d="M46 66 C46 62, 52 58, 56 58 L58 58 L58 160 C52 160, 46 150, 46 146 Z" fill="#FFFFFF" opacity="0.12" />
      </svg>

      {/* Premium Crown */}
      {isPremium && (
        <div className="absolute -top-2 right-0 text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold tracking-wide border border-yellow-300">
          PREMIUM
        </div>
      )}
    </div>
  );
};

export default BottlePlaceholder;
