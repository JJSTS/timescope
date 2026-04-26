import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProyectosList.css';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
}

interface PageResponse {
  content: Proyecto[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const ProyectosList: React.FC = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<PageResponse>('http://localhost:8080/api/v1/proyectos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta de proyectos:', response.data);

      // Manejar tanto respuestas paginadas como arrays directos
      const proyectosData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];

      setProyectos(proyectosData);
    } catch (error: any) {
      console.error('Error al obtener proyectos:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar proyectos';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando proyectos...</div>;

  if (error) return <div className="error-message">{error}</div>;

  if (proyectos.length === 0) return <div className="loading">No hay proyectos disponibles</div>;

  return (
    <div className="proyectos-container">
      <h2>Gestión de Proyectos ({proyectos.length})</h2>
      <table className="proyectos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((proyecto) => (
            <tr key={proyecto.id}>
              <td>{proyecto.id}</td>
              <td>{proyecto.nombre}</td>
              <td>{proyecto.descripcion || '-'}</td>
              <td>{proyecto.fechaInicio || '-'}</td>
              <td>{proyecto.fechaFin || '-'}</td>
              <td><span className={`estado ${proyecto.estado?.toLowerCase()}`}>{proyecto.estado || '-'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProyectosList;

