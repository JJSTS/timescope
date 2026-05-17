import React, { useState, useEffect, useRef } from 'react';
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
  fechaInicio?: string;
  fechaFin?: string;
  usuario?: string;
  creador?: string;
  proyectoNombre?: string;
}

interface User {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  rol?: string;
  organizacionId?: number;
}

interface TeamMember {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  rol?: string;
}

interface MemberDetail {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  rol?: string;
  proyectos?: string[];
  tareas?: string[];
}

const ROLE_LEVEL: Record<string, number> = { DIRECTOR: 3, LIDER: 2, COORDINADOR: 1, DESARROLLADOR: 1 };

const UserProfile: React.FC = () => {
  const { username, userRole } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgNombre, setOrgNombre] = useState<string | null>(null);
  const [orgAdmin, setOrgAdmin] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterFecha, setFilterFecha] = useState<'asc' | 'desc' | 'none'>('none');
  const [filterEstados, setFilterEstados] = useState<string[]>(['ACTIVO', 'ABIERTO']);
  const [filterUsuario, setFilterUsuario] = useState('');
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const reloadTasks = async (rol: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const isLeader = ['DIRECTOR', 'LIDER'].includes(rol?.toUpperCase() ?? '');
    const url = isLeader
      ? `${process.env.REACT_APP_API_URL}/tareas?size=100`
      : `${process.env.REACT_APP_API_URL}/tareas/me?size=100`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      const fetched: Task[] = Array.isArray(data) ? data : data.content || [];
      setAllTasks(fetched);
      setTasks(fetched.filter(t => t.estado === 'ACTIVO' || t.estado === 'ABIERTO'));
    }
  };

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
        const BASE = `${process.env.REACT_APP_API_URL}`;

        const userResponse = await fetch(`${BASE}/usuarios/me`, { headers });
        if (!userResponse.ok) throw new Error('No fue posible cargar el perfil de usuario');
        const userData: User = await userResponse.json();
        setUser(userData);

        await reloadTasks(userData.rol ?? '');

        if (userData.organizacionId) {
          const [teamResponse, orgResponse] = await Promise.all([
            fetch(`${BASE}/organizaciones/${userData.organizacionId}/miembros`, { headers }),
            fetch(`${BASE}/organizaciones?id=${userData.organizacionId}&size=1`, { headers }),
          ]);
          if (teamResponse.ok) setTeamMembers(await teamResponse.json());
          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            const org = orgData?.content?.[0];
            if (org?.nombre) setOrgNombre(org.nombre);
            if (org?.userAdmin) setOrgAdmin(org.userAdmin);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  useEffect(() => { setCurrentPage(1); }, [filterEstados, filterFecha, filterUsuario]);

  const toggleEstado = (estado: string) => {
    setFilterEstados(prev =>
      prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado]
    );
  };

  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleMemberClick = async (memberId: number) => {
    const token = localStorage.getItem('token');
    setMemberLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/usuarios/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSelectedMember(await res.json());
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading) return <div className="profile-container"><div className="loading-state"><div className="loading-spinner"></div></div></div>;
  if (error) return <div className="profile-container"><div className="error-state"><h2>Error</h2><p>{error}</p></div></div>;

  const ALL_ESTADOS = ['ACTIVO', 'ABIERTO'];
  const hasActiveFilter = filterEstados.length < ALL_ESTADOS.length || filterFecha !== 'none' || filterUsuario.trim() !== '';

  const filteredTasks = (() => {
    let result = allTasks.filter(t => filterEstados.includes(t.estado));
    if (filterUsuario.trim()) {
      const q = filterUsuario.trim().toLowerCase();
      result = result.filter(t => t.usuario?.toLowerCase().includes(q));
    }
    if (filterFecha !== 'none') {
      result = [...result].sort((a, b) => {
        const da = a.fechaLimite ? new Date(a.fechaLimite).getTime() : Infinity;
        const db = b.fechaLimite ? new Date(b.fechaLimite).getTime() : Infinity;
        return filterFecha === 'asc' ? da - db : db - da;
      });
    }
    return result;
  })();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString('es-ES', { month: 'long' });

  const firstDay = new Date(currentYear, currentMonth, 1);
  const firstMonday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
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

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const visibleTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

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
                  {user?.rol
                    ? <span className={`role-badge role-${user.rol.toLowerCase()}`}>{user.rol.toUpperCase()}</span>
                    : <span className="role-badge role-miembro">MIEMBRO</span>}
                  {orgAdmin && username === orgAdmin && (
                    <span className="ceo-badge">CEO</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {orgNombre && <span className="user-org-name">{orgNombre}</span>}
        </div>

        <div className="profile-main-layout">
          <div className="profile-main-content">
            <section className="content-section">
              <div className="section-header" ref={filterPanelRef}>
                <div className="tasks-header-left">
                  <h2>Tareas</h2>
                  <p className="tasks-subtitle">{filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''} · {hasActiveFilter ? 'filtradas' : 'sin filtros'}</p>
                </div>
                <button
                  className={`tasks-filter-btn${hasActiveFilter ? ' tasks-filter-btn--active' : ''}`}
                  onClick={() => setFilterOpen(o => !o)}
                >
                  {hasActiveFilter ? 'Filtros activos' : 'Filtrar'}
                  <i className={`bi bi-chevron-down filter-arrow${filterOpen ? ' filter-arrow--open' : ''}`} />
                </button>

                {filterOpen && (
                  <div className="filter-panel">
                    <div className="filter-panel-section">
                      <span className="filter-panel-label">Estado</span>
                      <div className="filter-checkboxes">
                        {ALL_ESTADOS.map(estado => (
                          <label key={estado} className="filter-checkbox-label">
                            <input
                              type="checkbox"
                              checked={filterEstados.includes(estado)}
                              onChange={() => toggleEstado(estado)}
                            />
                            <span className={`filter-estado-chip filter-chip--${estado.toLowerCase()}`}>{estado}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="filter-panel-section">
                      <span className="filter-panel-label">Fecha de vencimiento</span>
                      <div className="filter-radio-group">
                        {(['none', 'asc', 'desc'] as const).map(opt => (
                          <label key={opt} className="filter-radio-label">
                            <input
                              type="radio"
                              name="filterFecha"
                              value={opt}
                              checked={filterFecha === opt}
                              onChange={() => setFilterFecha(opt)}
                            />
                            {opt === 'none' ? 'Sin orden' : opt === 'asc' ? 'Más próxima primero' : 'Más lejana primero'}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="filter-panel-section">
                      <span className="filter-panel-label">Usuario asignado</span>
                      <input
                        className="filter-user-input"
                        type="text"
                        placeholder="Buscar por usuario…"
                        value={filterUsuario}
                        onChange={e => setFilterUsuario(e.target.value)}
                      />
                    </div>

                    {hasActiveFilter && (
                      <button
                        className="filter-reset-btn"
                        onClick={() => {
                          setFilterEstados(ALL_ESTADOS);
                          setFilterFecha('none');
                          setFilterUsuario('');
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
              {filteredTasks.length > 0 ? (
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
                          {task.proyectoNombre && (
                            <div className="task-list-category">
                              <span className="category-label">PROYECTO</span>
                              <span className="category-value">{task.proyectoNombre}</span>
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
                        <i className="bi bi-chevron-left" /> Anteriores
                      </button>
                      <span className="pagination-info">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Siguientes <i className="bi bi-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-placeholder"><p>No hay tareas{hasActiveFilter ? ' que coincidan con los filtros' : ' disponibles'}.</p></div>
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
              <div className="team-card-header">
                <div className="team-card-header-text">
                  <h3 className="team-card-title">Equipo</h3>
                  {orgNombre && <p className="team-card-org">{orgNombre}</p>}
                </div>
                <span className="team-count-badge">{teamMembers.length}</span>
              </div>
              <div className="team-members-list">
                {teamMembers.length === 0 ? (
                  <p className="team-empty">Sin miembros registrados</p>
                ) : (
                  [...teamMembers]
                    .sort((a, b) => (ROLE_LEVEL[b.rol?.toUpperCase() ?? ''] ?? 0) - (ROLE_LEVEL[a.rol?.toUpperCase() ?? ''] ?? 0))
                    .map(member => (
                      <div key={member.id} className="team-member-row">
                        <div
                          className={`team-member-avatar role-${member.rol?.toLowerCase() || 'miembro'}`}
                          onClick={() => handleMemberClick(member.id)}
                          title={`Ver perfil de ${member.nombres}`}
                          style={{ cursor: 'pointer' }}
                        >
                          {member.nombres?.charAt(0)}{member.apellidos?.charAt(0)}
                        </div>
                        <div className="team-member-info">
                          <span className="team-member-name">{member.nombres} {member.apellidos}</span>
                          <span className="team-member-username">@{member.username}</span>
                        </div>
                        <div className="team-role-pills">
                          <span className={`team-role-pill role-pill--${member.rol?.toLowerCase() || 'miembro'}`}>
                            {member.rol || 'MIEMBRO'}
                          </span>
                          {orgAdmin && member.username === orgAdmin && (
                            <span className="ceo-badge">CEO</span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => user && reloadTasks(user.rol ?? '')}
        />
      )}

      {(selectedMember || memberLoading) && (
        <div className="member-modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="member-modal" onClick={e => e.stopPropagation()}>
            <button className="member-modal-close" onClick={() => setSelectedMember(null)}><i className="bi bi-x-lg" /></button>
            {memberLoading ? <div className="member-modal-loading">Cargando…</div> : selectedMember && (
              <>
                <div className="member-modal-header">
                  <div className={`member-modal-avatar role-${selectedMember.rol?.toLowerCase() || 'miembro'}`}>
                    {selectedMember.nombres?.charAt(0)}{selectedMember.apellidos?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="member-modal-name">{selectedMember.nombres} {selectedMember.apellidos}</h3>
                    <span className="member-modal-username">@{selectedMember.username}</span>
                    <div className="member-modal-roles">
                      {selectedMember.rol && (
                        <span className={`role-badge role-${selectedMember.rol.toLowerCase()}`}>{selectedMember.rol}</span>
                      )}
                      {orgAdmin && selectedMember.username === orgAdmin && (
                        <span className="ceo-badge">CEO</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="member-modal-body">
                  <div className="member-modal-row">
                    <span className="member-modal-label">Nombre</span>
                    <span className="member-modal-value">{selectedMember.nombres}</span>
                  </div>
                  <div className="member-modal-row">
                    <span className="member-modal-label">Apellido</span>
                    <span className="member-modal-value">{selectedMember.apellidos}</span>
                  </div>
                  <div className="member-modal-row">
                    <span className="member-modal-label">Usuario</span>
                    <span className="member-modal-value">@{selectedMember.username}</span>
                  </div>
                  <div className="member-modal-row">
                    <span className="member-modal-label">Email</span>
                    <span className="member-modal-value">{selectedMember.email}</span>
                  </div>
                  <div className="member-modal-row">
                    <span className="member-modal-label">Proyectos ({selectedMember.proyectos?.length ?? 0})</span>
                    {(selectedMember.proyectos?.length ?? 0) > 0 ? (
                      <div className="member-modal-tags">
                        {selectedMember.proyectos!.map(p => (
                          <span key={p} className="member-modal-tag member-modal-tag--proyecto">{p}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="member-modal-empty">Sin proyectos asignados</span>
                    )}
                  </div>
                  <div className="member-modal-row">
                    <span className="member-modal-label">Tareas ({selectedMember.tareas?.length ?? 0})</span>
                    {(selectedMember.tareas?.length ?? 0) > 0 ? (
                      <div className="member-modal-tags">
                        {selectedMember.tareas!.map(t => (
                          <span key={t} className="member-modal-tag member-modal-tag--tarea">{t}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="member-modal-empty">Sin tareas asignadas</span>
                    )}
                  </div>
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

