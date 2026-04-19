import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Dashboard />
      </div>
    </AuthProvider>
  );
};

export default App;

