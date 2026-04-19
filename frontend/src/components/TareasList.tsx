import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TareasList.css';

interface Tarea {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  usuarioId: number;
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
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTareas();
  }, []);

  const fetchTareas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<PageResponse>('http://localhost:8080/api/v1/tareas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta del servidor:', response.data);

      const tareasData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];

      setTareas(tareasData);
    } catch (error: any) {
      console.error('Error al obtener tareas:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar tareas';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">⏳ Cargando tareas...</div>;

  if (error) return <div className="error-message">❌ {error}</div>;

  if (tareas.length === 0) return <div className="loading">📭 No hay tareas disponibles</div>;

  return (
    <div className="tareas-container">
      <h2>✓ Gestión de Tareas ({tareas.length})</h2>
      <table className="tareas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Usuario ID</th>
          </tr>
        </thead>
        <tbody>
          {tareas.map((tarea) => (
            <tr key={tarea.id}>
              <td>{tarea.id}</td>
              <td>{tarea.nombre}</td>
              <td>{tarea.descripcion}</td>
              <td>{tarea.estado}</td>
              <td>{tarea.usuarioId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TareasList;

