import React, { ReactNode } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <GlassCard
      className={`empty-state-card animate-fade-in ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          marginBottom: '1.25rem',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          maxWidth: '420px',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: actionLabel ? '1.5rem' : '0',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <GlassButton variant="primary" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      )}
    </GlassCard>
  );
};
