import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfileModal from './EditProfileModal';
import UsuariosList from './UsuariosList';
import TareasList from './TareasList';
import ProyectosList from './ProyectosList';
import NotificacionesPanel from './NotificacionesPanel';
import ToastNotificacion, { ToastItem } from './ToastNotificacion';
import SearchBar from './SearchBar';
import OrganizacionModal from './OrganizacionModal';
import { useWebSocketNotif } from '../hooks/useWebSocketNotif';
import '../styles/Dashboard.css';
import faviconImage from '../images/Favicon.png';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, username, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'tareas' | 'proyectos' | 'equipo'>('perfil');
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [pendientesCount, setPendientesCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [userInitials, setUserInitials] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const toastIdRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Log para depurar el rol del usuario
  console.log('Rol del usuario en Dashboard:', userRole);

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // Efecto para cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calcular iniciales del avatar
  useEffect(() => {
    if (!username) return;
    const initials = username
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    setUserInitials(initials || username.charAt(0).toUpperCase());
  }, [username]);

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

  const handleTabClick = (tab: 'perfil' | 'tareas' | 'proyectos' | 'equipo') => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      {/* Toasts de notificación en tiempo real */}
      <ToastNotificacion toasts={toasts} onRemove={removeToast} />

      {/* Header mejorado */}
      <header className="dashboard-header">
        {/* Left Section: Logo + Navigation */}
        <div className="header-left-section">
          <div className="header-logo-area">
            <span className="logo-favicon-slot" aria-hidden="true">
              <img className="logo-favicon" src={faviconImage} alt="" />
            </span>
            <h1 className="logo">TimeScope</h1>
          </div>

          {/* Horizontal Navigation */}
          <nav className="header-nav" aria-label="Navegación principal">
            <button
              className={`nav-tab ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => handleTabClick('perfil')}
            >
              Mi Perfil
            </button>
            <button
              className={`nav-tab ${activeTab === 'tareas' ? 'active' : ''}`}
              onClick={() => handleTabClick('tareas')}
            >
              Tareas
            </button>
            <button
              className={`nav-tab ${activeTab === 'proyectos' ? 'active' : ''}`}
              onClick={() => handleTabClick('proyectos')}
            >
              Proyectos
            </button>
            {userRole?.toLowerCase() !== 'desarrollador' && (
              <button
                className={`nav-tab ${activeTab === 'equipo' ? 'active' : ''}`}
                onClick={() => handleTabClick('equipo')}
              >
                Equipo
              </button>
            )}
          </nav>
        </div>

        {/* Right Section: Search, Notifications, Avatar */}
        <div className="header-right-section">
          <SearchBar 
            onNavigate={handleTabClick} 
            onSelectOrg={setSelectedOrgId}
          />

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`notification-btn ${pendientesCount > 0 ? 'has-notifications' : ''}`}
              title="Notificaciones"
              aria-label="Notificaciones"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen(prev => !prev)}
            >
              <i className="bi bi-bell-fill dashboard-icon" />
            </button>
            {notifOpen && (
              <NotificacionesPanel
                onClose={() => setNotifOpen(false)}
                onPendientesChange={handlePendientesChange}
              />
            )}
          </div>

          {/* User Avatar with Dropdown */}
          <div className={`user-avatar-menu ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
            <button
              type="button"
              className="user-avatar"
              title={username}
              onClick={() => setIsDropdownOpen(prev => !prev)}
            >
              {userInitials}
            </button>
            <div className="user-dropdown">
              <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); setShowEditProfile(true); }}>
                <i className="bi bi-pencil-square" /> Editar perfil
              </button>
              <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); setShowChangePassword(true); }}>
                <i className="bi bi-key-fill" /> Cambiar contraseña
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right" /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

       <main className="dashboard-content">
         {activeTab === 'perfil' && <UserProfile />}
         {activeTab === 'tareas' && <TareasList />}
         {activeTab === 'proyectos' && <ProyectosList />}
         {activeTab === 'equipo' && <UsuariosList />}
       </main>

      {selectedOrgId !== null && (
        <OrganizacionModal orgId={selectedOrgId} onClose={() => setSelectedOrgId(null)} />
      )}

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
};

export default Dashboard;
