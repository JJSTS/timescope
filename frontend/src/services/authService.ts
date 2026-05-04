import axios from 'axios';

const API_URL = 'https://timescope-api.loca.lt/api/v1';

interface LoginResponse {
  token: string;
}

interface OrganizationData {
  nombre: string;
  crearNueva?: boolean;  // ✨ NUEVO - flag para crear o unirse
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        username,
        password
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Error al iniciar sesión');
    }
  },

  async register(
    nombre: string,
    apellidos: string,
    email: string,
    username: string,
    password: string,
    passwordComprobacion: string,
    organizacion?: OrganizationData
  ) {
    try {
      const payload: any = {
        nombre,
        apellidos,
        username,
        email,
        password,
        passwordComprobacion
      };

      // Si el usuario quiere crear una organización, agregar los datos
      if (organizacion) {
        payload.organizacion = organizacion;
      }

      const response = await axios.post(`${API_URL}/auth/signup`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Error al registrarse');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
};

