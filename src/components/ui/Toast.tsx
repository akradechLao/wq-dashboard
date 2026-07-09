import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Alert } from '../../types';

interface ToastProps {
  alert: Alert;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ alert, onDismiss, duration = 6000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border max-w-sm transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${
        alert.severity === 'critical'
          ? 'bg-rose-50 border-rose-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {alert.severity === 'critical' ? (
          <AlertCircle className="w-5 h-5 text-rose-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          {alert.severity === 'critical' ? 'Critical Alert' : 'Warning'}
        </p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
        <p className="text-[10px] text-slate-400 mt-1">
          {alert.parameter}: {alert.value} &bull; Threshold: {alert.threshold}
        </p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
