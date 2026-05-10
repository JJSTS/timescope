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
}

const PILL: Record<string, string> = {
  director:      'pill--director',
  lider:         'pill--lider',
  desarrollador: 'pill--desarrollador',
};

const UsuariosList: React.FC = () => {
  const [miembros, setMiembros]   = useState<Usuario[]>([]);
  const [orgNombre, setOrgNombre] = useState<string>('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: me } = await axios.get(
          'http://localhost:8080/api/v1/usuarios/me',
          { headers: { Authorization: `Bearer ${token}` } }
        );
    fetchUsuarios(currentPage);
  }, [currentPage]);

  const fetchUsuarios = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<PageResponse>(
        `${process.env.REACT_APP_API_URL}/usuarios?page=${page}&size=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

        if (!me.organizacionId) { setLoading(false); return; }

        const [membrosRes, orgRes] = await Promise.all([
          axios.get<Usuario[]>(
            `http://localhost:8080/api/v1/organizaciones/${me.organizacionId}/miembros`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://localhost:8080/api/v1/organizaciones?id=${me.organizacionId}&size=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setMiembros(membrosRes.data);
        const nombre = orgRes.data?.content?.[0]?.nombre;
        if (nombre) setOrgNombre(nombre);
      } catch (e: any) {
        setError(e.response?.data?.message || e.message || 'Error al cargar el equipo');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = miembros.filter(m =>
    `${m.nombres} ${m.apellidos} ${m.username} ${m.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const handleSaveEdit = async () => {
    if (editingId) {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/usuarios/${editingId}`,
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

  if (loading) return <div className="ul-shell"><div className="ul-state">Cargando equipo…</div></div>;
  if (error)   return <div className="ul-shell"><div className="ul-state ul-state--error">{error}</div></div>;

  return (
    <div className="ul-shell">
      {/* HEADER */}
      <div className="ul-header">
        <div className="ul-header-left">
          <h2 className="ul-title">Equipo</h2>
          {orgNombre && <p className="ul-org">{orgNombre}</p>}
        </div>
        <div className="ul-header-right">
          <span className="ul-count">{filtered.length} miembro{filtered.length !== 1 ? 's' : ''}</span>
          <input
            className="ul-search"
            type="text"
            placeholder="Buscar miembro…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* GRID DE CARDS */}
      {filtered.length === 0 ? (
        <div className="ul-state">Sin resultados</div>
      ) : (
        <div className="ul-grid">
          {filtered.map(m => {
            const roleKey = m.rol?.toLowerCase() || 'miembro';
            return (
              <div key={m.id} className="ul-card">
                {/* Cabecera de la card */}
                <div className="ul-card-top">
                  <div className={`ul-avatar ul-avatar--${roleKey}`}>
                    {m.nombres?.charAt(0)}{m.apellidos?.charAt(0)}
                  </div>
                  <span className={`ul-role-pill ${PILL[roleKey] || 'pill--miembro'}`}>
                    {m.rol || 'MIEMBRO'}
                  </span>
                </div>

                {/* Nombre */}
                <div className="ul-card-name">{m.nombres} {m.apellidos}</div>

                {/* Datos de contacto */}
                <div className="ul-card-contact">
                  <div className="ul-contact-row">
                    <span className="ul-contact-label">Usuario</span>
                    <span className="ul-contact-value">@{m.username}</span>
                  </div>
                  <div className="ul-contact-row">
                    <span className="ul-contact-label">Email</span>
                    <span className="ul-contact-value ul-contact-value--email">{m.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UsuariosList;
