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
  rol?: string;
}

const UserProfile: React.FC = () => {
  const { username } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

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

        // Obtener tareas
        const tasksUrl = `http://localhost:8080/api/v1/tareas`;

        const tasksResponse = await fetch(tasksUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (tasksResponse.ok) {
          const tasksPageResponse = await tasksResponse.json();

          if (tasksPageResponse.content && Array.isArray(tasksPageResponse.content)) {
            const tasksArray = tasksPageResponse.content.slice(0, 5);
            setTasks(tasksArray);
          } else {
            setTasks([]);
          }
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

  const pendingTasks = tasks.filter(t => t.estado === 'ACTIVO');
  const completedTasks = tasks.filter(t => t.estado === 'COMPLETADO');

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
            <p className="user-meta">{user?.rol || 'Miembro del equipo'}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="profile-main-layout">

        <div className="profile-main-content">

          <section className="content-section">
            <div className="section-header">
              <h2>Tareas pendientes</h2>
              <span className="count-badge">{pendingTasks.length}</span>
            </div>

            {pendingTasks.length > 0 ? (
              <div className="tasks-grid">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-card-header">
                      <h3>{task.nombre}</h3>
                      {task.proyecto && <span className="project-tag">{task.proyecto}</span>}
                    </div>
                    <p className="task-description">{task.descripcion}</p>
                    {task.fechaLimite && (
                      <div className="task-meta">
                        <span className="meta-label">Vencimiento:</span>
                        <span className="meta-value">
                          {new Date(task.fechaLimite).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
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
              <span className="detail-label">Rol</span>
              <span className="detail-value">{user?.rol || 'Miembro'}</span>
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

