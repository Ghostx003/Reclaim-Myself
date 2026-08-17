import React, { ReactNode, useRef, useState } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  delayMs?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delayMs = 800, // deliberate hover delay to prevent flashing
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  return (
    <div
      className={`tooltip-wrapper ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className="glass-panel animate-pop-in"
          style={{
            position: 'absolute',
            zIndex: 100,
            bottom: position === 'top' ? 'calc(100% + 8px)' : undefined,
            top: position === 'bottom' ? 'calc(100% + 8px)' : undefined,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '180px',
            maxWidth: '280px',
            padding: '0.75rem',
            pointerEvents: 'none',
            fontSize: '0.85rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--glass-border-hover)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
