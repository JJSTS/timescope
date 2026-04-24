import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import UsuariosList from './UsuariosList';
import TareasList from './TareasList';
import ProyectosList from './ProyectosList';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'usuarios' | 'tareas' | 'proyectos'>('perfil');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab: 'perfil' | 'usuarios' | 'tareas' | 'proyectos') => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setActiveTab('perfil')} />;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>⏱️ TimeScope</h1>
        </div>
        <div className="navbar-controls">
          <button className="notification-btn" title="Notificaciones">
            🔔
          </button>
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>
        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <button
            className={`nav-btn ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => handleTabClick('perfil')}
          >
            👤 Mi Perfil
          </button>
          <button
            className={`nav-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => handleTabClick('usuarios')}
          >
            👥 Usuarios
          </button>
          <button
            className={`nav-btn ${activeTab === 'tareas' ? 'active' : ''}`}
            onClick={() => handleTabClick('tareas')}
          >
            ✓ Tareas
          </button>
          <button
            className={`nav-btn ${activeTab === 'proyectos' ? 'active' : ''}`}
            onClick={() => handleTabClick('proyectos')}
          >
            📋 Proyectos
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'perfil' && <UserProfile />}
        {activeTab === 'usuarios' && <UsuariosList />}
        {activeTab === 'tareas' && <TareasList />}
        {activeTab === 'proyectos' && <ProyectosList />}
      </main>
    </div>
  );
};

export default Dashboard;

