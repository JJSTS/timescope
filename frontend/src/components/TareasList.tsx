import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskDetailModal from './TaskDetailModal';
import TareaCreateModal from './TareaCreateModal';
import '../styles/TareasList.css';

interface Tarea {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  horasEstimadas?: number;
  fechaLimite?: string;
  fechaCreacion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  usuario?: string;
  proyectoNombre?: string;
}

interface PageResponse {
  content: Tarea[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const TareasList: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Tarea | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [organizacionId, setOrganizacionId] = useState<number | undefined>(undefined);
  const token = localStorage.getItem('token');
  const { userRole } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.REACT_APP_API_URL}/usuarios/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.organizacionId) setOrganizacionId(data.organizacionId); })
      .catch(() => {});
  }, [token]);

  const canCreate = ['DIRECTOR', 'LIDER'].includes(userRole?.toUpperCase() ?? '');

  useEffect(() => {
    if (userRole) {
      fetchTareas(currentPage);
    }
  }, [userRole, currentPage]);

  const fetchTareas = async (page: number) => {
    setLoading(true);
    setError(null);

    const isDeveloper = userRole?.toLowerCase() === 'desarrollador';
    const endpoint = isDeveloper
      ? `${process.env.REACT_APP_API_URL}/tareas/me?page=${page}&size=10`
      : `${process.env.REACT_APP_API_URL}/tareas?page=${page}&size=10`;

    try {
      const response = await axios.get<PageResponse>(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const tareasData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];

      setTareas(tareasData);

      // Guardar total de páginas
      if (!Array.isArray(response.data)) {
        setTotalPages(response.data.totalPages);
      }


    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar tareas';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <div className="tl-shell">

        {/* CABECERA */}
        <header className="tl-header">
          <div className="tl-header__left">
            <p className="tl-header__eyebrow">Gestión</p>
            <h2 className="tl-header__title">Tareas</h2>
          </div>
          <div className="tl-header__right">
            <span className="tl-header__count">{tareas.length} registro{tareas.length !== 1 ? 's' : ''}</span>
            {canCreate && (
              <button className="tl-btn-create" onClick={() => setShowCreateModal(true)}>
                + Nueva tarea
              </button>
            )}
          </div>
        </header>

        {loading && (
          <div className="tl-state">
            <span className="tl-state__dot tl-state__dot--loading" />
            Cargando tareas…
          </div>
        )}
        {!loading && error && <div className="tl-state tl-state--error">{error}</div>}
        {!loading && !error && tareas.length === 0 && (
          <div className="tl-state">Sin tareas disponibles</div>
        )}

        {/* TABLA — solo si hay datos */}
        {!loading && !error && tareas.length > 0 && <>

        {/* COLUMNAS */}
        <div className="tl-cols-label">
          <span>Tarea</span>
          <span>Asignado a</span>
          <span>Proyecto</span>
          <span>Fecha límite</span>
          <span>Horas est.</span>
          <span>Estado</span>
        </div>

        {/* FILAS */}
        <ul className="tl-list">
          {tareas.map((tarea) => (
            <li
              key={tarea.id}
              className={`tl-item tl-item--${tarea.estado?.toLowerCase()}`}
              onClick={() => setSelectedTask(tarea)}
            >
              <div className="tl-item__main">
                <span className="tl-item__nombre">{tarea.nombre}</span>
                {tarea.descripcion && (
                  <span className="tl-item__desc">{tarea.descripcion}</span>
                )}
              </div>

              <span className="tl-item__meta">
                {tarea.usuario ? `@${tarea.usuario}` : '—'}
              </span>

              <span className="tl-item__meta">
                {tarea.proyectoNombre || '—'}
              </span>

              <span className="tl-item__meta">
                {tarea.fechaLimite
                  ? new Date(tarea.fechaLimite).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </span>

              <span className="tl-item__meta">
                {tarea.horasEstimadas ? `${tarea.horasEstimadas}h` : '—'}
              </span>

              <span className={`tl-item__estado tl-estado--${tarea.estado?.toLowerCase()}`}>
                {tarea.estado}
              </span>
            </li>
          ))}
        </ul>

        {/* PAGINACIÓN */}
        <footer className="tl-pagination">
          <button className="tl-page-btn" onClick={previousPage} disabled={currentPage === 0}>
            <i className="bi bi-arrow-left" /> Anterior
          </button>
          <span className="tl-page-info">
            {currentPage + 1} / {totalPages}
          </span>
          <button className="tl-page-btn" onClick={nextPage} disabled={currentPage >= totalPages - 1}>
            Siguiente <i className="bi bi-arrow-right" />
          </button>
        </footer>

        </>}

      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => fetchTareas(currentPage)}
        />
      )}

      {showCreateModal && (
        <TareaCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => fetchTareas(currentPage)}
          organizacionId={organizacionId}
        />
      )}
    </>
  );
};

export default TareasList;
