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
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">⏱️ TimeScope</h1>
        </div>

        <div className="header-right">
          <button className="search-btn" title="Buscar" aria-label="Buscar">
            🔍
          </button>
          <button className="notification-btn" title="Notificaciones" aria-label="Notificaciones">
            🔔
          </button>
          <button
            className="menu-btn"
            title="Menú"
            aria-label="Menú"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="mobile-menu">
            <button
              className={`mobile-menu-item ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => handleTabClick('perfil')}
            >
              <span>👤</span> Mi Perfil
            </button>
            <button
              className={`mobile-menu-item ${activeTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => handleTabClick('usuarios')}
            >
              <span>👥</span> Usuarios
            </button>
            <button
              className={`mobile-menu-item ${activeTab === 'tareas' ? 'active' : ''}`}
              onClick={() => handleTabClick('tareas')}
            >
              <span>✓</span> Tareas
            </button>
            <button
              className={`mobile-menu-item ${activeTab === 'proyectos' ? 'active' : ''}`}
              onClick={() => handleTabClick('proyectos')}
            >
              <span>📋</span> Proyectos
            </button>
            <hr />
            <button className="mobile-menu-item logout" onClick={handleLogout}>
              <span>🚪</span> Cerrar Sesión
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
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

