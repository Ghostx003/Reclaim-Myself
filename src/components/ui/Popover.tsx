import React, { ReactNode, useEffect, useRef } from 'react';

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  anchorRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`glass-panel animate-pop-in ${className}`}
      style={{
        position: 'absolute',
        zIndex: 150,
        top: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        minWidth: '220px',
        maxWidth: '320px',
        padding: '0.85rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--glass-border-hover)',
      }}
    >
      {children}
    </div>
  );
};
