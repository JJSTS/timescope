import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskCalendar from './TaskCalendar';
import ChangePasswordModal from './ChangePasswordModal';
import '../styles/UserProfile.css';

interface Task {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  proyecto?: string;
  fechaLimite?: string;
}

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  roles?: string[];  // Array de roles
}

const UserProfile: React.FC = () => {
  const { username } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token || !username) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }

        const userUrl = `http://localhost:8080/api/v1/usuarios?username=${username}`;

        const userResponse = await fetch(userUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          throw new Error('No fue posible cargar el perfil de usuario');
        }

        const userPageResponse = await userResponse.json();

        let userData = null;
        if (userPageResponse.content && userPageResponse.content.length > 0) {
          userData = userPageResponse.content[0];
          setUser(userData);
        } else {
          throw new Error('Usuario no encontrado');
        }

        // Obtener tareas del usuario autenticado (solo ACTIVAS)
        const tasksUrl = `http://localhost:8080/api/v1/tareas/me/activo`;

        const tasksResponse = await fetch(tasksUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();

          // El endpoint /tareas/me/activo retorna un array directo
          const tasksArray = Array.isArray(tasksData) ? tasksData : (tasksData.content || []);
          console.log('Tareas recibidas:', tasksArray);
          setTasks(tasksArray);
        } else {
          console.error('Error en tasksResponse:', tasksResponse.status);
          const errorText = await tasksResponse.text();
          console.error('Detalle del error:', errorText);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    } else {
      setError('No se pudo identificar el usuario. Por favor, inicia sesión.');
      setLoading(false);
    }
  }, [username]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks; // Ya están filtradas como ACTIVAS desde el endpoint
  const completedTasks = tasks.filter(t => t.estado === 'COMPLETADO');

  // Funciones para el carousel
  const handleNextTasks = () => {
    if (currentTaskIndex + 5 < pendingTasks.length) {
      setCurrentTaskIndex(currentTaskIndex + 5);
    }
  };

  const handlePrevTasks = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(Math.max(0, currentTaskIndex - 5));
    }
  };

  // Tareas visibles (máximo 5 por página)
  const visibleTasks = pendingTasks.slice(currentTaskIndex, currentTaskIndex + 5);

  return (
    <>
    <div className="profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="user-intro">
          <div className="user-avatar-small">
            {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
          </div>
          <div className="user-info">
            <h1 className="user-name">{user?.nombres} {user?.apellidos}</h1>
            <div className="user-roles">
              {user?.roles && user.roles.length > 0
                ? user.roles.map(r => (
                    <span key={r} className={`role-badge role-${r.toLowerCase()}`}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </span>
                  ))
                : <span className="role-badge role-miembro">Miembro</span>
              }
            </div>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="profile-main-layout">

        <div className="profile-main-content">

          <section className="content-section">
            <div className="section-header">
              <div className="tasks-header-left">
                <h2>Tareas pendientes</h2>
                <p className="tasks-subtitle">
                  {pendingTasks.length} abiertas · ordenadas por vencimiento
                </p>
              </div>
              <button className="tasks-filter-btn">
                Filtrar
              </button>
            </div>

            {pendingTasks.length > 0 ? (
              <div>
                {/* Tasks List */}
                <div className="tasks-list">
                  {visibleTasks.map((task) => (
                    <div key={task.id} className="task-list-item">
                      <div className="task-list-left">
                        <div className="task-list-title-row">
                          <h3 className="task-list-title">{task.nombre}</h3>
                          <span className={`status-badge status-${task.estado?.toLowerCase()}`}>
                            {task.estado === 'ACTIVO' ? 'Activo' : 
                             task.estado === 'ABIERTO' ? 'Abierto' :
                             task.estado === 'COMPLETADO' ? 'Completado' : 
                             task.estado}
                          </span>
                        </div>
                        <p className="task-list-description">{task.descripcion}</p>
                      </div>
                      
                      <div className="task-list-right">
                        {task.proyecto && (
                          <div className="task-list-category">
                            <span className="category-label">PROYECTO</span>
                            <span className="category-value">{task.proyecto}</span>
                          </div>
                        )}
                        
                        {task.fechaLimite && (
                          <div className="task-list-date">
                            {new Date(task.fechaLimite).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination controls */}
                {pendingTasks.length > 5 && (
                  <div className="tasks-pagination">
                    <button
                      className="pagination-btn"
                      onClick={handlePrevTasks}
                      disabled={currentTaskIndex === 0}
                    >
                      ◀ Anteriores
                    </button>
                    <span className="pagination-info">
                      Tareas {currentTaskIndex + 1}-{Math.min(currentTaskIndex + 5, pendingTasks.length)} de {pendingTasks.length}
                    </span>
                    <button
                      className="pagination-btn"
                      onClick={handleNextTasks}
                      disabled={currentTaskIndex + 5 >= pendingTasks.length}
                    >
                      Siguientes ▶
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-placeholder">
                <p>No hay tareas pendientes en este momento.</p>
              </div>
            )}
          </section>

          <section className="content-section calendar-section-wrapper">
            <div className="section-header">
              <h2>Calendario</h2>
            </div>
            <TaskCalendar tasks={tasks} />
          </section>
        </div>

        {/* Right Column - Sidebar (30%) */}
        <aside className="profile-sidebar">

          {/* User Details Card */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Información del perfil</h3>
            <div className="detail-row">
              <span className="detail-label">ID de empleado</span>
              <span className="detail-value">{user?.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Usuario</span>
              <span className="detail-value">{user?.username}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Correo</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Roles</span>
              <div className="detail-roles-container">
                {user?.roles && user.roles.length > 0
                  ? user.roles.map(r => (
                      <span key={r} className={`role-badge role-${r.toLowerCase()}`}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </span>
                    ))
                  : <span className="role-badge role-miembro">Miembro</span>
                }
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="sidebar-card actions-card">
            <button className="action-btn primary">Editar perfil</button>
            <button className="action-btn secondary" onClick={() => setShowChangePassword(true)}>
              Cambiar contraseña
            </button>
          </div>
        </aside>
      </div>
    </div>

    {showChangePassword && (
      <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
    )}
    </>
  );
};

export default UserProfile;

