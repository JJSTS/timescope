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

interface Tarea {
  id: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
}

const ProyectoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'usuarios'>('info');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProyectoDetails();
  }, [id]);

  const fetchProyectoDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener detalles del proyecto
      const proyectoResponse = await axios.get(
        `http://localhost:8080/api/v1/proyectos/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProyecto(proyectoResponse.data);

      // Obtener todos los usuarios para mapear los IDs
      try {
        const usuariosResponse = await axios.get(
          `http://localhost:8080/api/v1/usuarios?page=0&size=100`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const todosLosUsuarios = Array.isArray(usuariosResponse.data)
          ? usuariosResponse.data
          : usuariosResponse.data.content || [];

        // Filtrar usuarios que pertenecen a este proyecto
        const usuariosDelProyecto = proyectoResponse.data.usuarios
          ? todosLosUsuarios.filter((u: Usuario) => proyectoResponse.data.usuarios?.includes(u.id))
          : [];

        setUsuarios(usuariosDelProyecto);
      } catch (usuariosError) {
        console.log('No se pudieron obtener usuarios:', usuariosError);
        setUsuarios([]);
      }
    } catch (error: any) {
      console.error('Error al obtener detalles del proyecto:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar el proyecto';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando detalles del proyecto...</div>;
  }

  if (error) {
    return (
      <div className="proyecto-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Volver a proyectos</button>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="proyecto-detail-error">
        <h2>Proyecto no encontrado</h2>
        <button onClick={() => navigate('/dashboard')}>Volver a proyectos</button>
      </div>
    );
  }

  const getEstadoClass = (estado?: string) => {
    return estado ? estado.toLowerCase() : 'desconocido';
  };

  return (
    <div className="proyecto-detail-page">
      {/* Header con navegación */}
      <header className="proyecto-detail-header-nav">
        <div className="header-left">
          <div className="header-logo-area">
            <span className="logo-favicon-slot">
              <img className="logo-favicon" src={faviconImage} alt="" />
            </span>
            <h1 className="logo">TimeScope</h1>
          </div>
          <button className="nav-back-btn" onClick={() => navigate('/dashboard')}>
            ← Volver a Proyectos
          </button>
        </div>
        <div className="header-right">
          <button className="user-dropdown-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            ⚙️
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { navigate('/dashboard'); setIsDropdownOpen(false); }}>
                Ir al Dashboard
              </button>
              <button onClick={() => { logout(); setIsDropdownOpen(false); }}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

       <div className="proyecto-detail-container">
         <div className="proyecto-detail-header">
           <h1>{proyecto.nombre}</h1>
           <span className={`estado-badge ${getEstadoClass(proyecto.estado)}`}>
             {proyecto.estado || 'Desconocido'}
           </span>
         </div>

         <div className="proyecto-detail-content">
        <div className="tabs-navigation">
          <button
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Información
          </button>
          <button
            className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            Equipo ({usuarios.length})
          </button>
        </div>

        {/* TAB: INFORMACIÓN */}
        {activeTab === 'info' && (
          <div className="tab-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>Descripción</h3>
                <p>{proyecto.descripcion || 'Sin descripción disponible'}</p>
              </div>

              <div className="info-card">
                <h3>Estado del Proyecto</h3>
                <div className="estado-info">
                  <span className={`estado-badge-large ${getEstadoClass(proyecto.estado)}`}>
                    {proyecto.estado || 'Sin estado'}
                  </span>
                </div>
              </div>

              <div className="info-card">
                <h3>Estadísticas</h3>
                <div className="stats">
                  <div className="stat">
                    <span className="stat-number">{usuarios.length}</span>
                    <span className="stat-label">Miembros del Equipo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="tab-content">
            {usuarios.length === 0 ? (
              <div className="empty-state">
                <p>No hay miembros asignados a este proyecto</p>
              </div>
            ) : (
              <div className="usuarios-grid">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="usuario-card">
                    <div className="usuario-avatar">
                      {usuario.nombres.charAt(0).toUpperCase()}
                      {usuario.apellidos.charAt(0).toUpperCase()}
                    </div>
                    <div className="usuario-info">
                      <h4>{usuario.nombres} {usuario.apellidos}</h4>
                      <p className="usuario-username">@{usuario.username}</p>
                      <p className="usuario-email">{usuario.email}</p>
                      {usuario.roles && usuario.roles.length > 0 && (
                        <div className="usuario-roles">
                          {usuario.roles.map((role, idx) => (
                            <span key={idx} className={`role-badge ${role.toLowerCase()}`}>
                              {role}
                            </span>
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

