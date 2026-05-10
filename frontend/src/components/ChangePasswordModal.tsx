import React, { useState } from 'react';
import { authService } from '../services/authService';
import '../styles/ChangePasswordModal.css';


interface Props {
  onClose: () => void;
}

const EyeIcon: React.FC<{ visible: boolean }> = ({ visible }) =>
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
  const [form, setForm] = useState({ password: '', newPassword: '', passwordComprobacion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState({ password: false, newPassword: false, passwordComprobacion: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const toggleShow = (field: keyof typeof show) => {
    setShow(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.passwordComprobacion) {
      setError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(form.password, form.newPassword, form.passwordComprobacion);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cp-header">
          <h2>Cambiar contraseña</h2>
          <button className="cp-close" onClick={onClose} aria-label="Cerrar"><i className="bi bi-x-lg" /></button>
        </div>

        {success ? (
          <div className="cp-success">
            <div className="cp-success-icon"><i className="bi bi-check-lg" /></div>
            <p>Contraseña actualizada correctamente.</p>
            <button className="cp-btn-primary" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <form className="cp-form" onSubmit={handleSubmit} noValidate>
            <div className="cp-field">
              <label htmlFor="password">Contraseña actual</label>
              <div className="cp-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={show.password ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Introduce tu contraseña actual"
                  required
                  minLength={5}
                />
                <button type="button" className="cp-eye" onClick={() => toggleShow('password')} aria-label="Mostrar contraseña">
                  <EyeIcon visible={show.password} />
                </button>
              </div>
            </div>

            <div className="cp-field">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <div className="cp-input-wrapper">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={show.newPassword ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 5 caracteres"
                  required
                  minLength={5}
                />
                <button type="button" className="cp-eye" onClick={() => toggleShow('newPassword')} aria-label="Mostrar contraseña">
                  <EyeIcon visible={show.newPassword} />
                </button>
              </div>
            </div>

            <div className="cp-field">
              <label htmlFor="passwordComprobacion">Confirmar nueva contraseña</label>
              <div className="cp-input-wrapper">
                <input
                  id="passwordComprobacion"
                  name="passwordComprobacion"
                  type={show.passwordComprobacion ? 'text' : 'password'}
                  value={form.passwordComprobacion}
                  onChange={handleChange}
                  placeholder="Repite la nueva contraseña"
                  required
                  minLength={5}
                />
                <button type="button" className="cp-eye" onClick={() => toggleShow('passwordComprobacion')} aria-label="Mostrar contraseña">
                  <EyeIcon visible={show.passwordComprobacion} />
                </button>
              </div>
            </div>

            {error && <p className="cp-error">{error}</p>}

            <div className="cp-actions">
              <button type="button" className="cp-btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="cp-btn-primary" disabled={loading}>
                {loading ? <span className="cp-spinner" /> : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
