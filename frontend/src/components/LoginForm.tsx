import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import faviconImage from '../images/Favicon.png';
import '../styles/LoginForm.css';

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  nombres: string;
  email: string;
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Login state
  const [loginData, setLoginData] = useState<LoginFormData>({
    username: '',
    password: ''
  });

  // Register state
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    nombres: '',
    email: '',
    username: '',
    password: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(loginData.username, loginData.password);
      login(loginData.username, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(
        registerData.nombres,
        registerData.email,
        registerData.username,
        registerData.password
      );
      login(registerData.username, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Hero */}
      <div className="login-hero">
        <div className="hero-content">
          <div className="hero-header">
            <h1 className="hero-title">
              Accede a <span className="hero-brand">TimeScope</span> y organiza el tiempo de tu equipo
            </h1>
            <p className="hero-description">
              Gestión de tiempo simplificada para equipos modernos. Rastrea proyectos, mide productividad y colabora en tiempo real.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-orange">👥</div>
              <div className="stat-value">+150</div>
              <div className="stat-label">Equipos</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-sky">📈</div>
              <div className="stat-value">2.5K</div>
              <div className="stat-label">Proyectos</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-lime">📍</div>
              <div className="stat-value">Madrid</div>
              <div className="stat-label">España</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Card */}
      <div className="login-form-wrapper">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="logo-icon"> <img className="logo-favicon" src={faviconImage} alt="" /> </div>
            <span className="logo-text">TimeScope</span>
          </div>

          <h2 className="login-title">Bienvenido a TimeScope</h2>

          {/* Toggle Buttons */}
          <div className="toggle-buttons">
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`toggle-btn ${!isLogin ? 'toggle-btn-active' : ''}`}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`toggle-btn ${isLogin ? 'toggle-btn-active' : ''}`}
            >
              Iniciar sesión
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-username" className="form-label">
                  Usuario
                </label>
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
                <label htmlFor="login-password" className="form-label">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>

              <div className="forgot-password">
                <button type="button" className="forgot-link">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {!isLogin && (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="register-nombres" className="form-label">
                  Nombre completo
                </label>
                <input
                  id="register-nombres"
                  name="nombres"
                  type="text"
                  value={registerData.nombres}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="Laura Fernández"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email" className="form-label">
                  Correo electrónico
                </label>
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
                <label htmlFor="register-username" className="form-label">
                  Usuario
                </label>
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
                <label htmlFor="register-password" className="form-label">
                  Contraseña
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <p className="terms-text">
                Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

