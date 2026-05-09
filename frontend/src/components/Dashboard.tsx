import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import ChangePasswordModal from './ChangePasswordModal';
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, username, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'tareas' | 'proyectos' | 'equipo'>('perfil');
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendientesCount, setPendientesCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [userInitials, setUserInitials] = useState('');
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [orgNombre, setOrgNombre] = useState<string | null>(null);
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

  // Obtener iniciales del usuario + nombre de organización
  useEffect(() => {
    if (!username) return;
    const initials = username
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    setUserInitials(initials || username.charAt(0).toUpperCase());

    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:8080/api/v1/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(async userData => {
        if (!userData?.organizacionId) return;
        const orgRes = await fetch(
          `http://localhost:8080/api/v1/organizaciones?id=${userData.organizacionId}&size=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!orgRes.ok) return;
        const orgData = await orgRes.json();
        const nombre = orgData?.content?.[0]?.nombre;
        if (nombre) setOrgNombre(nombre);
      })
      .catch(() => {});
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

  const handleTabClick = (tab: 'perfil' | 'tareas' | 'proyectos' | 'equipo', highlightId?: number) => {
    setActiveTab(tab);
    if (highlightId !== undefined) {
      setHighlightedId(highlightId);
    }
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

        {/* Center Section: Org name */}
        {orgNombre && (
          <div className="header-center-section">
            <span className="header-org-name">{orgNombre}</span>
          </div>
        )}

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
              <BellIcon className="dashboard-icon" />
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
              <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); setShowChangePassword(true); }}>
                🔐 Cambiar contraseña
              </button>
              <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); setActiveTab('perfil'); }}>
                ✏️ Editar perfil
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {activeTab === 'perfil' && <UserProfile />}
        {activeTab === 'tareas' && <TareasList highlightedId={highlightedId} />}
        {activeTab === 'proyectos' && <ProyectosList highlightedId={highlightedId} />}
        {activeTab === 'equipo' && <UsuariosList />}
      </main>

      {selectedOrgId !== null && (
        <OrganizacionModal orgId={selectedOrgId} onClose={() => setSelectedOrgId(null)} />
      )}

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

export default Dashboard;
