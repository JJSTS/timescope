import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import UsuariosList from './UsuariosList';
import TareasList from './TareasList';
import ProyectosList from './ProyectosList';
import NotificacionesPanel from './NotificacionesPanel';
import ToastNotificacion, { ToastItem } from './ToastNotificacion';
import { useWebSocketNotif } from '../hooks/useWebSocketNotif';
import '../styles/Dashboard.css';
import faviconImage from '../images/Favicon.png';

type IconProps = { className?: string };

const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const BellIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
  const navigate = useNavigate();
  const { isAuthenticated, logout, username } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'usuarios' | 'tareas' | 'proyectos'>('perfil');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendientesCount, setPendientesCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handlePendientesChange = useCallback((count: number) => {
    setPendientesCount(count);
  }, []);

  const handleNuevaNotificacion = useCallback((mensaje: string) => {
    setPendientesCount(prev => prev + 1);
    setToasts(prev => [
      ...prev,
      { id: ++toastIdRef.current, mensaje },
    ]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useWebSocketNotif(username, handleNuevaNotificacion);

  const handleTabClick = (tab: 'perfil' | 'usuarios' | 'tareas' | 'proyectos') => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Toasts de notificación en tiempo real */}
      <ToastNotificacion toasts={toasts} onRemove={removeToast} />

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
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`notification-btn ${pendientesCount > 0 ? 'has-notifications' : ''}`}
              title="Notificaciones"
              aria-label="Notificaciones"
              aria-expanded={notifOpen}
              onClick={() => { setNotifOpen(prev => !prev); setIsMenuOpen(false); }}
            >
              <BellIcon className="dashboard-icon" />
            </button>
            {notifOpen && (
              <NotificacionesPanel
                onClose={() => setNotifOpen(false)}
                onPendientesChange={handlePendientesChange}
              />
            )}
          </div>
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

        {isMenuOpen && (
          <nav id="mobile-menu" className="mobile-menu" aria-label="Navegación móvil">
            <button className={`mobile-menu-item ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => handleTabClick('perfil')}>Mi Perfil</button>
            <button className={`mobile-menu-item ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => handleTabClick('usuarios')}>Usuarios</button>
            <button className={`mobile-menu-item ${activeTab === 'tareas' ? 'active' : ''}`} onClick={() => handleTabClick('tareas')}>Tareas</button>
            <button className={`mobile-menu-item ${activeTab === 'proyectos' ? 'active' : ''}`} onClick={() => handleTabClick('proyectos')}>Proyectos</button>
            <hr />
            <button className="mobile-menu-item logout" onClick={handleLogout}>Cerrar sesión</button>
          </nav>
        )}
      </header>

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
