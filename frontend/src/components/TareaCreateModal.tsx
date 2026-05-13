import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/TareaCreateModal.css';

interface Proyecto {
  id: number;
  nombre: string;
}

interface Miembro {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  rol?: string;
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
  organizacionId?: number;
}

const TareaCreateModal: React.FC<Props> = ({ onClose, onCreated, organizacionId }) => {
  const { userRole } = useAuth();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [horasEstimadas, setHorasEstimadas] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [usuarioUsername, setUsuarioUsername] = useState('');
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [miembrosLoading, setMiembrosLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE = process.env.REACT_APP_API_URL;
  const canAssign = ['DIRECTOR', 'LIDER'].includes(userRole?.toUpperCase() ?? '');

  useEffect(() => {
    if (!organizacionId) return;
    const token = localStorage.getItem('token');
    fetch(`${BASE}/organizaciones/${organizacionId}/proyectos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setProyectos(Array.isArray(data) ? data : []))
      .catch(() => setProyectos([]));
  }, [organizacionId]);

  useEffect(() => {
    if (!canAssign || !proyectoId) {
      setMiembros([]);
      setUsuarioUsername('');
      return;
    }
    const token = localStorage.getItem('token');
    setMiembrosLoading(true);
    fetch(`${BASE}/proyectos/${proyectoId}/miembros`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMiembros(Array.isArray(data) ? data : []))
      .catch(() => setMiembros([]))
      .finally(() => setMiembrosLoading(false));
    setUsuarioUsername('');
  }, [proyectoId, canAssign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!proyectoId) {
      setError('Debes seleccionar un proyecto');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const body: Record<string, unknown> = {
        nombre,
        descripcion,
        fechaLimite: fechaLimite ? `${fechaLimite}:00` : undefined,
      };
      if (horasEstimadas) body.horasEstimadas = parseFloat(horasEstimadas);
      if (proyectoId) body.proyectoId = parseInt(proyectoId, 10);

      const createRes = await fetch(`${BASE}/tareas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        throw new Error(data?.message || data?.detail || 'Error al crear la tarea');
      }

      const tareaCreada = await createRes.json();

      if (canAssign && usuarioUsername) {
        const assignRes = await fetch(`${BASE}/tareas/addTarea`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ tareaId: tareaCreada.id, username: usuarioUsername }),
        });
        if (!assignRes.ok) {
          const data = await assignRes.json().catch(() => ({}));
          throw new Error(data?.message || 'Tarea creada pero no se pudo asignar al usuario');
        }
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tcm-overlay" onClick={onClose}>
      <div className="tcm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tcm-close" onClick={onClose} type="button"><i className="bi bi-x-lg" /></button>

        <div className="tcm-header">
          <h3 className="tcm-title">Nueva Tarea</h3>
        </div>

        <form className="tcm-form" onSubmit={handleSubmit}>
          <div className="tcm-field">
            <label className="tcm-label">Nombre <span className="tcm-required">*</span></label>
            <input
              className="tcm-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la tarea"
              required
              disabled={loading}
            />
          </div>

          <div className="tcm-field">
            <label className="tcm-label">Descripción <span className="tcm-required">*</span></label>
            <textarea
              className="tcm-textarea"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de la tarea"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="tcm-field">
            <label className="tcm-label">Fecha límite <span className="tcm-required">*</span></label>
            <input
              className="tcm-input"
              type="datetime-local"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="tcm-row">
            <div className="tcm-field">
              <label className="tcm-label">Horas estimadas</label>
              <input
                className="tcm-input"
                type="number"
                min="0"
                step="0.5"
                value={horasEstimadas}
                onChange={(e) => setHorasEstimadas(e.target.value)}
                placeholder="ej. 4.5"
                disabled={loading}
              />
            </div>

            <div className="tcm-field">
              <label className="tcm-label">Proyecto <span className="tcm-required">*</span></label>
              <select
                className="tcm-input"
                value={proyectoId}
                onChange={(e) => setProyectoId(e.target.value)}
                disabled={loading || proyectos.length === 0}
                required
              >
                <option value="">Selecciona un proyecto</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {canAssign && (
            <div className="tcm-field">
              <label className="tcm-label">Asignar a</label>
              <select
                className="tcm-input"
                value={usuarioUsername}
                onChange={(e) => setUsuarioUsername(e.target.value)}
                disabled={loading || miembrosLoading || !proyectoId}
              >
                <option value="">
                  {!proyectoId ? 'Selecciona un proyecto primero' : miembrosLoading ? 'Cargando…' : 'Sin asignar'}
                </option>
                {miembros.map(m => (
                  <option key={m.id} value={m.username}>
                    @{m.username} — {m.nombres} {m.apellidos}
                    {m.rol ? ` (${m.rol})` : ''}
                  </option>
                ))}
              </select>
              {usuarioUsername && (
                <p className="tcm-assign-hint">
                  La tarea quedará en estado <strong>ABIERTO</strong> al asignarse.
                </p>
              )}
            </div>
          )}

          {error && <p className="tcm-error">{error}</p>}

          <div className="tcm-actions">
            <button type="button" className="tcm-btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="tcm-btn-submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TareaCreateModal;
