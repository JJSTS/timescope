import React, { useState, useEffect } from 'react';
import '../styles/OrganizacionModal.css';

interface Org {
  id: number;
  nombre: string;
  empresaMatrizId?: number | null;
  filialesIds?: number[];
  proyectosIds?: number[];
  usuariosIds?: number[];
  administrador?: string | null;
  userAdmin?: string | null;
}

interface Props {
  orgId: number;
  onClose: () => void;
}

type SolicitudState = 'idle' | 'loading' | 'success' | 'error';

const OrganizacionModal: React.FC<Props> = ({ orgId, onClose }) => {
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudState, setSolicitudState] = useState<SolicitudState>('idle');
  const [solicitudError, setSolicitudError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrg = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/organizaciones?id=${orgId}&size=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('No se pudo cargar la organización');
        const data = await res.json();
        const found = data?.content?.[0] ?? null;
        if (!found) throw new Error('Organización no encontrada');
        setOrg(found);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [orgId]);

  const handleEnviarSolicitud = async () => {
    if (!org) return;
    setSolicitudState('loading');
    setSolicitudError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/solicitud/enviar/${encodeURIComponent(org.nombre)}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || data?.detail || 'Error al enviar la solicitud');
      }
      setSolicitudState('success');
    } catch (e) {
      setSolicitudError(e instanceof Error ? e.message : 'Error desconocido');
      setSolicitudState('error');
    }
  };

  return (
    <div className="org-overlay" onClick={onClose}>
      <div className="org-modal" onClick={e => e.stopPropagation()}>

        <div className="org-modal-header">
          <div className="org-modal-title-row">
            <div className="org-avatar">
              {org?.nombre?.charAt(0).toUpperCase() ?? '…'}
            </div>
            <div>
              <h2 className="org-modal-title">{loading ? 'Cargando…' : (org?.nombre ?? '—')}</h2>
              <span className="org-modal-subtitle">Organización</span>
            </div>
          </div>
          <button className="org-modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="org-modal-body">
          {loading && (
            <div className="org-loading"><span className="org-spinner" /></div>
          )}

          {error && <p className="org-error">{error}</p>}

          {org && !loading && (
            <>
              {/* Stats */}
              <div className="org-stats">
                <div className="org-stat-card">
                  <span className="org-stat-number">{org.proyectosIds?.length ?? 0}</span>
                  <span className="org-stat-label">Proyectos</span>
                </div>
                <div className="org-stat-card">
                  <span className="org-stat-number">{org.usuariosIds?.length ?? 0}</span>
                  <span className="org-stat-label">Miembros</span>
                </div>
                <div className="org-stat-card">
                  <span className="org-stat-number">{org.filialesIds?.length ?? 0}</span>
                  <span className="org-stat-label">Filiales</span>
                </div>
              </div>

              {/* Details */}
              <div className="org-details">
                <div className="org-detail-row">
                  <span className="org-detail-label">Administrador</span>
                  <div className="org-detail-value">
                    {org.administrador
                      ? <><span>{org.administrador}</span><span className="org-detail-username">@{org.userAdmin}</span></>
                      : <span className="org-detail-unavailable">No asignado</span>
                    }
                  </div>
                </div>
                <div className="org-detail-row">
                  <span className="org-detail-label">Empresa matriz</span>
                  <span className="org-detail-value">
                    {org.empresaMatrizId ? 'Organización vinculada' : 'Ninguna'}
                  </span>
                </div>
              </div>

              {/* Solicitud button */}
              <div className="org-solicitud-area">
                {solicitudState === 'success' ? (
                  <div className="org-solicitud-success">
                    <span className="org-solicitud-check">✓</span>
                    Solicitud enviada correctamente
                  </div>
                ) : (
                  <>
                    <button
                      className="org-solicitud-btn"
                      onClick={handleEnviarSolicitud}
                      disabled={solicitudState === 'loading'}
                    >
                      {solicitudState === 'loading'
                        ? <><span className="org-btn-spinner" /> Enviando…</>
                        : 'Solicitar unirse'}
                    </button>
                    {solicitudState === 'error' && solicitudError && (
                      <p className="org-solicitud-error">{solicitudError}</p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrganizacionModal;
