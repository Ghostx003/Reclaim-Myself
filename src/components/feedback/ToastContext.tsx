import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration: number = 3500) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        maxWidth: 'calc(100vw - 2.5rem)',
        width: '380px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        let icon = <Info size={20} color="var(--accent-primary)" />;
        let borderColor = 'var(--glass-border)';

        if (toast.type === 'success') {
          icon = <CheckCircle2 size={20} color="var(--color-success)" />;
          borderColor = 'var(--color-success-border)';
        } else if (toast.type === 'error') {
          icon = <AlertTriangle size={20} color="var(--color-failure)" />;
          borderColor = 'var(--color-failure-border)';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle size={20} color="var(--star-gold)" />;
          borderColor = 'rgba(251, 191, 36, 0.4)';
        }

        return (
          <div
            key={toast.id}
            className="glass-panel animate-pop-in"
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              pointerEvents: 'auto',
              border: `1px solid ${borderColor}`,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => onClose(toast.id)}
              style={{
                color: 'var(--text-dim)',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
              }}
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
