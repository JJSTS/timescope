import React, { useState, useEffect, useRef, useCallback } from 'react';
import { notificacionService, NotificacionDto, TipoNotificacion } from '../services/notificacionService';
import { solicitudService, SolicitudDto } from '../services/solicitudService';
import '../styles/NotificacionesPanel.css';

interface Props {
  onClose: () => void;
  onPendientesChange: (count: number) => void;
}

const TIPO_LABELS: Record<TipoNotificacion, string> = {
  SOLICITUD_RECIBIDA: 'Solicitud recibida',
  SOLICITUD_ACEPTADA: 'Solicitud aceptada',
  SOLICITUD_RECHAZADA: 'Solicitud rechazada',
  TAREA_ASIGNADA: 'Tarea asignada',
  EQUIPO_UNIDO: 'Equipo unido',
};

const TIPO_ICONS: Record<TipoNotificacion, string> = {
  SOLICITUD_RECIBIDA: '📩',
  SOLICITUD_ACEPTADA: '✅',
  SOLICITUD_RECHAZADA: '❌',
  TAREA_ASIGNADA: '📋',
  EQUIPO_UNIDO: '👥',
};

function formatFecha(fechaStr: string): string {
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  const diffMin = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffH < 24) return `Hace ${diffH} h`;
  if (diffD === 1) return 'Ayer';
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

