import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/TaskDetailModal.css';

interface Task {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  proyectoNombre?: string;
  horasEstimadas?: number;
  fechaLimite?: string;
  fechaCreacion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  usuario?: string;
  creador?: string;
}

interface Props {
  task: Task;
  onClose: () => void;
  onUpdated?: () => void;
}

const DATE_OPTS: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };

const formatDuration = (inicio: string, fin: string): string => {
  const ms = new Date(fin).getTime() - new Date(inicio).getTime();
  if (ms <= 0) return '—';
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins}min`);
  return parts.join(' ');
};

const toDatetimeLocal = (iso?: string) => (iso ? iso.slice(0, 16) : '');

const TaskDetailModal: React.FC<Props> = ({ task, onClose, onUpdated }) => {
  const { userRole, username } = useAuth();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editNombre, setEditNombre] = useState(task.nombre);
  const [editDescripcion, setEditDescripcion] = useState(task.descripcion);
  const [editHoras, setEditHoras] = useState(task.horasEstimadas?.toString() ?? '');
  const [editFechaLimite, setEditFechaLimite] = useState(toDatetimeLocal(task.fechaLimite));

  if (!task) return null;

  const isLeader = ['DIRECTOR', 'LIDER'].includes(userRole?.toUpperCase() ?? '');

  const handleDelete = async () => {
    setDeleting(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tareas/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al eliminar la tarea');
      }
      onUpdated?.();
      onClose();
    } catch (e: any) {
      setSaveError(e.message);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };
  const isAssigned = username === task.usuario;

  const putRequest = async (body: Record<string, unknown>) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.REACT_APP_API_URL}/tareas/update/${task.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Error al guardar');
    }
  };

  const handleChangeEstado = async (nuevoEstado: string) => {
    setSaving(true);
    setSaveError(null);
    try {
      await putRequest({ estado: nuevoEstado });
      onUpdated?.();
      onClose();
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await putRequest({
        nombre: editNombre,
        descripcion: editDescripcion,
        horasEstimadas: editHoras ? parseFloat(editHoras) : undefined,
        fechaLimite: editFechaLimite ? `${editFechaLimite}:00` : undefined,
      });
      onUpdated?.();
      onClose();
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditNombre(task.nombre);
    setEditDescripcion(task.descripcion);
    setEditHoras(task.horasEstimadas?.toString() ?? '');
    setEditFechaLimite(toDatetimeLocal(task.fechaLimite));
    setSaveError(null);
    setEditing(false);
  };

  const renderActions = () => {
    if (isAssigned) {
      if (task.estado === 'ABIERTO') {
        return (
          <button className="task-action-btn task-action-btn--iniciar" onClick={() => handleChangeEstado('ACTIVO')} disabled={saving}>
            {saving ? 'Guardando…' : 'Iniciar tarea'}
          </button>
        );
      }
      if (task.estado === 'ACTIVO') {
        return (
          <button className="task-action-btn task-action-btn--terminar" onClick={() => handleChangeEstado('REVISION')} disabled={saving}>
            {saving ? 'Guardando…' : 'Terminar tarea'}
          </button>
        );
      }
    }
    if (isLeader && task.estado === 'REVISION') {
      return (
        <div className="task-action-group">
          <button className="task-action-btn task-action-btn--completar" onClick={() => handleChangeEstado('COMPLETADO')} disabled={saving}>
            {saving ? 'Guardando…' : 'Completar'}
          </button>
          <button className="task-action-btn task-action-btn--reactivar" onClick={() => handleChangeEstado('ACTIVO')} disabled={saving}>
            {saving ? 'Guardando…' : 'Reactivar'}
          </button>
          <button className="task-action-btn task-action-btn--suspender" onClick={() => handleChangeEstado('SUSPENDIDO')} disabled={saving}>
            {saving ? 'Guardando…' : 'Suspender'}
          </button>
        </div>
      );
    }
    return null;
  };

  const actions = renderActions();

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        className={`task-modal task-modal-${task.estado?.toLowerCase() || 'pendiente'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="task-modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>

        {/* ── MODO VISTA ── */}
        {!editing && (
          <>
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
              {task.usuario && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Asignado a</span>
                  <span className="task-modal-value">@{task.usuario}</span>
                </div>
              )}
              {task.creador && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Creado por</span>
                  <span className="task-modal-value">@{task.creador}</span>
                </div>
              )}
              {task.proyectoNombre && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Proyecto</span>
                  <span className="task-modal-value">{task.proyectoNombre}</span>
                </div>
              )}
              {task.horasEstimadas != null && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Horas estimadas</span>
                  <span className="task-modal-value">{task.horasEstimadas} h</span>
                </div>
              )}
              {task.fechaCreacion && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Fecha creación</span>
                  <span className="task-modal-value">
                    {new Date(task.fechaCreacion).toLocaleDateString('es-ES', DATE_OPTS)}
                  </span>
                </div>
              )}
              {task.fechaLimite && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Fecha límite</span>
                  <span className="task-modal-value">
                    {new Date(task.fechaLimite).toLocaleDateString('es-ES', DATE_OPTS)}
                  </span>
                </div>
              )}
              {isLeader && task.fechaInicio && task.fechaFin && (
                <div className="task-modal-row">
                  <span className="task-modal-label">Tiempo de ejecución</span>
                  <span className="task-modal-value task-duration">
                    {formatDuration(task.fechaInicio, task.fechaFin)}
                  </span>
                </div>
              )}
            </div>

            <div className="task-modal-footer">
              {isLeader && (
                <button className="task-edit-btn" onClick={() => setEditing(true)}>
                  Editar tarea
                </button>
              )}
              {actions}
              {isLeader && !confirmDelete && (
                <button
                  className="task-action-btn task-action-btn--eliminar"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving || deleting}
                >
                  <i className="bi bi-trash3" /> Eliminar
                </button>
              )}
              {isLeader && confirmDelete && (
                <div className="task-delete-confirm">
                  <span className="task-delete-confirm-text">¿Eliminar esta tarea?</span>
                  <button
                    className="task-action-btn task-action-btn--eliminar"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Eliminando…' : 'Sí, eliminar'}
                  </button>
                  <button
                    className="task-action-btn task-action-btn--cancelar-edit"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {saveError && <p className="task-estado-error">{saveError}</p>}
            </div>
          </>
        )}

        {/* ── MODO EDICIÓN ── */}
        {editing && (
          <>
            <div className="task-modal-header">
              <span className={`task-modal-badge task-${task.estado?.toLowerCase() || 'pendiente'}`}>
                {task.estado}
              </span>
              <h3 className="task-modal-title">Editar tarea</h3>
            </div>

            <form className="task-edit-form" onSubmit={handleSaveEdit}>
              <div className="task-edit-field">
                <label className="task-edit-label">Nombre</label>
                <input
                  className="task-edit-input"
                  type="text"
                  value={editNombre}
                  onChange={e => setEditNombre(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div className="task-edit-field">
                <label className="task-edit-label">Descripción</label>
                <textarea
                  className="task-edit-textarea"
                  value={editDescripcion}
                  onChange={e => setEditDescripcion(e.target.value)}
                  rows={3}
                  disabled={saving}
                />
              </div>

              <div className="task-edit-row">
                <div className="task-edit-field">
                  <label className="task-edit-label">Horas estimadas</label>
                  <input
                    className="task-edit-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editHoras}
                    onChange={e => setEditHoras(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="task-edit-field">
                  <label className="task-edit-label">Fecha límite</label>
                  <input
                    className="task-edit-input"
                    type="datetime-local"
                    value={editFechaLimite}
                    onChange={e => setEditFechaLimite(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              {saveError && <p className="task-estado-error">{saveError}</p>}

              <div className="task-edit-actions">
                <button type="submit" className="task-action-btn task-action-btn--guardar" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button type="button" className="task-action-btn task-action-btn--cancelar-edit" onClick={cancelEdit} disabled={saving}>
                  Cancelar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
