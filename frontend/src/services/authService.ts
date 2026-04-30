import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

interface LoginResponse {
  token: string;
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

  async register(nombres: string, email: string, username: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        nombres,
        apellidos: '', // Backend puede ignorar esto si no lo requiere
        username,
        email,
        password
      });
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

