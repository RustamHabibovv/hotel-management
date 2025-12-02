import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/worker.css';

const WorkerManagement: React.FC = () => {
  return (
    <div className="worker-management-container">
      <header className="worker-header">
        <h1>👥 Worker Management</h1>
        <p>Manage the tasks, hours and affectations of your workers.</p>
      </header>

      <div className="main-navigation">
        <Link to="/create-task" className="nav-card">
          <div className="nav-card-icon">📝</div>
          <h2>Create a Task</h2>
          <p>Assign a new task to a worker</p>
          <span className="nav-arrow">→</span>
        </Link>

        <Link to="/task-list" className="nav-card">
          <div className="nav-card-icon">📋</div>
          <h2>Task List</h2>
          <p>See all the tasks and access the planning</p>
          <span className="nav-arrow">→</span>
        </Link>
      </div>
    </div>
  );
};

export default WorkerManagement;