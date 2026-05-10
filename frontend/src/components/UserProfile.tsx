import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskCalendar from './TaskCalendar';
import TaskDetailModal from './TaskDetailModal';
import '../styles/UserProfile.css';

interface Task {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  proyecto?: string;
  horasEstimadas?: number;
  fechaLimite?: string;
  fechaCreacion?: string;
}

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  roles?: string[];
  organizacionId?: number;
}

interface TeamMember {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  roles?: string[];
}

interface MemberDetail {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  roles?: string[];
  proyectos?: string[];
  tareas?: string[];
}

const UserProfile: React.FC = () => {
  const { username } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgNombre, setOrgNombre] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  // ------------------------

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !username) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const BASE = 'http://localhost:8080/api/v1';

        // Usuario autenticado
        const userResponse = await fetch(`${BASE}/usuarios/me`, { headers });
        if (!userResponse.ok) throw new Error('No fue posible cargar el perfil de usuario');
        const userData: User = await userResponse.json();
        setUser(userData);

        // Tareas activas/abiertas y todas las tareas (en paralelo)
        const [tasksResponse, allTasksResponse] = await Promise.all([
          fetch(`${BASE}/tareas/me/activo`, { headers }),
          fetch(`${BASE}/tareas/me?size=100`, { headers }),
        ]);
        if (tasksResponse.ok) {
          const data = await tasksResponse.json();
          setTasks(Array.isArray(data) ? data : data.content ?? []);
        }
        if (allTasksResponse.ok) {
          const data = await allTasksResponse.json();
          setAllTasks(Array.isArray(data) ? data : data.content ?? []);
        }

        // Miembros del equipo y nombre de org (si tiene org)
        if (userData.organizacionId) {
          const [teamResponse, orgResponse] = await Promise.all([
            fetch(`${BASE}/organizaciones/${userData.organizacionId}/miembros`, { headers }),
            fetch(`${BASE}/organizaciones?id=${userData.organizacionId}&size=1`, { headers }),
          ]);
          if (teamResponse.ok) setTeamMembers(await teamResponse.json());
          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            const nombre = orgData?.content?.[0]?.nombre;
            if (nombre) setOrgNombre(nombre);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchUserData();
    else {
      setError('No se pudo identificar el usuario. Por favor, inicia sesión.');
      setLoading(false);
    }
  }, [username]);

  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleMemberClick = async (memberId: number) => {
    const token = localStorage.getItem('token');
    setMemberLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/usuarios/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSelectedMember(await res.json());
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading) return <div className="profile-container"><div className="loading-state"><div className="loading-spinner"></div></div></div>;
  if (error) return <div className="profile-container"><div className="error-state"><h2>Error</h2><p>{error}</p></div></div>;

  const pendingTasks = tasks;

  // --- PRODUCTIVITY CHART ---
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString('es-ES', { month: 'long' });

  // Calcular los lunes del mes actual para definir semanas reales (lun–dom)
  const firstDay = new Date(currentYear, currentMonth, 1);
  const firstMonday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay(); // 0=dom, 1=lun...
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  firstMonday.setDate(firstDay.getDate() + offsetToMonday);

  const weekStarts: Date[] = [];
  const d = new Date(firstMonday);
  while (d.getMonth() <= currentMonth && d.getFullYear() <= currentYear) {
    if (d.getMonth() === currentMonth || (d.getMonth() < currentMonth && new Date(d.getTime() + 6 * 86400000).getMonth() === currentMonth)) {
      weekStarts.push(new Date(d));
    }
    d.setDate(d.getDate() + 7);
    if (weekStarts.length >= 6) break;
  }

  const weekData = weekStarts.map((start, i) => {
    const end = new Date(start.getTime() + 7 * 86400000);
    return { completadas: 0, abiertas: 0, label: `S${i + 1}`, start, end };
  });

  allTasks.forEach(task => {
    if (!task.fechaLimite) return;
    const fecha = new Date(task.fechaLimite);
    const wi = weekData.findIndex(w => fecha >= w.start && fecha < w.end);
    if (wi === -1) return;
    if (task.estado === 'COMPLETADO') weekData[wi].completadas++;
    else weekData[wi].abiertas++;
  });

  const maxTotal = Math.max(...weekData.map(w => w.completadas + w.abiertas), 1);
  // --------------------------

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(pendingTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const visibleTasks = pendingTasks.slice(indexOfFirstTask, indexOfLastTask);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  // ------------------------

  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <div className="header-left-content">
            <div className="header-main">
              <div className="user-avatar-large">{user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}</div>
              <div className="user-info-expanded">
                <h1 className="user-name-large">{user?.nombres} {user?.apellidos}</h1>
                <div className="user-meta">
                  <span className="user-email-header">{user?.email}</span>
                </div>
                <div className="user-roles">
                  {user?.roles?.map(r => <span key={r} className={`role-badge role-${r.toLowerCase()}`}>{r.toUpperCase()}</span>) || <span className="role-badge role-miembro">MIEMBRO</span>}
                </div>
              </div>
            </div>
          </div>
          {orgNombre && <span className="user-org-name">{orgNombre}</span>}
        </div>

        <div className="profile-main-layout">
          <div className="profile-main-content">
            <section className="content-section">
              <div className="section-header">
                <div className="tasks-header-left">
                  <h2>Tareas pendientes</h2>
                  <p className="tasks-subtitle">{pendingTasks.length} abiertas · ordenadas por vencimiento</p>
                </div>
                <button className="tasks-filter-btn">Filtrar</button>
              </div>
              {pendingTasks.length > 0 ? (
                <div>
                  <div className="tasks-list">
                    {visibleTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`task-list-item status-${task.estado?.toLowerCase() || 'pendiente'}`}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="task-list-left">
                          <div className="task-list-title-row">
                            <h3 className="task-list-title">{task.nombre}</h3>
                            <span className={`status-badge status-${task.estado?.toLowerCase()}`}>{task.estado}</span>
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
                              {new Date(task.fechaLimite).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="tasks-pagination">
                      <button
                        className="pagination-btn"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        ◀ Anteriores
                      </button>
                      <span className="pagination-info">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Siguientes ▶
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-placeholder"><p>No hay tareas pendientes.</p></div>
              )}
            </section>
            <section className="content-section calendar-section-wrapper">
              <div className="section-header"><h2>Calendario</h2></div>
              <TaskCalendar tasks={tasks} />
            </section>
          </div>
          <aside className="profile-sidebar">
            <div className="sidebar-card productivity-card">
              <h3 className="sidebar-card-title">Productividad · {monthName}</h3>
              <p className="productivity-subtitle">Tareas completadas vs abiertas por semana</p>
              <div className="productivity-chart">
                {weekData.map((w) => {
                  const total = w.completadas + w.abiertas;
                  const compPct = total > 0 ? (w.completadas / maxTotal) * 100 : 0;
                  const abPct = total > 0 ? (w.abiertas / maxTotal) * 100 : 0;
                  return (
                    <div key={w.label} className="productivity-row">
                      <span className="productivity-label">{w.label}</span>
                      <div className="productivity-bars">
                        <div className="productivity-bar productivity-bar--completadas" style={{ width: `${compPct}%` }} />
                        <div className="productivity-bar productivity-bar--abiertas" style={{ width: `${abPct}%` }} />
                      </div>
                      <span className="productivity-count">{w.completadas}/{total}</span>
                    </div>
                  );
                })}
              </div>
              <div className="productivity-legend">
                <span className="legend-item"><span className="legend-dot legend-dot--completadas" />Completadas</span>
                <span className="legend-item"><span className="legend-dot legend-dot--abiertas" />Abiertas</span>
              </div>
            </div>
            <div className="sidebar-card team-card">
              <h3 className="sidebar-card-title">Miembros<span className="team-count">{teamMembers.length}</span></h3>
              <div className="team-members-list">
                {teamMembers.map(member => (
                  <div key={member.id} className="team-member-item">
                    <div
                      className={`team-member-avatar role-${member.roles?.[0]?.toLowerCase() || 'miembro'} team-member-avatar--clickable`}
                      onClick={() => handleMemberClick(member.id)}
                      title={`Ver perfil de ${member.nombres}`}
                    >
                      {member.nombres?.charAt(0)}{member.apellidos?.charAt(0)}
                    </div>
                    <div className="team-member-info">
                      <div className="team-member-name">{member.nombres} {member.apellidos}</div>
                      <div className="team-member-role">{member.roles?.[0]?.toUpperCase() || 'MIEMBRO'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {(selectedMember || memberLoading) && (
        <div className="member-modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="member-modal" onClick={e => e.stopPropagation()}>
            <button className="member-modal-close" onClick={() => setSelectedMember(null)}>✕</button>
            {memberLoading ? <div className="member-modal-loading">Cargando…</div> : selectedMember && (
              <>
                <div className="member-modal-header">
                  <div className={`member-modal-avatar role-${selectedMember.roles?.[0]?.toLowerCase() || 'miembro'}`}>
                    {selectedMember.nombres?.charAt(0)}{selectedMember.apellidos?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="member-modal-name">{selectedMember.nombres} {selectedMember.apellidos}</h3>
                    <span className="member-modal-username">@{selectedMember.username}</span>
                    <div className="member-modal-roles">
                      {selectedMember.roles?.map(r => <span key={r} className={`role-badge role-${r.toLowerCase()}`}>{r}</span>)}
                    </div>
                  </div>
                </div>
                <div className="member-modal-body">
                  <div className="member-modal-row">
                    <span className="member-modal-label">Email</span>
                    <span className="member-modal-value">{selectedMember.email}</span>
                  </div>
                  {selectedMember.proyectos?.length && (
                    <div className="member-modal-row">
                      <span className="member-modal-label">Proyectos ({selectedMember.proyectos.length})</span>
                      <div className="member-modal-tags">
                        {selectedMember.proyectos.map(p => <span key={p} className="member-modal-tag member-modal-tag--proyecto">{p}</span>)}
                      </div>
                    </div>
                  )}
                  {selectedMember.tareas?.length && (
                    <div className="member-modal-row">
                      <span className="member-modal-label">Tareas ({selectedMember.tareas.length})</span>
                      <div className="member-modal-tags">
                        {selectedMember.tareas.map(t => <span key={t} className="member-modal-tag member-modal-tag--tarea">{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;

