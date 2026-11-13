import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string, duration: number = 2000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast: ToastItem = { id, type, title, message, duration };
    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5 floating toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string, title?: string) => showToast('success', msg, title || 'Success'), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast('error', msg, title || 'Error'), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast('info', msg, title || 'Notice'), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast('warning', msg, title || 'Warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Top-Right Floating Toast Notification Stack */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: 'calc(100vw - 40px)',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              background: '#0f172a',
              color: '#f8fafc',
              border: `1px solid ${t.type === 'success' ? '#22c55e' :
                  t.type === 'error' ? '#ef4444' :
                    t.type === 'warning' ? '#f59e0b' : '#38bdf8'
                }`,
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.45), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
              animation: 'toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  {t.type === 'success' && <CheckCircle2 size={18} color="#4ade80" />}
                  {t.type === 'error' && <AlertTriangle size={18} color="#f87171" />}
                  {t.type === 'warning' && <AlertCircle size={18} color="#fbbf24" />}
                  {t.type === 'info' && <Info size={18} color="#38bdf8" />}
                </div>
                <div>
                  {t.title && (
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                      {t.title}
                    </div>
                  )}
                  <div style={{ fontSize: '0.80rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    {t.message}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
              >
                <X size={15} />
              </button>
            </div>
            {/* Animated Bottom Timer Progress Bar */}
            {t.duration && t.duration > 0 && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                background: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : t.type === 'warning' ? '#f59e0b' : '#38bdf8',
                animation: `toast-progress ${t.duration}ms linear forwards`
              }} />
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

