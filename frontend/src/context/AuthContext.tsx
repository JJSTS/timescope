import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  login: (username: string, token: string) => void;
  username?: string;
  setIsAuthenticated: (value: boolean) => void;
  setUsername: (value: string | undefined) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>();

  // Al cargar el componente, verificar si hay sesión guardada
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    console.log('AuthProvider inicializado. Token:', !!token, 'Username:', storedUsername);

    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      console.log('Sesión restaurada desde localStorage:', storedUsername);
    }
  }, []);

  // Monitorear cambios en localStorage (cuando otro tab hace cambios)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage cambió. Event:', e.key);
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');

      if (token && storedUsername) {
        setIsAuthenticated(true);
        setUsername(storedUsername);
        console.log('Usuario actualizado desde storage:', storedUsername);
      } else {
        setIsAuthenticated(false);
        setUsername(undefined);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Monitorear cambios manuales en localStorage desde la misma ventana
  // Esto se llama cuando LoginForm guarda el username
  useEffect(() => {
    const checkLocalStorage = () => {
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');

      if (token && storedUsername && storedUsername !== username) {
        console.log('Username cambió en localStorage:', storedUsername);
        setIsAuthenticated(true);
        setUsername(storedUsername);
        console.log('Username actualizado en AuthContext:', storedUsername);
      }
    };

    // Verificar inmediatamente
    checkLocalStorage();

    // Y también crear un intervalo de chequeo frecuente (para la misma ventana)
    const interval = setInterval(checkLocalStorage, 100);
    return () => clearInterval(interval);
  }, [username]);

  const logout = () => {
    console.log('Logout ejecutado');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(undefined);
  };

  const login = (newUsername: string, token: string) => {
    console.log('Login ejecutado para usuario:', newUsername);
    localStorage.setItem('token', token);
    localStorage.setItem('username', newUsername);
    setIsAuthenticated(true);
    setUsername(newUsername);
  };

  console.log('AuthContext render. Username:', username, 'IsAuth:', isAuthenticated);

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, login, username, setUsername, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

