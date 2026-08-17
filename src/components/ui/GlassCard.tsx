import React, { ReactNode } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'interactive';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  style,
  ...rest
}) => {
  let baseClass = 'glass-panel';
  if (variant === 'subtle') baseClass = 'glass-panel-subtle';
  if (variant === 'interactive') baseClass = 'glass-panel-interactive';

  return (
    <div
      className={`${baseClass} ${className}`}
      style={{
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
