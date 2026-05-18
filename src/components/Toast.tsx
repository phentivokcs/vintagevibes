import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export const showToast = (type: ToastType, message: string) => {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message,
  };
  toastListeners.forEach((listener) => listener(toast));
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };

    toastListeners.push(listener);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm
            animate-in slide-in-from-right duration-300
            ${
              toast.type === 'success'
                ? 'bg-green-50/95 border-green-200 text-green-800'
                : toast.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-800'
                : 'bg-blue-50/95 border-blue-200 text-blue-800'
            }
          `}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}

          <p className="text-sm font-medium flex-1">{toast.message}</p>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
