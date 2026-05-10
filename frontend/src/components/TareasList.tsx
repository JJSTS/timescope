import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskDetailModal from './TaskDetailModal';
import TareaCreateModal from './TareaCreateModal';
import '../styles/TareasList.css';

// Interfaz para el objeto de usuario anidado
interface UsuarioSimple {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
}

interface Tarea {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  horasEstimadas?: number;
  fechaLimite?: string;
  fechaCreacion?: string;
  usuario: UsuarioSimple;
  proyecto?: string;
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
    fetch('${process.env.REACT_APP_API_URL}/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.organizacionId) setOrganizacionId(data.organizacionId); })
      .catch(() => {});
  }, [token]);

  const canCreate = ['DIRECTOR', 'COORDINADOR', 'LIDER'].includes(userRole?.toUpperCase() ?? '');

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

      if (tareasData.length > 0) {
        console.log('Estructura de la primera tarea recibida:', tareasData[0]);
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

  if (loading) return <div className="loading">Cargando tareas...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (tareas.length === 0) return <div className="loading">No hay tareas disponibles</div>;

  return (
    <>
      <div className="tareas-container">
        <div className="list-header">
          <h2>Gestión de Tareas</h2>
          {canCreate && (
            <button className="btn-create" onClick={() => setShowCreateModal(true)}>
              + Nueva tarea
            </button>
          )}
        </div>
        <table className="tareas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Usuario Asignado</th>
              <th>Estado</th>
              <th>Fecha Límite</th>
              <th>Horas Estimadas</th>
            </tr>
          </thead>
          <tbody>
            {tareas.map((tarea) => (
              <tr key={tarea.id}>
                <td>{tarea.id}</td>
                <td>
                  <button
                    className="tarea-link"
                    onClick={() => setSelectedTask(tarea)}
                    title="Ver detalles de la tarea"
                  >
                    {tarea.nombre}
                  </button>
                </td>
                <td>{tarea.descripcion || '-'}</td>
                <td>{tarea.usuario ? `${tarea.usuario.nombres} ${tarea.usuario.apellidos}` : '-'}</td>
                <td>
                  <span className={`estado ${tarea.estado?.toLowerCase()}`}>
                    {tarea.estado || '-'}
                  </span>
                </td>
                <td>{tarea.fechaLimite ? new Date(tarea.fechaLimite).toLocaleDateString('es-ES') : '-'}</td>
                <td>{tarea.horasEstimadas ? `${tarea.horasEstimadas}h` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div className="pagination">
          <button
            onClick={previousPage}
            disabled={currentPage === 0}
          >
            ← Anterior
          </button>

          <span>
            Página {currentPage + 1} de {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
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
