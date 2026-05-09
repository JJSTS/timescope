import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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
  usuario: UsuarioSimple; // Cambiado de usuarioId a un objeto anidado
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

interface Props {
  highlightedId?: number | null;
}

const TareasList: React.FC<Props> = ({ highlightedId }) => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const token = localStorage.getItem('token');
  const { userRole } = useAuth();

  useEffect(() => {
    if (userRole) {
      fetchTareas();
    }
  }, [userRole]);

  useEffect(() => {
    if (!highlightedId) return;
    setActiveHighlight(highlightedId);

    const tryScroll = () => {
      const row = rowRefs.current[highlightedId];
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const t = setTimeout(tryScroll, 100);
    const clear = setTimeout(() => setActiveHighlight(null), 3000);
    return () => { clearTimeout(t); clearTimeout(clear); };
  }, [highlightedId]);

  const fetchTareas = async () => {
    setLoading(true);
    setError(null);

    const isDeveloper = userRole?.toLowerCase() === 'desarrollador';
    const endpoint = isDeveloper 
      ? 'http://localhost:8080/api/v1/tareas/me' 
      : 'http://localhost:8080/api/v1/tareas';

    try {
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const tareasData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];
      
      if (tareasData.length > 0) {
        console.log('Estructura de la primera tarea recibida:', tareasData[0]);
      }

      setTareas(tareasData);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar tareas';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando tareas...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (tareas.length === 0) return <div className="loading">No hay tareas disponibles</div>;

  return (
    <div className="tareas-container">
      <h2>Gestión de Tareas ({tareas.length})</h2>
      <table className="tareas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Fecha Límite</th> 
          </tr>
        </thead>
        <tbody>
          {tareas.map((tarea) => (
            <tr
              key={tarea.id}
              ref={el => { rowRefs.current[tarea.id] = el; }}
              className={activeHighlight === tarea.id ? 'row-highlighted' : ''}
            >
              <td>{tarea.id}</td>
              <td>{tarea.nombre}</td>
              <td>{tarea.descripcion}</td>
              <td>{tarea.estado}</td>
              <td>{tarea.fechaLimite ? new Date(tarea.fechaLimite).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TareasList;
