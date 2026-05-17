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
import CrearOrganizacionModal from './CrearOrganizacionModal';
import { useWebSocketNotif } from '../hooks/useWebSocketNotif';
import '../styles/Dashboard.css';
import faviconImage from '../images/Favicon.png';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, username, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'tareas' | 'proyectos' | 'equipo'>('perfil');
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCrearOrg, setShowCrearOrg] = useState(false);
  const [pendientesCount, setPendientesCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [userInitials, setUserInitials] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [organizacionId, setOrganizacionId] = useState<number | null | undefined>(undefined);
  const [solicitudOrg, setSolicitudOrg] = useState('');
  const [solicitudLoading, setSolicitudLoading] = useState(false);
  const [solicitudMsg, setSolicitudMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [orgSugerencias, setOrgSugerencias] = useState<string[]>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const toastIdRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const orgSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!username) return;
    const initials = username
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    setUserInitials(initials || username.charAt(0).toUpperCase());
  }, [username]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${process.env.REACT_APP_API_URL}/usuarios/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setOrganizacionId(data?.organizacionId ?? null))
      .catch(() => setOrganizacionId(null));
  }, [username]);

  const handlePendientesChange = useCallback((count: number) => {
    setPendientesCount(count);
  }, []);

  const handleNuevaNotificacion = useCallback((mensaje: string) => {
    setPendientesCount(prev => prev + 1);
    setToasts(prev => [...prev, { id: ++toastIdRef.current, mensaje }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useWebSocketNotif(username, handleNuevaNotificacion);

  const handleOrgSearchChange = (value: string) => {
    setSolicitudOrg(value);
    if (orgSearchTimeout.current) clearTimeout(orgSearchTimeout.current);
    if (!value.trim()) { setOrgSugerencias([]); setShowOrgDropdown(false); return; }
    orgSearchTimeout.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/organizaciones?nombre=${encodeURIComponent(value.trim())}&page=0&size=6`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const nombres: string[] = (data.content ?? []).map((o: any) => o.nombre);
        setOrgSugerencias(nombres);
        setShowOrgDropdown(nombres.length > 0);
      } catch {}
    }, 300);
  };

  const handleEnviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitudOrg.trim()) return;
    setSolicitudLoading(true);
    setSolicitudMsg(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/solicitud/enviar/${encodeURIComponent(solicitudOrg.trim())}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Error al enviar solicitud');
      }
      setSolicitudMsg({ type: 'ok', text: `Solicitud enviada a "${solicitudOrg.trim()}". Espera a que un director la acepte.` });
      setSolicitudOrg('');
    } catch (err: any) {
      setSolicitudMsg({ type: 'err', text: err.message });
    } finally {
      setSolicitudLoading(false);
    }
  };

  if (organizacionId === null) {
    return (
      <div className="dashboard-container">
        <ToastNotificacion toasts={toasts} onRemove={removeToast} />

        <header className="dashboard-header">
          <div className="header-left-section">
            <div className="header-logo-area">
              <span className="logo-favicon-slot"><img className="logo-favicon" src={faviconImage} alt="" /></span>
              <h1 className="logo">TimeScope</h1>
            </div>
          </div>
          <div className="header-right-section">
            <div className={`user-avatar-menu ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
              <button type="button" className="user-avatar" title={username} onClick={() => setIsDropdownOpen(prev => !prev)}>
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
                <button className="dropdown-item dropdown-item--danger" onClick={logout}>
                  <i className="bi bi-box-arrow-right" /> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="no-org-screen">
            <div className="no-org-icon"><i className="bi bi-building" /></div>
            <h2 className="no-org-title">Bienvenido, {username}</h2>
            <p className="no-org-subtitle">Aún no perteneces a ninguna organización. Crea la tuya o solicita unirte a una existente.</p>

            <div className="no-org-options">
              <div className="no-org-card">
                <i className="bi bi-plus-circle no-org-card-icon" />
                <h3>Crear organización</h3>
                <p>Funda tu propia organización y serás su DIRECTOR.</p>
                <button className="no-org-btn no-org-btn--create" onClick={() => setShowCrearOrg(true)}>
                  Crear organización
                </button>
              </div>

              <div className="no-org-card">
                <i className="bi bi-send no-org-card-icon" />
                <h3>Solicitar unirse</h3>
                <p>Envía una solicitud a una organización existente y espera la aprobación del director.</p>
                <form className="no-org-join-form" onSubmit={handleEnviarSolicitud}>
                  <div className="no-org-search-wrap">
                    <input
                      className="no-org-input"
                      type="text"
                      placeholder="Buscar organización..."
                      value={solicitudOrg}
                      onChange={e => handleOrgSearchChange(e.target.value)}
                      onFocus={() => orgSugerencias.length > 0 && setShowOrgDropdown(true)}
                      onBlur={() => setTimeout(() => setShowOrgDropdown(false), 150)}
                      disabled={solicitudLoading}
                      autoComplete="off"
                      required
                    />
                    {showOrgDropdown && (
                      <ul className="no-org-dropdown">
                        {orgSugerencias.map(nombre => (
                          <li
                            key={nombre}
                            className="no-org-dropdown-item"
                            onMouseDown={() => { setSolicitudOrg(nombre); setShowOrgDropdown(false); }}
                          >
                            <i className="bi bi-building" /> {nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="no-org-btn no-org-btn--join"
                    disabled={solicitudLoading || !solicitudOrg.trim()}
                  >
                    {solicitudLoading ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </form>
                {solicitudMsg && (
                  <p className={`no-org-msg no-org-msg--${solicitudMsg.type}`}>{solicitudMsg.text}</p>
                )}
              </div>
            </div>
          </div>
        </main>

        {showCrearOrg && (
          <CrearOrganizacionModal
            onClose={() => setShowCrearOrg(false)}
            onCreated={() => {}}
          />
        )}
        {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
        {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ToastNotificacion toasts={toasts} onRemove={removeToast} />

      <header className="dashboard-header">
        <div className="header-left-section">
          <div className="header-logo-area">
            <span className="logo-favicon-slot" aria-hidden="true">
              <img className="logo-favicon" src={faviconImage} alt="" />
            </span>
            <h1 className="logo">TimeScope</h1>
          </div>

          <nav className="header-nav" aria-label="Navegación principal">
            <button className={`nav-tab ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>
              Mi Perfil
            </button>
            <button className={`nav-tab ${activeTab === 'tareas' ? 'active' : ''}`} onClick={() => setActiveTab('tareas')}>
              Tareas
            </button>
            <button className={`nav-tab ${activeTab === 'proyectos' ? 'active' : ''}`} onClick={() => setActiveTab('proyectos')}>
              Proyectos
            </button>
            {userRole?.toLowerCase() !== 'desarrollador' && (
              <button className={`nav-tab ${activeTab === 'equipo' ? 'active' : ''}`} onClick={() => setActiveTab('equipo')}>
                Equipo
              </button>
            )}
          </nav>
        </div>

        <div className="header-right-section">
          <div className="header-search-wrapper">
            <SearchBar onNavigate={setActiveTab} onSelectOrg={setSelectedOrgId} />
          </div>

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
              <NotificacionesPanel onClose={() => setNotifOpen(false)} onPendientesChange={handlePendientesChange} />
            )}
          </div>

          <div className={`user-avatar-menu ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
            <button type="button" className="user-avatar" title={username} onClick={() => setIsDropdownOpen(prev => !prev)}>
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
              <button className="dropdown-item dropdown-item--danger" onClick={logout}>
                <i className="bi bi-box-arrow-right" /> Cerrar sesión
              </button>
            </div>
          </div>

          <button
            type="button"
            className="menu-btn mobile-only"
            aria-label="Menú"
            aria-expanded={showMobileMenu}
            onClick={() => setShowMobileMenu(prev => !prev)}
          >
            <i className={`bi ${showMobileMenu ? 'bi-x-lg' : 'bi-list'} dashboard-icon`} />
          </button>
        </div>

        {showMobileMenu && (
          <div className="mobile-menu">
            <button className={`mobile-menu-item ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => { setActiveTab('perfil'); setShowMobileMenu(false); }}>
              <i className="bi bi-person" /> Mi Perfil
            </button>
            <button className={`mobile-menu-item ${activeTab === 'tareas' ? 'active' : ''}`}
              onClick={() => { setActiveTab('tareas'); setShowMobileMenu(false); }}>
              <i className="bi bi-check2-square" /> Tareas
            </button>
            <button className={`mobile-menu-item ${activeTab === 'proyectos' ? 'active' : ''}`}
              onClick={() => { setActiveTab('proyectos'); setShowMobileMenu(false); }}>
              <i className="bi bi-folder" /> Proyectos
            </button>
            {userRole?.toLowerCase() !== 'desarrollador' && (
              <button className={`mobile-menu-item ${activeTab === 'equipo' ? 'active' : ''}`}
                onClick={() => { setActiveTab('equipo'); setShowMobileMenu(false); }}>
                <i className="bi bi-people" /> Equipo
              </button>
            )}
            <hr />
            <button className="mobile-menu-item logout" onClick={logout}>
              <i className="bi bi-box-arrow-right" /> Cerrar sesión
            </button>
          </div>
        )}
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
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
    </div>
  );
};

export default Dashboard;
