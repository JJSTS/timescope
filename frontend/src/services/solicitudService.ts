import axios from 'axios';

const API_URL = '${process.env.REACT_APP_API_URL}';

export interface SolicitudDto {
  id: number;
  usuario: string;
  organizacion: string;
  estado: string;
  fechaCreacion: string;
}

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const solicitudService = {
  async getMisPendientes(): Promise<SolicitudDto[]> {
    const res = await axios.get(`${API_URL}/solicitud/mis-pendientes`, authHeaders());
    return res.data;
  },

  async aceptar(id: number): Promise<void> {
    await axios.put(`${API_URL}/solicitud/${id}/aceptar`, {}, authHeaders());
  },

  async rechazar(id: number): Promise<void> {
    await axios.put(`${API_URL}/solicitud/${id}/rechazar`, {}, authHeaders());
  },
};