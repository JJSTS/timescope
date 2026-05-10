import React, { useState } from 'react';
import '../styles/ProyectoCreateModal.css';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const ESTADOS = ['ACTIVO', 'COMPLETADO', 'SUSPENDIDO'] as const;

const ProyectoCreateModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<string>('ACTIVO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/v1/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, descripcion, estado }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || data?.detail || 'Error al crear el proyecto');
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
    <div className="pcm-overlay" onClick={onClose}>
      <div className="pcm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pcm-close" onClick={onClose} type="button">✕</button>

        <div className="pcm-header">
          <h3 className="pcm-title">Nuevo Proyecto</h3>
        </div>

        <form className="pcm-form" onSubmit={handleSubmit}>
          <div className="pcm-field">
            <label className="pcm-label">Nombre <span className="pcm-required">*</span></label>
            <input
              className="pcm-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del proyecto (máx. 20 caracteres)"
              maxLength={20}
              required
              disabled={loading}
            />
          </div>

          <div className="pcm-field">
            <label className="pcm-label">Descripción</label>
            <textarea
              className="pcm-textarea"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del proyecto (máx. 300 caracteres)"
              maxLength={300}
              rows={3}
              disabled={loading}
            />
            <span className="pcm-char-count">{descripcion.length}/300</span>
          </div>

          <div className="pcm-field">
            <label className="pcm-label">Estado <span className="pcm-required">*</span></label>
            <select
              className="pcm-select"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
              disabled={loading}
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e.charAt(0) + e.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          {error && <p className="pcm-error">{error}</p>}

          <div className="pcm-actions">
            <button type="button" className="pcm-btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="pcm-btn-submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProyectoCreateModal;
