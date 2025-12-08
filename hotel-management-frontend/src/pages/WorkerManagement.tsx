import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import '../styles/worker.css';

const WorkerManagement: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user has admin or worker role
    const role = user.role?.toLowerCase();
    if (role !== 'admin' && role !== 'staff') {
      alert('Access denied. Only admins and workers can access this page.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    // Clear tokens and user data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    
    alert('You have been logged out successfully.');
    navigate('/login');
  };

  // Show loading while checking auth
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="worker-management-container">
      <header className="worker-header">
        <h1>👥 Worker Management</h1>
        <p>Manage the tasks, hours and affectations of your workers.</p>
        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
          Welcome, {user.firstName} {user.lastName} ({user.role})
        </p>
      </header>

      <div className="main-navigation">
        <Link to="/create-task" className="nav-card">
          <div className="nav-card-icon">📝</div>
          <h2>Create or edit a Task</h2>
          <p>Create a new task or edit one.</p>
          <span className="nav-arrow">→</span>
        </Link>

        <Link to="/task-list" className="nav-card">
          <div className="nav-card-icon">📋</div>
          <h2>Task List</h2>
          <p>See all the tasks and access the planning</p>
          <span className="nav-arrow">→</span>
        </Link>
      </div>

      <div style={{ 
        marginTop: '40px', 
        display: 'flex', 
        justifyContent: 'center' 
      }}>
        <button 
          onClick={handleLogout}
          style={{
            padding: '12px 30px',
            fontSize: '1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default WorkerManagement;