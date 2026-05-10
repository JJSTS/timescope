import React, { useState, useEffect } from 'react';
import '../styles/EditProfileModal.css';

interface UserData {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  username: string;
}

interface Props {
  onClose: () => void;
  onUpdated?: () => void;
}

const EditProfileModal: React.FC<Props> = ({ onClose, onUpdated }) => {
  const token = localStorage.getItem('token');

  const [userData, setUserData] = useState<UserData | null>(null);
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar perfil'))
      .then((data: UserData) => {
        setUserData(data);
        setNombres(data.nombres ?? '');
        setApellidos(data.apellidos ?? '');
        setEmail(data.email ?? '');
      })
      .catch(() => setError('No se pudo cargar tu perfil.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/usuarios/${userData.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombres, apellidos, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al guardar los cambios');
      }
      setSuccess(true);
      onUpdated?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="epm-overlay" onClick={onClose}>
      <div className="epm-modal" onClick={e => e.stopPropagation()}>
        <div className="epm-header">
          <h2 className="epm-title">Editar perfil</h2>
          <button className="epm-close" onClick={onClose} aria-label="Cerrar">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {loading && (
          <div className="epm-loading">
            <span className="epm-spinner" />
            Cargando…
          </div>
        )}

        {!loading && error && !success && (
          <p className="epm-error">{error}</p>
        )}

        {!loading && success && (
          <div className="epm-success">
            <i className="bi bi-check-circle-fill epm-success-icon" />
            <p>Perfil actualizado correctamente.</p>
            <button className="epm-btn-primary" onClick={onClose}>Cerrar</button>
          </div>
        )}

        {!loading && !success && userData && (
          <form className="epm-form" onSubmit={handleSubmit} noValidate>
            <div className="epm-row">
              <div className="epm-field">
                <label className="epm-label">Nombres</label>
                <input
                  className="epm-input"
                  type="text"
                  value={nombres}
                  onChange={e => setNombres(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
              <div className="epm-field">
                <label className="epm-label">Apellidos</label>
                <input
                  className="epm-input"
                  type="text"
                  value={apellidos}
                  onChange={e => setApellidos(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="epm-field">
              <label className="epm-label">Correo electrónico</label>
              <input
                className="epm-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="epm-field epm-field--readonly">
              <label className="epm-label">Usuario</label>
              <input
                className="epm-input epm-input--readonly"
                type="text"
                value={userData.username}
                readOnly
              />
              <span className="epm-hint">El nombre de usuario no se puede modificar</span>
            </div>

            {error && <p className="epm-error">{error}</p>}

            <div className="epm-actions">
              <button type="submit" className="epm-btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button type="button" className="epm-btn-secondary" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfileModal;
