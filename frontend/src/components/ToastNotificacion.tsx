import React, { useEffect } from 'react';
import '../styles/ToastNotificacion.css';

export interface ToastItem {
  id: number;
  mensaje: string;
}

interface Props {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

const DURACION_MS = 5000;

const ToastSingle: React.FC<{ toast: ToastItem; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), DURACION_MS);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div className="toast-item" role="alert">
      <span className="toast-icon" aria-hidden="true">🔔</span>
      <p className="toast-mensaje">{toast.mensaje}</p>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
      <div className="toast-progress" style={{ animationDuration: `${DURACION_MS}ms` }} />
    </div>
  );
};

const ToastNotificacion: React.FC<Props> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <ToastSingle key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastNotificacion;
