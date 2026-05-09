import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  login: (username: string, token: string) => void; // Ya no necesita el rol aquí
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
          // Hay un token, vamos a verificarlo y obtener los datos del usuario
          const response = await axios.get('http://localhost:8080/api/v1/usuarios/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const userData = response.data;
          
          if (userData) {
            // Si todo está bien, establecemos el estado de autenticación
            setIsAuthenticated(true);
            setUsername(userData.username);
            // Asumimos que el rol viene en un array 'roles' y tomamos el primero
            const role = userData.roles && userData.roles.length > 0 ? userData.roles[0] : 'USER';
            setUserRole(role);
            localStorage.setItem('username', userData.username);
            localStorage.setItem('userRole', role);
          } else {
            // El token es inválido o el usuario no existe
            logout();
          }
        } catch (error) {
          // El token expiró o hubo un error de red
          logout();
        }
      }
      setLoading(false); // Terminamos la carga inicial
    };

    checkUserStatus();
  }, []);

  const login = (newUsername: string, token: string) => {
    // 1. Guardar el token
    localStorage.setItem('token', token);
    
    // 2. Obtener datos del usuario (incluyendo el rol)
    axios.get('http://localhost:8080/api/v1/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(response => {
      const userData = response.data;
      if (userData) {
        const role = userData.roles && userData.roles.length > 0 ? userData.roles[0] : 'USER';
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userRole', role);
        setUsername(userData.username);
        setUserRole(role);
        setIsAuthenticated(true);
      }
    }).catch(() => {
      // Si falla, limpiamos todo
      logout();
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setUsername(undefined);
    setUserRole(undefined);
    setIsAuthenticated(false);
  };

  // Muestra un loader mientras se verifica el estado de autenticación
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
