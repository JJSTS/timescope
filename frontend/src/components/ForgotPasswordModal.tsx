import React, { useState } from 'react';
import { authService } from '../services/authService';
import '../styles/ForgotPasswordModal.css';

interface Props {
  onClose: () => void;
}

type Step = 'username' | 'reset' | 'success';

const EyeIcon: React.FC<{ visible: boolean }> = ({ visible }) =>
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const ForgotPasswordModal: React.FC<Props> = ({ onClose }) => {
  const [step, setStep]         = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [code, setCode]         = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showNew, setShowNew]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const mismatch = confirm.length > 0 && newPass !== confirm;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Introduce tu nombre de usuario.'); return; }
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(username.trim().toLowerCase());
      setStep('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6)      { setError('El código debe tener 6 dígitos.'); return; }
    if (newPass.length < 5)     { setError('La contraseña debe tener al menos 5 caracteres.'); return; }
    if (mismatch)               { setError('Las contraseñas no coinciden.'); return; }
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword(username, code, newPass, confirm);
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-overlay" onClick={onClose}>
      <div className="fp-modal" onClick={e => e.stopPropagation()}>
        <div className="fp-header">
          <h2 className="fp-title">Recuperar contraseña</h2>
          <button className="fp-close" onClick={onClose} aria-label="Cerrar">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {step === 'username' && (
          <form className="fp-form" onSubmit={handleSendCode} noValidate>
            <p className="fp-desc">Introduce tu nombre de usuario y te enviaremos un código de 6 dígitos a tu correo.</p>
            <div className="fp-field">
              <label htmlFor="fp-username">Nombre de usuario</label>
              <input
                id="fp-username"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(null); }}
                placeholder="tu_usuario"
                required
                disabled={loading}
                autoFocus
              />
            </div>
            {error && <p className="fp-error">{error}</p>}
            <div className="fp-actions">
              <button type="button" className="fp-btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button type="submit" className="fp-btn-primary" disabled={loading}>
                {loading ? <span className="fp-spinner" /> : 'Enviar código'}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form className="fp-form" onSubmit={handleReset} noValidate>
            <p className="fp-desc">
              Hemos enviado un código de 6 dígitos al correo asociado a <strong>{username}</strong>. Introduce el código y tu nueva contraseña.
            </p>

            <div className="fp-field">
              <label htmlFor="fp-code">Código de verificación</label>
              <input
                id="fp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(null); }}
                placeholder="000000"
                required
                disabled={loading}
                autoFocus
                className="fp-code-input"
              />
            </div>

            <div className="fp-field">
              <label htmlFor="fp-new-pass">Nueva contraseña</label>
              <div className="fp-input-wrapper">
                <input
                  id="fp-new-pass"
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => { setNewPass(e.target.value); setError(null); }}
                  placeholder="Mínimo 5 caracteres"
                  required
                  minLength={5}
                  disabled={loading}
                />
                <button type="button" className="fp-eye" onClick={() => setShowNew(v => !v)} aria-label="Mostrar contraseña">
                  <EyeIcon visible={showNew} />
                </button>
              </div>
            </div>

            <div className="fp-field">
              <label htmlFor="fp-confirm-pass">Confirmar contraseña</label>
              <div className="fp-input-wrapper">
                <input
                  id="fp-confirm-pass"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(null); }}
                  placeholder="Repite la contraseña"
                  required
                  disabled={loading}
                  className={mismatch ? 'fp-input--error' : ''}
                />
                <button type="button" className="fp-eye" onClick={() => setShowConfirm(v => !v)} aria-label="Mostrar contraseña">
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
              {mismatch && <p className="fp-field-error">Las contraseñas no coinciden.</p>}
            </div>

            {error && <p className="fp-error">{error}</p>}

            <div className="fp-actions">
              <button type="button" className="fp-btn-secondary"
                onClick={() => { setStep('username'); setError(null); setCode(''); setNewPass(''); setConfirm(''); }}
                disabled={loading}>
                Atrás
              </button>
              <button type="submit" className="fp-btn-primary" disabled={loading || mismatch}>
                {loading ? <span className="fp-spinner" /> : 'Restablecer contraseña'}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="fp-success">
            <div className="fp-success-icon"><i className="bi bi-check-circle" /></div>
            <p>Contraseña restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <button className="fp-btn-primary" onClick={onClose}>Aceptar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
