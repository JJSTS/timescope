import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/UsuariosList.css';

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  rol: string;
  isDeleted: boolean;
}

interface PageResponse {
  content: Usuario[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const UsuariosList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Usuario>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsuarios(currentPage);
  }, [currentPage]);

  const fetchUsuarios = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<PageResponse>(
        `http://localhost:8080/api/v1/usuarios?page=${page}&size=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Respuesta del servidor:', response.data);

      // Manejar tanto respuestas paginadas como arrays directos
      const usuariosData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];

      setUsuarios(usuariosData);

      // Guardar total de páginas
      if (!Array.isArray(response.data)) {
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar usuarios';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingId(usuario.id);
    setEditForm(usuario);
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      try {
        await axios.put(
          `http://localhost:8080/api/v1/usuarios/${editingId}`,
          editForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingId(null);
        setEditForm({});
        fetchUsuarios(currentPage);
      } catch (error: any) {
        console.error('Error al actualizar usuario:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Error al actualizar usuario';
        setError(errorMsg);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

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

  if (loading) return <div className="loading">Cargando usuarios...</div>;

  if (error) return <div className="error-message">{error}</div>;

  if (usuarios.length === 0) return <div className="loading">No hay usuarios disponibles</div>;

  return (
    <div className="usuarios-container">
      <h2>Gestión de Usuarios ({usuarios.length})</h2>
      <table className="usuarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>
                {editingId === usuario.id ? (
                  <div className="edit-names">
                    <input
                      type="text"
                      placeholder="Nombres"
                      value={editForm.nombres || ''}
                      onChange={(e) => setEditForm({ ...editForm, nombres: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Apellidos"
                      value={editForm.apellidos || ''}
                      onChange={(e) => setEditForm({ ...editForm, apellidos: e.target.value })}
                    />
                  </div>
                ) : (
                  `${usuario.nombres} ${usuario.apellidos}`
                )}
              </td>
              <td>{usuario.username}</td>
              <td>
                {editingId === usuario.id ? (
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                ) : (
                  usuario.email
                )}
              </td>
              <td>
                <span className="roles-badge">
                  {usuario.rol
                    ? <span className={`role ${usuario.rol.toLowerCase()}`}>{usuario.rol}</span>
                    : '-'}
                </span>
              </td>
              <td>
                {editingId === usuario.id ? (
                  <div className="action-buttons">
                    <button onClick={handleSaveEdit} className="btn-save">Guardar</button>
                    <button onClick={handleCancel} className="btn-cancel">Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => handleEdit(usuario)} className="btn-edit">Editar</button>
                )}
              </td>
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
  );
};

export default UsuariosList;

