import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockTasks, type Task } from '../data/task';
import { mockWorkers } from '../data/worker';
import '../styles/worker.css';

// Helper function to get worker name from ID
const getWorkerName = (workerId: number | null): string => {
  if (!workerId) return 'No worker assigned';
  const worker = mockWorkers.find(w => w.id === workerId);
  return worker ? `${worker.name} ${worker.surname}` : 'Unknown worker';
};

const TaskList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('All Tasks');

  // Determine task status based on dates and reserved flag
  const getTaskStatus = (task: Task): 'Completed' | 'In Progress' | 'Pending' => {
    const now = new Date();
    const completionDate = new Date(task.completionDate);
    const uploadDate = new Date(task.uploadDate);

    if (completionDate < now) {
      return 'Completed';
    } else if (uploadDate <= now && task.reserved) {
      return 'In Progress';
    } else {
      return 'Pending';
    }
  };

  // Filter tasks based on selected status
  const filteredTasks = mockTasks.filter(task => {
    if (statusFilter === 'All Tasks') return true;
    return getTaskStatus(task) === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b'; // Orange
      case 'In Progress':
        return '#3b82f6'; // Blue
      case 'Completed':
        return '#10b981'; // Green
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extract room number from task name if it contains "Room XXX"
  const extractRoomNumber = (taskName: string): string | null => {
    const match = taskName.match(/Room\s+(\d+)/i);
    return match ? match[1] : null;
  };

  return (
    <div className="worker-management-container">
      <div className="breadcrumb">
        <Link to="/workers">← Back to Worker Management</Link>
      </div>
      
      <header className="worker-header">
        <h1>📋 Task List</h1>
        <p>Manage and track all worker tasks</p>
      </header>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <label htmlFor="status-filter" style={{ marginRight: '0.5rem', color: '#5a6c7d' }}>
            Filter by status:
          </label>
          <select 
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option>All Tasks</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <span style={{ color: '#5a6c7d', fontSize: '1.1rem', fontWeight: '500' }}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="check-message">
          <h2>📭 No Tasks Available</h2>
          <p>There are currently no tasks matching your filter. Try a different status!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {filteredTasks.map(task => {
            const status = getTaskStatus(task);
            const roomNumber = extractRoomNumber(task.name);
            
            return (
              <div key={task.id} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                border: '3px solid',
                borderColor: status === 'Completed' ? '#10b981' : 
                            status === 'In Progress' ? '#3b82f6' : '#f59e0b',
                borderLeft: '8px solid',
                position: 'relative',
                transition: 'all 0.25s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: '600', 
                      color: '#2c3e50',
                      marginBottom: '0.5rem',
                      lineHeight: '1.3'
                    }}>
                      {task.name}
                    </h2>
                    {roomNumber && (
                      <p style={{ 
                        color: '#667eea', 
                        fontSize: '0.95rem',
                        fontWeight: '500'
                      }}>
                        🏨 Room {roomNumber}
                      </p>
                    )}
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: getStatusColor(status),
                    whiteSpace: 'nowrap'
                  }}>
                    {status}
                  </span>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🆔</span>
                    <span style={{ color: '#5a6c7d', fontSize: '0.9rem' }}>
                      Task ID: <strong style={{ color: '#2c3e50' }}>{task.idTask}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>👤</span>
                    <span style={{ color: '#5a6c7d', fontSize: '0.9rem' }}>
                      Assigned to: <strong style={{ color: '#2c3e50' }}>{getWorkerName(task.fkWorkeridWorker)}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📤</span>
                    <span style={{ color: '#5a6c7d', fontSize: '0.9rem' }}>
                      Upload: {formatDate(task.uploadDate)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📅</span>
                    <span style={{ color: '#5a6c7d', fontSize: '0.9rem' }}>
                      Due: {formatDate(task.completionDate)}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <span style={{ color: '#5a6c7d', fontSize: '0.9rem' }}>
                    Task #{task.taskId}
                  </span>
                  <Link 
                    to={`/tasks/${task.id}`}
                    style={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: '500',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.25s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#764ba2';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="navigation-link">
        <Link to="/planning" className="nav-button">
          📅 Access Planning →
        </Link>
      </div>
    </div>
  );
};

export default TaskList;