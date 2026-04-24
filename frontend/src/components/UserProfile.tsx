import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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

  useEffect(() => {
    console.log('🔍 UserProfile mounted. Username:', username);
    console.log('🔍 Token en localStorage:', !!localStorage.getItem('token'));

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');

        console.log('📡 Iniciando fetchUserData...');
        console.log('Username:', username);
        console.log('Token:', token ? 'Existe' : 'NO EXISTE');

        if (!token) {
          setError('❌ No hay token en localStorage. Debes hacer login primero.');
          setLoading(false);
          return;
        }

        if (!username) {
          setError('❌ No hay username en el contexto. Contacta al soporte.');
          setLoading(false);
          return;
        }

        console.log('📡 Obteniendo datos del usuario:', username);

        // Obtener datos del usuario - usando el endpoint que existe: GET /api/v1/usuarios?username={username}
        const userUrl = `http://localhost:8080/api/v1/usuarios?username=${username}`;
        console.log('🔗 URL:', userUrl);

        const userResponse = await fetch(userUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📊 Response de usuario:', userResponse.status, userResponse.statusText);

        if (!userResponse.ok) {
          const errorData = await userResponse.text();
          console.error('❌ Error response body:', errorData);
          throw new Error(`Error ${userResponse.status}: ${userResponse.statusText}. ${errorData}`);
        }

        const userPageResponse = await userResponse.json();
        console.log('✅ User Page Response:', userPageResponse);

        // El endpoint devuelve un PageResponse, necesitamos extraer el usuario del array
        let userData = null;
        if (userPageResponse.content && userPageResponse.content.length > 0) {
          userData = userPageResponse.content[0];
          console.log('✅ Datos del usuario obtenidos:', userData);
          setUser(userData);
        } else {
          throw new Error('Usuario no encontrado en la respuesta');
        }

        // Obtener tareas del usuario (URL ABSOLUTA)
        console.log('📡 Obteniendo tareas...');
        const tasksUrl = `http://localhost:8080/api/v1/tareas`;
        console.log('🔗 URL:', tasksUrl);

        const tasksResponse = await fetch(tasksUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📊 Response de tareas:', tasksResponse.status, tasksResponse.statusText);

        if (tasksResponse.ok) {
          const tasksPageResponse = await tasksResponse.json();
          console.log('✅ Tasks Page Response:', tasksPageResponse);

          // El endpoint devuelve un PageResponse, extraer el array de content
          if (tasksPageResponse.content && Array.isArray(tasksPageResponse.content)) {
            const tasksArray = tasksPageResponse.content.slice(0, 5); // Limitar a 5 tareas
            console.log('✅ Tareas obtenidas (primeras 5):', tasksArray);
            setTasks(tasksArray);
          } else {
            console.warn('⚠️ No hay tareas en la respuesta o formato incorrecto');
            setTasks([]);
          }
        } else {
          console.warn('⚠️ No se pudieron obtener tareas:', tasksResponse.status);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('🔴 Error en fetchUserData:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      console.log('✅ Username existe, iniciando fetch...');
      fetchUserData();
    } else {
      console.warn('⚠️ Username es undefined o vacío');
      setError('❌ No se pudo obtener el nombre de usuario. Intenta hacer login nuevamente.');
      setLoading(false);
    }
  }, [username]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Cargando perfil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h2>❌ Error al cargar perfil</h2>
          <p><strong>Detalles:</strong> {error}</p>
          <p style={{fontSize: '0.9rem', marginTop: '1rem', color: '#666'}}>
            Abre DevTools (F12) y revisa la Console para más información.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Sección de Bienvenida */}
      <section className="welcome-section">
        <div className="welcome-card">
          <div className="welcome-content">
            <div className="avatar">
              <span>{user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}</span>
            </div>
            <div className="welcome-info">
              <h1 className="welcome-title">¡Hola de nuevo, {user?.nombres}!</h1>
              <p className="user-email">📧 {user?.email}</p>
              <div className="user-role-badge">{user?.rol || 'DESARROLLADOR'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarjetas de Métricas Rápidas */}
      <section className="metrics-section">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">✓</div>
            <div className="metric-content">
              <h3 className="metric-label">Tareas Pendientes</h3>
              <p className="metric-value">{tasks.filter(t => t.estado === 'ACTIVO').length}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📋</div>
            <div className="metric-content">
              <h3 className="metric-label">Proyectos Activos</h3>
              <p className="metric-value">3</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-content">
              <h3 className="metric-label">Horas Esta Semana</h3>
              <p className="metric-value">24.5</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <h3 className="metric-label">Completadas</h3>
              <p className="metric-value">{tasks.filter(t => t.estado === 'COMPLETADO').length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Layout principal: Contenido + Sidebar */}
      <div className="profile-main-layout">
        {/* Mis Tareas de Hoy */}
        <section className="tasks-section">
          <h2 className="section-title">Mis Tareas Próximas</h2>
          <div className="tasks-container">
            {tasks.length > 0 ? (
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Proyecto</th>
                    <th>Estado</th>
                    <th>Fecha Límite</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className={`task-row task-${task.estado.toLowerCase()}`}>
                      <td className="task-name">
                        <span className="task-title">{task.nombre}</span>
                        <p className="task-description">{task.descripcion}</p>
                      </td>
                      <td className="task-project">{task.proyecto || '-'}</td>
                      <td className="task-status">
                        <span className={`status-badge status-${task.estado.toLowerCase()}`}>
                          {task.estado}
                        </span>
                      </td>
                      <td className="task-date">{task.fechaLimite || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-tasks">
                <p>No tienes tareas asignadas en este momento.</p>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar: Detalles de la Cuenta */}
        <aside className="account-sidebar">
          <div className="account-card">
            <h3 className="sidebar-title">Detalles de la Cuenta</h3>
            <div className="account-details">
              <div className="detail-item">
                <span className="detail-label">ID de Empleado</span>
                <span className="detail-value">{user?.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Usuario</span>
                <span className="detail-value">@{user?.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nombre Completo</span>
                <span className="detail-value">{user?.nombres} {user?.apellidos}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Correo</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Rol</span>
                <span className="detail-value badge">{user?.rol || 'DESARROLLADOR'}</span>
              </div>
            </div>

            <div className="sidebar-actions">
              <button className="btn-secondary">Editar Perfil</button>
              <button className="btn-outline">Cambiar Contraseña</button>
            </div>
          </div>

          <div className="quick-stats">
            <h3 className="sidebar-title">Estadísticas Rápidas</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span>Total de Tareas</span>
                <strong>{tasks.length}</strong>
              </div>
              <div className="stat-item">
                <span>En Progreso</span>
                <strong>{tasks.filter(t => t.estado === 'ACTIVO').length}</strong>
              </div>
              <div className="stat-item">
                <span>Completadas</span>
                <strong>{tasks.filter(t => t.estado === 'COMPLETADO').length}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UserProfile;

