import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const CrearOrganizacionModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const { logout } = useAuth();
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/organizaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: nombre.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || data?.detail || 'Error al crear la organización');
      }
      setSuccess(true);
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAndLogin = () => {
    logout();
  };

  return (
    <div className="pcm-overlay" onClick={onClose}>
      <div className="pcm-modal" onClick={e => e.stopPropagation()}>
        <button className="pcm-close" onClick={onClose} type="button">
          <i className="bi bi-x-lg" />
        </button>

        <div className="pcm-header">
          <h3 className="pcm-title">Crear organización</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Serás el DIRECTOR de esta organización.
          </p>
        </div>

        {!success ? (
          <form className="pcm-form" onSubmit={handleSubmit}>
            <div className="pcm-field">
              <label className="pcm-label">Nombre de la organización <span className="pcm-required">*</span></label>
              <input
                className="pcm-input"
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. TechCorp Solutions"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            {error && <p className="pcm-error">{error}</p>}

            <div className="pcm-actions">
              <button type="button" className="pcm-btn-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="pcm-btn-submit" disabled={loading || !nombre.trim()}>
                {loading ? 'Creando...' : 'Crear organización'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '1.5rem 0 0.5rem', textAlign: 'center' }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2.5rem', color: 'var(--success, #22c55e)' }} />
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>¡Organización creada!</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Para acceder con rol DIRECTOR, inicia sesión de nuevo indicando tu organización.
            </p>
            <button
              className="pcm-btn-submit"
              style={{ marginTop: '1.25rem', width: '100%' }}
              onClick={handleLogoutAndLogin}
            >
              Cerrar sesión e iniciar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearOrganizacionModal;
