import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import ForgotPasswordModal from './ForgotPasswordModal';
import faviconImage from '../images/Favicon.png';
import '../styles/LoginForm.css';

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  nombre: string;
  apellidos: string;
  email: string;
  username: string;
  password: string;
  passwordComprobacion: string;
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

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showForgot, setShowForgot] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ login: false, register: false, registerConfirm: false });

  const toggleShow = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const [loginData, setLoginData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    nombre: '',
    apellidos: '',
    email: '',
    username: '',
    password: '',
    passwordComprobacion: '',
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: name === 'username' ? value.toLowerCase() : value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const username = loginData.username.trim().toLowerCase();
      const response = await authService.login(username, loginData.password);
      await login(username, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const registerPasswordMismatch = registerData.passwordComprobacion.length > 0 && registerData.password !== registerData.passwordComprobacion;

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (registerData.password.length < 5) { setError('La contraseña debe tener al menos 5 caracteres.'); return; }
    if (registerPasswordMismatch) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      const username = registerData.username.trim().toLowerCase();
      const response = await authService.register(
        registerData.nombre,
        registerData.apellidos,
        registerData.email,
        username,
        registerData.password,
        registerData.passwordComprobacion,
      );
      await login(username, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="login-container">
      {/* Left Side - Hero */}
      <div className="login-hero">
        <div className="hero-content">
          <div className="hero-header">
            <h1 className="hero-title">
              Todo tu equipo, cada proyecto, cada tarea en un solo lugar con <span className="hero-brand">TimeScope</span>
            </h1>
            <p className="hero-description">
              Coordina equipos, asigna tareas y da seguimiento a proyectos con claridad. Notificaciones en tiempo real, roles por organización y una visión completa de tu trabajo.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="login-form-wrapper">
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon"><img className="logo-favicon" src={faviconImage} alt="" /></div>
            <span className="logo-text">TimeScope</span>
          </div>

          <h2 className="login-title">Bienvenido a TimeScope</h2>

          <div className="toggle-buttons">
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`toggle-btn ${!isLogin ? 'toggle-btn-active' : ''}`}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`toggle-btn ${isLogin ? 'toggle-btn-active' : ''}`}
            >
              Iniciar sesión
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Login Form */}
          {isLogin && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-username" className="form-label">Usuario</label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  className="form-input"
                  placeholder="tu_usuario"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Contraseña</label>
                <div className="input-wrapper">
                  <input
                    id="login-password"
                    name="password"
                    type={showPasswords.login ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="form-input"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button type="button" className="eye-btn" onClick={() => toggleShow('login')} tabIndex={-1} aria-label="Mostrar contraseña">
                    <EyeIcon visible={showPasswords.login} />
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>

              <div className="forgot-password">
                <button type="button" className="forgot-link" onClick={() => setShowForgot(true)}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {!isLogin && (
            <form onSubmit={handleRegisterSubmit} className="auth-form register-mode">
              <div className="form-group">
                <label htmlFor="register-nombre" className="form-label">Nombre</label>
                <input
                  id="register-nombre"
                  name="nombre"
                  type="text"
                  value={registerData.nombre}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="Laura"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-apellidos" className="form-label">Apellidos</label>
                <input
                  id="register-apellidos"
                  name="apellidos"
                  type="text"
                  value={registerData.apellidos}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="Fernández García"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email" className="form-label">Correo electrónico</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="laura@empresa.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-username" className="form-label">Usuario</label>
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="tu_usuario"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password" className="form-label">Contraseña</label>
                <div className="input-wrapper">
                  <input
                    id="register-password"
                    name="password"
                    type={showPasswords.register ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className="form-input"
                    placeholder="Mínimo 5 caracteres"
                    required
                    minLength={5}
                    disabled={loading}
                  />
                  <button type="button" className="eye-btn" onClick={() => toggleShow('register')} tabIndex={-1} aria-label="Mostrar contraseña">
                    <EyeIcon visible={showPasswords.register} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-password-comp" className="form-label">Confirmar contraseña</label>
                <div className="input-wrapper">
                  <input
                    id="register-password-comp"
                    name="passwordComprobacion"
                    type={showPasswords.registerConfirm ? 'text' : 'password'}
                    value={registerData.passwordComprobacion}
                    onChange={handleRegisterChange}
                    className={`form-input${registerPasswordMismatch ? ' form-input--error' : ''}`}
                    placeholder="Repite tu contraseña"
                    required
                    minLength={5}
                    disabled={loading}
                  />
                  <button type="button" className="eye-btn" onClick={() => toggleShow('registerConfirm')} tabIndex={-1} aria-label="Mostrar contraseña">
                    <EyeIcon visible={showPasswords.registerConfirm} />
                  </button>
                </div>
                {registerPasswordMismatch && <p className="form-field-error">Las contraseñas no coinciden.</p>}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <p className="terms-text">
                Al crear una cuenta, aceptas nuestros <a href="#">términos de servicios y política de privacidad</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  );
};

export default Login;
