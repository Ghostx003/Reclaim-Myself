import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  style,
  disabled,
  ...rest
}) => {
  let variantClass = 'btn-secondary';
  if (variant === 'primary') variantClass = 'btn-primary';
  if (variant === 'danger') variantClass = 'btn-danger';
  if (variant === 'icon') variantClass = 'btn-icon';

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.4rem 0.8rem', fontSize: '0.85rem', minHeight: '36px' },
    md: { padding: '0.65rem 1.25rem', fontSize: '0.95rem', minHeight: '44px' },
    lg: { padding: '0.85rem 1.75rem', fontSize: '1.05rem', minHeight: '52px' },
  };

  return (
    <button
      type={rest.type || 'button'}
      className={`${variantClass} ${className}`}
      style={{
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...(variant !== 'icon' ? sizeStyles[size] : {}),
        ...style,
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};