const NotificacionesPanel: React.FC<Props> = ({ onClose, onPendientesChange }) => {
  const [tab, setTab] = useState<'pendientes' | 'historial'>('pendientes');
  const [pendientes, setPendientes] = useState<NotificacionDto[]>([]);
  const [historial, setHistorial] = useState<NotificacionDto[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marcando, setMarcando] = useState<Set<number>>(new Set());
  const [accionando, setAccionando] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pend, hist] = await Promise.all([
        notificacionService.getPendientes(),
        notificacionService.getHistorial(),
      ]);
      setPendientes(pend);
      setHistorial(hist);
      onPendientesChange(pend.length);

      try {
        const sols = await solicitudService.getMisPendientes();
        setSolicitudes(sols);
      } catch {
        setSolicitudes([]);
      }
    } catch {
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, [onPendientesChange]);

  useEffect(() => { void cargarDatos(); }, [cargarDatos]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const handleMarcarLeido = async (id: number) => {
    setMarcando(prev => new Set(prev).add(id));
    try {
      await notificacionService.marcarLeido(id);
      const nuevas = pendientes.filter(n => n.id !== id);
      setPendientes(nuevas);
      onPendientesChange(nuevas.length);
      setHistorial(await notificacionService.getHistorial());
    } catch {
      setError('No se pudo marcar como leída');
    } finally {
      setMarcando(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleAccion = async (solicitudId: number, accion: 'aceptar' | 'rechazar') => {
    setAccionando(prev => new Set(prev).add(solicitudId));
    try {
      if (accion === 'aceptar') await solicitudService.aceptar(solicitudId);
      else await solicitudService.rechazar(solicitudId);

      setSolicitudes(prev => prev.filter(s => s.id !== solicitudId));

      const [pend, hist] = await Promise.all([
        notificacionService.getPendientes(),
        notificacionService.getHistorial(),
      ]);
      setPendientes(pend);
      setHistorial(hist);
      onPendientesChange(pend.length);
    } catch {
      setError(`No se pudo ${accion} la solicitud`);
    } finally {
      setAccionando(prev => { const s = new Set(prev); s.delete(solicitudId); return s; });
    }
  };

  const handleMarcarTodas = async () => {
    const ids = pendientes.map(n => n.id);
    setMarcando(new Set(ids));
    try {
      await Promise.all(ids.map(id => notificacionService.marcarLeido(id)));
      setPendientes([]);
      onPendientesChange(0);
      setHistorial(await notificacionService.getHistorial());
    } catch {
      setError('No se pudieron marcar todas como leídas');
    } finally {
      setMarcando(new Set());
    }
  };

  // Para emparejar la i-ésima notificación SOLICITUD_RECIBIDA con la i-ésima solicitud pendiente
  const getSolicitudParaNotif = (notif: NotificacionDto): SolicitudDto | null => {
    if (notif.tipo !== 'SOLICITUD_RECIBIDA') return null;
    const idx = pendientes
      .filter(n => n.tipo === 'SOLICITUD_RECIBIDA')
      .indexOf(notif);
    return solicitudes[idx] ?? null;
  };

  const lista = tab === 'pendientes' ? pendientes : historial;

  return (
    <div className="notif-panel" ref={panelRef} role="dialog" aria-label="Notificaciones">
      <div className="notif-panel-header">
        <span className="notif-panel-title">Notificaciones</span>
        {tab === 'pendientes' && pendientes.length > 0 && (
          <button className="notif-marcar-todas" onClick={handleMarcarTodas}>
            Marcar todas
          </button>
        )}
      </div>

      <div className="notif-tabs">
        <button
          className={`notif-tab ${tab === 'pendientes' ? 'active' : ''}`}
          onClick={() => setTab('pendientes')}
        >
          Pendientes
          {pendientes.length > 0 && <span className="notif-badge">{pendientes.length}</span>}
        </button>
        <button
          className={`notif-tab ${tab === 'historial' ? 'active' : ''}`}
          onClick={() => setTab('historial')}
        >
          Historial
        </button>
      </div>

      <div className="notif-list">
        {loading && <div className="notif-estado">Cargando...</div>}

        {!loading && error && <div className="notif-estado notif-error">{error}</div>}

        {!loading && !error && lista.length === 0 && (
          <div className="notif-estado notif-vacia">
            {tab === 'pendientes' ? 'Sin notificaciones pendientes' : 'Sin notificaciones'}
          </div>
        )}

        {!loading && !error && lista.map(notif => {
          const solicitud = tab === 'pendientes' ? getSolicitudParaNotif(notif) : null;
          const esSolicitud = notif.tipo === 'SOLICITUD_RECIBIDA' && solicitud !== null;

          return (
            <div key={notif.id} className="notif-item">
              <div className="notif-item-icon" aria-hidden="true">
                {TIPO_ICONS[notif.tipo]}
              </div>

              <div className="notif-item-body">
                <span className="notif-tipo">{TIPO_LABELS[notif.tipo]}</span>
                <p className="notif-mensaje">{notif.mensaje}</p>
                <span className="notif-fecha">{formatFecha(notif.fecha)}</span>

                {/* Botones Aceptar / Rechazar dentro de la tarjeta */}
                {esSolicitud && (
                  <div className="notif-solicitud-acciones">
                    <button
                      className="solicitud-btn solicitud-btn-aceptar"
                      onClick={() => handleAccion(solicitud!.id, 'aceptar')}
                      disabled={accionando.has(solicitud!.id)}
                    >
                      {accionando.has(solicitud!.id) ? '...' : 'Aceptar'}
                    </button>
                    <button
                      className="solicitud-btn solicitud-btn-rechazar"
                      onClick={() => handleAccion(solicitud!.id, 'rechazar')}
                      disabled={accionando.has(solicitud!.id)}
                    >
                      {accionando.has(solicitud!.id) ? '...' : 'Rechazar'}
                    </button>
                  </div>
                )}
              </div>

              {/* Botón marcar leída solo para notificaciones que NO son solicitudes pendientes */}
              {tab === 'pendientes' && !esSolicitud && (
                <button
                  className="notif-leer-btn"
                  onClick={() => handleMarcarLeido(notif.id)}
                  disabled={marcando.has(notif.id)}
                  title="Marcar como leída"
                  aria-label="Marcar como leída"
                >
                  {marcando.has(notif.id) ? '...' : '✓'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificacionesPanel;
