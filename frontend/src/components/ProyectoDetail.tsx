import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ProyectoDetail.css';
import faviconImage from '../images/Favicon.png';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
  usuarios?: number[];
  membrosCount?: number;
  tareasCount?: number;
  liderNombre?: string;
  isDeleted?: boolean;
}

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  roles: string[];
}

const estadoMeta: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVO:     { label: 'Activo',     bg: '#ecfdf5', color: '#065f46' },
  COMPLETADO: { label: 'Completado', bg: '#eff6ff', color: '#1d4ed8' },
  SUSPENDIDO: { label: 'Suspendido', bg: '#fffbeb', color: '#92400e' },
};

const ProyectoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'equipo'>('info');

  // addUsuario state
  const [addUsername, setAddUsername] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const isDirector = userRole?.toUpperCase() === 'DIRECTOR';

  useEffect(() => {
    fetchProyecto();
  }, [id]);

  const fetchProyecto = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: proy } = await axios.get<Proyecto>(
        `http://localhost:8080/api/v1/proyectos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProyecto(proy);

      if (proy.usuarios && proy.usuarios.length > 0) {
        try {
          const { data: usersPage } = await axios.get(
            `http://localhost:8080/api/v1/usuarios?page=0&size=100`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const todos: Usuario[] = Array.isArray(usersPage) ? usersPage : usersPage.content ?? [];
          setUsuarios(todos.filter(u => proy.usuarios!.includes(u.id)));
        } catch {
          setUsuarios([]);
        }
      } else {
        setUsuarios([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim()) return;
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      await axios.put(
        `http://localhost:8080/api/v1/proyectos/usuario/${id}?username=${encodeURIComponent(addUsername.trim())}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddSuccess(`Usuario "${addUsername.trim()}" añadido correctamente.`);
      setAddUsername('');
      fetchProyecto();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'No se pudo añadir el usuario.');
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-loading">Cargando proyecto...</div>
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="pd-page">
        <div className="pd-error-box">
          <p>{error ?? 'Proyecto no encontrado'}</p>
          <button onClick={() => navigate('/dashboard')}>Volver al Dashboard</button>
        </div>
      </div>
    );
  }

  const meta = estadoMeta[proyecto.estado ?? ''];

  return (
    <div className="pd-page">

      {/* Nav */}
      <header className="pd-nav">
        <div className="pd-nav-left">
          <span className="pd-logo-slot">
            <img src={faviconImage} alt="" className="pd-favicon" />
          </span>
          <span className="pd-logo-text">TimeScope</span>
          <button className="pd-back-btn" onClick={() => navigate('/dashboard')}>
            ← Volver
          </button>
        </div>
      </header>

      <div className="pd-container">

        {/* Hero del proyecto */}
        <div className="pd-hero">
          <div className="pd-hero-left">
            <span className="pd-hero-id">#{proyecto.id}</span>
            <h1 className="pd-hero-title">{proyecto.nombre}</h1>
            {proyecto.liderNombre && (
              <span className="pd-hero-lider">Líder: {proyecto.liderNombre}</span>
            )}
          </div>
          <span
            className="pd-hero-badge"
            style={{ background: meta?.bg ?? '#f3f4f6', color: meta?.color ?? '#6b7280' }}
          >
            {meta?.label ?? proyecto.estado ?? '—'}
          </span>
        </div>

        {/* Métricas rápidas */}
        <div className="pd-metrics">
          <div className="pd-metric">
            <span className="pd-metric-value">{proyecto.membrosCount ?? usuarios.length}</span>
            <span className="pd-metric-label">Miembros</span>
          </div>
          <div className="pd-metric-divider" />
          <div className="pd-metric">
            <span className="pd-metric-value">{proyecto.tareasCount ?? 0}</span>
            <span className="pd-metric-label">Tareas</span>
          </div>
          <div className="pd-metric-divider" />
          <div className="pd-metric">
            <span className="pd-metric-value" style={{ fontSize: '0.95rem' }}>
              {meta?.label ?? proyecto.estado ?? '—'}
            </span>
            <span className="pd-metric-label">Estado</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="pd-card">
          <div className="pd-tabs">
            <button
              className={`pd-tab ${activeTab === 'info' ? 'pd-tab--active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Información
            </button>
            <button
              className={`pd-tab ${activeTab === 'equipo' ? 'pd-tab--active' : ''}`}
              onClick={() => setActiveTab('equipo')}
            >
              Equipo ({proyecto.membrosCount ?? usuarios.length})
            </button>
          </div>

          {/* TAB: INFORMACIÓN */}
          {activeTab === 'info' && (
            <div className="pd-tab-content">
              <div className="pd-info-grid">

                <div className="pd-info-block">
                  <span className="pd-info-label">Descripción</span>
                  <p className="pd-info-text">
                    {proyecto.descripcion || <span className="pd-empty">Sin descripción registrada</span>}
                  </p>
                </div>

                <div className="pd-info-block">
                  <span className="pd-info-label">Estado</span>
                  <span
                    className="pd-info-badge"
                    style={{ background: meta?.bg ?? '#f3f4f6', color: meta?.color ?? '#6b7280' }}
                  >
                    {meta?.label ?? proyecto.estado ?? '—'}
                  </span>
                </div>

                <div className="pd-info-block">
                  <span className="pd-info-label">Líder del proyecto</span>
                  <span className="pd-info-text">
                    {proyecto.liderNombre ?? <span className="pd-empty">Sin líder asignado</span>}
                  </span>
                </div>

                <div className="pd-info-block">
                  <span className="pd-info-label">Miembros</span>
                  <span className="pd-info-text">{proyecto.membrosCount ?? usuarios.length} persona(s)</span>
                </div>

                <div className="pd-info-block">
                  <span className="pd-info-label">Tareas</span>
                  <span className="pd-info-text">{proyecto.tareasCount ?? 0} tarea(s) registrada(s)</span>
                </div>

              </div>
            </div>
          )}

          {/* TAB: EQUIPO */}
          {activeTab === 'equipo' && (
            <div className="pd-tab-content">

              {/* Formulario añadir usuario — solo DIRECTOR */}
              {isDirector && (
                <form className="pd-add-form" onSubmit={handleAddUsuario}>
                  <span className="pd-add-label">Añadir miembro al proyecto</span>
                  <div className="pd-add-row">
                    <input
                      className="pd-add-input"
                      type="text"
                      placeholder="Username del usuario"
                      value={addUsername}
                      onChange={e => { setAddUsername(e.target.value); setAddError(null); setAddSuccess(null); }}
                      disabled={addLoading}
                    />
                    <button className="pd-add-btn" type="submit" disabled={addLoading || !addUsername.trim()}>
                      {addLoading ? 'Añadiendo…' : 'Añadir'}
                    </button>
                  </div>
                  {addError   && <p className="pd-add-error">{addError}</p>}
                  {addSuccess && <p className="pd-add-success">{addSuccess}</p>}
                </form>
              )}

              {/* Lista de miembros */}
              {usuarios.length === 0 ? (
                <div className="pd-empty-state">
                  <p>No hay miembros asignados a este proyecto</p>
                </div>
              ) : (
                <div className="pd-usuarios-grid">
                  {usuarios.map(u => (
                    <div key={u.id} className="pd-usuario-card">
                      <div className="pd-avatar">
                        {u.nombres.charAt(0).toUpperCase()}{u.apellidos.charAt(0).toUpperCase()}
                      </div>
                      <div className="pd-usuario-info">
                        <p className="pd-usuario-nombre">{u.nombres} {u.apellidos}</p>
                        <p className="pd-usuario-username">@{u.username}</p>
                        <p className="pd-usuario-email">{u.email}</p>
                        {u.roles?.length > 0 && (
                          <div className="pd-roles">
                            {u.roles.map((r, i) => (
                              <span key={i} className={`pd-role pd-role--${r.toLowerCase()}`}>{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProyectoDetail;
