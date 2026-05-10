import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}`;

export type TipoNotificacion =
  | 'SOLICITUD_RECIBIDA'
  | 'SOLICITUD_ACEPTADA'
  | 'SOLICITUD_RECHAZADA'
  | 'TAREA_ASIGNADA'
  | 'EQUIPO_UNIDO';

export interface NotificacionDto {
  id: number;
  username: string;
  tipo: TipoNotificacion;
  mensaje: string;
  fecha: string;
}

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const notificacionService = {
  async getPendientes(): Promise<NotificacionDto[]> {
    const res = await axios.get(`${API_URL}/notificaciones/pendientes`, authHeaders());
    return res.data;
  },

  async getHistorial(): Promise<NotificacionDto[]> {
    const res = await axios.get(`${API_URL}/notificaciones/historial`, authHeaders());
    return res.data;
  },

  async marcarLeido(id: number): Promise<void> {
    await axios.patch(`${API_URL}/notificaciones/${id}/leer`, {}, authHeaders());
  },
};