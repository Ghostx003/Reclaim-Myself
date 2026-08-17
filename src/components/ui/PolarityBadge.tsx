import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { GoalPolarity } from '../../types';

interface PolarityBadgeProps {
  polarity: GoalPolarity;
  size?: 'sm' | 'md';
  showDetail?: boolean;
  className?: string;
}

export const PolarityBadge: React.FC<PolarityBadgeProps> = ({
  polarity,
  size = 'md',
  showDetail = false,
  className = '',
}) => {
  const isPositive = polarity === 'positive';
  const color = isPositive ? 'var(--color-success)' : 'var(--color-failure)';
  const bg = isPositive ? 'var(--color-success-bg)' : 'var(--color-failure-bg)';
  const border = isPositive ? 'var(--color-success-border)' : 'var(--color-failure-border)';

  return (
    <div
      className={`polarity-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.2rem 0.55rem' : '0.3rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: size === 'sm' ? '0.75rem' : '0.825rem',
        fontWeight: 600,
        userSelect: 'none',
      }}
      title={isPositive ? 'Positive Goal: Yes represents Success' : 'Negative Goal: No represents Success'}
    >
      {isPositive ? (
        <CheckCircle2 size={size === 'sm' ? 12 : 14} strokeWidth={2.5} />
      ) : (
        <ShieldAlert size={size === 'sm' ? 12 : 14} strokeWidth={2.5} />
      )}
      <span>{isPositive ? 'Positive' : 'Negative'}</span>
      {showDetail && (
        <span style={{ opacity: 0.8, fontWeight: 400, fontSize: '0.75em' }}>
          ({isPositive ? 'Yes = Win' : 'No = Win'})
        </span>
      )}
    </div>
  );
};
