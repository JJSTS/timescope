import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProyectoCreateModal from './ProyectoCreateModal';
import '../styles/ProyectosList.css';

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

interface PageResponse {
  content: Proyecto[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const ESTADOS = ['Todos', 'ACTIVO', 'COMPLETADO', 'SUSPENDIDO'];

const estadoMeta: Record<string, { label: string; className: string }> = {
  ACTIVO:     { label: 'Activo',     className: 'pl-estado--activo' },
  COMPLETADO: { label: 'Completado', className: 'pl-estado--completado' },
  SUSPENDIDO: { label: 'Suspendido', className: 'pl-estado--suspendido' },
};

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconTask = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconFolder = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ProyectosList: React.FC = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const { userRole } = useAuth();
  const canCreate = userRole?.toUpperCase() === 'DIRECTOR';

  useEffect(() => {
    setCurrentPage(0);
  }, [filtroEstado]);

  useEffect(() => {
    fetchProyectos(currentPage);
  }, [filtroEstado, currentPage]);

  const fetchProyectos = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = filtroEstado !== 'Todos'
        ? `http://localhost:8080/api/v1/proyectos/estado/${filtroEstado}?page=${page}&size=9`
        : `http://localhost:8080/api/v1/proyectos?page=${page}&size=9`;
      const response = await axios.get<PageResponse>(
        url,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      setProyectos(Array.isArray(data) ? data : data.content || []);
      if (!Array.isArray(data)) {
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al cargar los proyectos');
      const response = await axios.get<PageResponse>('https://timescope-api.loca.lt/api/v1/proyectos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const proyectosData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];

      setProyectos(proyectosData);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar proyectos';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="pl-wrapper"><div className="pl-error">{error}</div></div>;
  }

  return (
    <>
      <div className="pl-wrapper">

        {/* Cabecera */}
        <div className="pl-header">
          <div className="pl-header-left">
            <h1 className="pl-title">Proyectos</h1>
            <p className="pl-subtitle">
              {loading ? 'Cargando...' : `${totalElements} proyecto${totalElements !== 1 ? 's' : ''} en esta organización`}
            </p>
          </div>
          {canCreate && (
            <button className="pl-btn-primary" onClick={() => setShowCreateModal(true)}>
              <IconPlus />
              Nuevo proyecto
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="pl-filters">
          {ESTADOS.map(e => (
            <button
              key={e}
              className={`pl-filter-tab ${filtroEstado === e ? 'pl-filter-tab--active' : ''}`}
              onClick={() => setFiltroEstado(e)}
            >
              {e === 'Todos' ? 'Todos' : estadoMeta[e]?.label ?? e}
            </button>
          ))}
        </div>

        {/* Grid de cards */}
        {loading ? (
          <div className="pl-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="pl-card-skeleton" />)}
          </div>
        ) : proyectos.length === 0 ? (
          <div className="pl-empty">
            <IconFolder />
            <p>No hay proyectos en este estado</p>
          </div>
        ) : (
          <div className="pl-grid">
            {proyectos.map(proyecto => {
              const meta = estadoMeta[proyecto.estado ?? ''];
              return (
                <div key={proyecto.id} className="pl-card pl-card--clickable" onClick={() => navigate(`/proyecto/${proyecto.id}`)}>
                  {/* Indicador de estado lateral */}
                  <div className={`pl-card-indicator ${meta?.className ?? 'pl-estado--sin-estado'}`} />

                  <div className="pl-card-body">
                    {/* Header del card */}
                    <div className="pl-card-top">
                      <div className="pl-card-title-row">
                        <h3 className="pl-card-title">{proyecto.nombre}</h3>
                        <span className={`pl-estado ${meta?.className ?? 'pl-estado--sin-estado'}`}>
                          {meta?.label ?? proyecto.estado ?? '—'}
                        </span>
                      </div>

                      {/* Lider */}
                      {proyecto.liderNombre ? (
                        <div className="pl-card-lider">
                          <IconUser />
                          <span>{proyecto.liderNombre}</span>
                          <span className="pl-card-lider-role">Líder</span>
                        </div>
                      ) : (
                        <div className="pl-card-lider pl-card-lider--empty">
                          <IconUser />
                          <span>Sin líder asignado</span>
                        </div>
                      )}
                    </div>

                    {/* Descripción */}
                    <p className="pl-card-desc">
                      {proyecto.descripcion
                        ? proyecto.descripcion.length > 90
                          ? `${proyecto.descripcion.slice(0, 90)}…`
                          : proyecto.descripcion
                        : <span className="pl-card-desc--empty">Sin descripción registrada</span>}
                    </p>

                    {/* Footer con métricas */}
                    <div className="pl-card-footer">
                      <div className="pl-card-metric">
                        <IconUsers />
                        <span><strong>{proyecto.membrosCount ?? proyecto.usuarios?.length ?? 0}</strong> miembros</span>
                      </div>
                      <div className="pl-card-divider" />
                      <div className="pl-card-metric">
                        <IconTask />
                        <span><strong>{proyecto.tareasCount ?? 0}</strong> tareas</span>
                      </div>
                      <div className="pl-card-id">#{proyecto.id}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pl-pagination">
            <button
              className="pl-page-btn"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 0}
            >
              <IconChevronLeft /> Anterior
            </button>
            <span className="pl-page-info">
              Página <strong>{currentPage + 1}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              className="pl-page-btn"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Siguiente <IconChevronRight />
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <ProyectoCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => fetchProyectos(currentPage)}
        />
      )}
    </>
  );
};

export default ProyectosList;
