import React from 'react';
import '../styles/TaskDetailModal.css';

interface Task {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  proyecto?: string;
  horasEstimadas?: number;
  fechaLimite?: string;
  fechaCreacion?: string;
}

interface Props {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<Props> = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        className={`task-modal task-modal-${task.estado?.toLowerCase() || 'pendiente'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="task-modal-close" onClick={onClose}>✕</button>

        <div className="task-modal-header">
          <span className={`task-modal-badge task-${task.estado?.toLowerCase() || 'pendiente'}`}>
            {task.estado}
          </span>
          <h3 className="task-modal-title">{task.nombre}</h3>
        </div>

        <div className="task-modal-body">
          {task.descripcion && (
            <div className="task-modal-row">
              <span className="task-modal-label">Descripción</span>
              <p className="task-modal-value">{task.descripcion}</p>
            </div>
          )}
          {task.proyecto && (
            <div className="task-modal-row">
              <span className="task-modal-label">Proyecto</span>
              <span className="task-modal-value">{task.proyecto}</span>
            </div>
          )}
          {task.horasEstimadas != null && (
            <div className="task-modal-row">
              <span className="task-modal-label">Horas estimadas</span>
              <span className="task-modal-value">{task.horasEstimadas} h</span>
            </div>
          )}
          {task.fechaLimite && (
            <div className="task-modal-row">
              <span className="task-modal-label">Fecha límite</span>
              <span className="task-modal-value">
                {new Date(task.fechaLimite).toLocaleDateString('es-ES', {
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          )}
          {task.fechaCreacion && (
            <div className="task-modal-row">
              <span className="task-modal-label">Fecha creación</span>
              <span className="task-modal-value">
                {new Date(task.fechaCreacion).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
