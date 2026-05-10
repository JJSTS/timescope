import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}`;

interface LoginResponse {
  token: string;
  orgId?: number;
}

export const authService = {
  async login(username: string, password: string, orgNombre?: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        username,
        password,
        ...(orgNombre?.trim() ? { orgNombre: orgNombre.trim() } : {}),
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
  ) {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        nombre,
        apellidos,
        username,
        email,
        password,
        passwordComprobacion,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Error al registrarse');
    }
  },

  async changePassword(password: string, newPassword: string, passwordComprobacion: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/auth/password`, {
        password,
        newPassword,
        passwordComprobacion,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Error al cambiar la contraseña');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },
};
