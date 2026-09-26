import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-olive-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rust-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-terracotta-600 shrink-0" />
  };

  const borderColors = {
    success: 'border-olive-500/30 bg-cream-50/95 text-olive-900 shadow-card',
    warning: 'border-amber-500/30 bg-amber-50/95 text-amber-950 shadow-card',
    error: 'border-rust-500/30 bg-rust-50/95 text-rust-950 shadow-card',
    info: 'border-terracotta-500/30 bg-cream-50/95 text-cocoa-900 shadow-card'
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-card border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borderColors[toast.type] || borderColors.info}`}
          >
            {icons[toast.type] || icons.info}
            <div className="flex-1 text-xs font-semibold leading-5">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-cocoa-400 hover:text-cocoa-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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
