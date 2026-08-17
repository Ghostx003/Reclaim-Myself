import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: 'gold' | 'silver' | 'bronze' | 'none';
  size?: number;
  animate?: boolean;
  className?: string;
  showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  animate = false,
  className = '',
  showLabel = false,
}) => {
  if (rating === 'none') {
    return null;
  }

  let color = 'var(--star-bronze)';
  let glow = 'none';
  let label = 'Bronze Star';

  if (rating === 'gold') {
    color = 'var(--star-gold)';
    glow = '0 0 12px var(--star-gold-glow)';
    label = 'Gold Star (High Performance)';
  } else if (rating === 'silver') {
    color = 'var(--star-silver)';
    glow = '0 0 8px rgba(148, 163, 184, 0.3)';
    label = 'Silver Star (Good Progress)';
  }

  return (
    <div
      className={`star-rating-badge ${animate ? 'animate-star' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        filter: glow !== 'none' ? `drop-shadow(${glow})` : undefined,
      }}
      title={label}
      aria-label={label}
    >
      <Star
        size={size}
        fill={color}
        color={color}
        strokeWidth={1.5}
        style={{ flexShrink: 0 }}
      />
      {showLabel && (
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color,
            textTransform: 'capitalize',
          }}
        >
          {rating} Star
        </span>
      )}
    </div>
  );
};
