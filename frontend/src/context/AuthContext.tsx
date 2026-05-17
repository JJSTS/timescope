import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  login: (username: string, token: string) => Promise<void>; // Devuelve una promesa
  username?: string;
  userRole?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | undefined>();
  const [userRole, setUserRole] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true); // Estado para la carga inicial

  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/usuarios/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const userData = response.data;
          
          if (userData) {
            setIsAuthenticated(true);
            setUsername(userData.username);
            const role = userData.rol || 'USER';
            setUserRole(role);
            localStorage.setItem('username', userData.username);
            localStorage.setItem('userRole', role);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    checkUserStatus();
  }, []);

  const login = async (newUsername: string, token: string): Promise<void> => {
    localStorage.setItem('token', token);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data;
      if (userData) {
        const role = userData.rol || 'USER';
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userRole', role);
        setUsername(userData.username);
        setUserRole(role);
        setIsAuthenticated(true);
      } else {
        logout();
        throw new Error("No se pudieron obtener los datos del usuario.");
      }
    } catch (error) {
      logout();
      throw error; // Re-lanza el error para que el formulario de login lo pueda capturar
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setUsername(undefined);
    setUserRole(undefined);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Verificando sesión...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
