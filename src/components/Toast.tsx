import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export function Toast({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-success-400" />,
    error: <XCircle className="w-5 h-5 text-danger-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-brand-400" />,
  };

  const borders = {
    success: 'border-success-500/30',
    error: 'border-danger-500/30',
    warning: 'border-amber-500/30',
    info: 'border-brand-500/30',
  };

  return (
    <div
      className={`card ${borders[toast.type]} p-4 flex items-start gap-3 shadow-2xl animate-slide-up min-w-[300px] max-w-md`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{toast.title}</p>
        {toast.message && <p className="text-dark-400 text-sm mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={onClose} className="text-dark-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const close = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, show, close };
}
