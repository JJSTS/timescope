import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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

const ROLE_LEVEL: Record<string, number> = { DIRECTOR: 3, LIDER: 2, COORDINADOR: 1, DESARROLLADOR: 1 };

const UsuariosList: React.FC = () => {
  const { userRole, username } = useAuth();
  const [miembros, setMiembros]   = useState<Usuario[]>([]);
  const [orgNombre, setOrgNombre] = useState<string>('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');

  const [roleSelections, setRoleSelections] = useState<Record<number, string>>({});
  const [roleLoading, setRoleLoading]       = useState<Record<number, boolean>>({});
  const [roleFeedback, setRoleFeedback]     = useState<Record<number, { ok: boolean; msg: string }>>({});

  const callerLevel    = ROLE_LEVEL[userRole?.toUpperCase() ?? ''] ?? 0;
  const canManageRoles = callerLevel >= 2;
  const rolesAsignables = canManageRoles ? ['LIDER', 'DESARROLLADOR'] : [];

  const canChangeRoleOf = (m: Usuario) => {
    if (m.username === username) return false;
    return (ROLE_LEVEL[m.rol?.toUpperCase() ?? ''] ?? 0) < callerLevel;
  };

  const handleAsignarRol = async (miembroId: number) => {
    const role = roleSelections[miembroId];
    if (!role) return;
    setRoleLoading(prev => ({ ...prev, [miembroId]: true }));
    setRoleFeedback(prev => ({ ...prev, [miembroId]: { ok: false, msg: '' } }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/usuarios/${miembroId}/asingRol?role=${role}`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setRoleFeedback(prev => ({ ...prev, [miembroId]: { ok: true, msg: 'Rol asignado.' } }));
      setMiembros(prev => prev.map(m => m.id === miembroId ? { ...m, rol: role } : m));
      setRoleSelections(prev => ({ ...prev, [miembroId]: '' }));
    } catch {
      setRoleFeedback(prev => ({ ...prev, [miembroId]: { ok: false, msg: 'No se pudo asignar el rol.' } }));
    } finally {
      setRoleLoading(prev => ({ ...prev, [miembroId]: false }));
    }
  };

  const token = localStorage.getItem('token');
  const BASE  = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: me } = await axios.get(
          `${BASE}/usuarios/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!me.organizacionId) { setLoading(false); return; }

        const [membrosRes, orgRes] = await Promise.all([
          axios.get<Usuario[]>(
            `${BASE}/organizaciones/${me.organizacionId}/miembros`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `${BASE}/organizaciones?id=${me.organizacionId}&size=1`,
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

  if (loading) return <div className="ul-shell"><div className="ul-state">Cargando equipo…</div></div>;
  if (error)   return <div className="ul-shell"><div className="ul-state ul-state--error">{error}</div></div>;

  return (
    <div className="ul-shell">
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

      {filtered.length === 0 ? (
        <div className="ul-state">Sin resultados</div>
      ) : (
        <div className="ul-grid">
          {filtered.map(m => {
            const roleKey = m.rol?.toLowerCase() || 'miembro';
            return (
              <div key={m.id} className="ul-card">
                <div className="ul-card-top">
                  <div className={`ul-avatar ul-avatar--${roleKey}`}>
                    {m.nombres?.charAt(0)}{m.apellidos?.charAt(0)}
                  </div>
                  <span className={`ul-role-pill ${PILL[roleKey] || 'pill--miembro'}`}>
                    {m.rol || 'MIEMBRO'}
                  </span>
                </div>

                <div className="ul-card-name">{m.nombres} {m.apellidos}</div>

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

                {canManageRoles && canChangeRoleOf(m) && (
                  <div className="ul-role-assign">
                    <select
                      className="ul-role-select"
                      value={roleSelections[m.id] ?? ''}
                      onChange={e => setRoleSelections(prev => ({ ...prev, [m.id]: e.target.value }))}
                      disabled={roleLoading[m.id]}
                    >
                      <option value="">Cambiar rol…</option>
                      {rolesAsignables.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <button
                      className="ul-role-btn"
                      onClick={() => handleAsignarRol(m.id)}
                      disabled={roleLoading[m.id] || !roleSelections[m.id]}
                    >
                      {roleLoading[m.id] ? '…' : 'Asignar'}
                    </button>
                    {roleFeedback[m.id]?.msg && (
                      <span className={roleFeedback[m.id].ok ? 'ul-role-ok' : 'ul-role-err'}>
                        {roleFeedback[m.id].msg}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UsuariosList;
