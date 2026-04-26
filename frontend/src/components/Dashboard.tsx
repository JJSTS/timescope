import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import UsuariosList from './UsuariosList';
import TareasList from './TareasList';
import ProyectosList from './ProyectosList';
import '../styles/Dashboard.css';
import faviconImage from '../images/Favicon.png';

type IconProps = {
  className?: string;
};

const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const BellIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
    <path d="M6.5 17h11l-1.2-1.6A4 4 0 0 1 15 12.8V10a3 3 0 1 0-6 0v2.8a4 4 0 0 1-1.3 2.6Z" />
  </svg>
);

const MenuIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
);

const CloseIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
);

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
          <span className="logo-favicon-slot" aria-hidden="true">
            <img className="logo-favicon" src={faviconImage} alt="" />
          </span>
          <h1 className="logo">TimeScope</h1>
        </div>

        <div className="header-right">
          <button type="button" className="search-btn" title="Buscar" aria-label="Buscar">
            <SearchIcon className="dashboard-icon" />
          </button>
          <button type="button" className="notification-btn" title="Notificaciones" aria-label="Notificaciones">
            <BellIcon className="dashboard-icon" />
          </button>
          <button
            type="button"
            className="menu-btn"
            title="Menú"
            aria-label="Menú"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <CloseIcon className="dashboard-icon" /> : <MenuIcon className="dashboard-icon" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav id="mobile-menu" className="mobile-menu" aria-label="Navegación móvil">
            <button
              className={`mobile-menu-item ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => handleTabClick('perfil')}
            >
              Mi Perfil
            </button>
            <button
              className={`mobile-menu-item ${activeTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => handleTabClick('usuarios')}
            >
              Usuarios
            </button>
            <button
              className={`mobile-menu-item ${activeTab === 'tareas' ? 'active' : ''}`}
              onClick={() => handleTabClick('tareas')}
            >
              Tareas
            </button>
            <button
              className={`mobile-menu-item ${activeTab === 'proyectos' ? 'active' : ''}`}
              onClick={() => handleTabClick('proyectos')}
            >
              Proyectos
            </button>
            <hr />
            <button className="mobile-menu-item logout" onClick={handleLogout}>
              Cerrar sesión
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

