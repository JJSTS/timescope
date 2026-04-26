import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import '../styles/LoginForm.css';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Iniciando login con usuario:', username);
      const response = await authService.login(username, password);
      console.log('Login exitoso. Token:', response.token.substring(0, 20) + '...');

      // Guardar token y username en localStorage
      localStorage.setItem('token', response.token);
      console.log('Token guardado en localStorage');

      localStorage.setItem('username', username);
      console.log('Username guardado en localStorage:', username);

      // Actualizar contexto
      setIsAuthenticated(true);
      console.log('setIsAuthenticated(true) ejecutado');

      // Pequeño delay para permitir que AuthContext se actualice
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Redirigiendo a UserProfile...');
      onLoginSuccess();
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>TimeScope</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

