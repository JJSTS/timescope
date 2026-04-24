import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import UsuariosList from './UsuariosList';
import TareasList from './TareasList';
import ProyectosList from './ProyectosList';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'usuarios' | 'tareas' | 'proyectos'>('perfil');

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setActiveTab('perfil')} />;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>⏱️ TimeScope</h1>
        </div>
        <div className="navbar-menu">
          <button
            className={`nav-btn ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            👤 Mi Perfil
          </button>
          <button
            className={`nav-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            👥 Usuarios
          </button>
          <button
            className={`nav-btn ${activeTab === 'tareas' ? 'active' : ''}`}
            onClick={() => setActiveTab('tareas')}
          >
            ✓ Tareas
          </button>
          <button
            className={`nav-btn ${activeTab === 'proyectos' ? 'active' : ''}`}
            onClick={() => setActiveTab('proyectos')}
          >
            📋 Proyectos
          </button>
          <button className="logout-btn" onClick={logout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'perfil' && <UserProfile />}
        {activeTab === 'usuarios' && <UsuariosList />}
        {activeTab === 'tareas' && <TareasList />}
        {activeTab === 'proyectos' && <ProyectosList />}
      </main>
    </div>
  );
};

export default Dashboard;

