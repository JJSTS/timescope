import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  login: (username: string, token: string) => void;
  username?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Inicializa el estado directamente desde localStorage
    const token = localStorage.getItem('token');
    return !!token;
  });
  const [username, setUsername] = useState<string | undefined>(() => {
    // Inicializa el username directamente desde localStorage
    return localStorage.getItem('username') || undefined;
  });

  // Efecto para escuchar cambios en otras pestañas
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        const token = event.newValue;
        setIsAuthenticated(!!token);
      }
      if (event.key === 'username') {
        setUsername(event.newValue || undefined);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (newUsername: string, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', newUsername);
    setUsername(newUsername);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(undefined);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
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
