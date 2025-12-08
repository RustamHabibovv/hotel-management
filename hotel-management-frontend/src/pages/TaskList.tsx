// TaskList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import '../styles/worker.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

type TaskFromApi = {
  id: number;
  name: string;
  reserved: boolean;
  worker: number | null;
  worker_name: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  upload_date?: string | null;
  completion_date?: string | null;
  // other fields possible
};

const TaskList: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskFromApi[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All Tasks' | 'Pending' | 'In Progress' | 'Completed'>('All Tasks');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const token = localStorage.getItem('access_token');

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/worker/tasks/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = res.data;
      // backend may return paginated object { results: [...] } or directly an array
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (Array.isArray(data.results)) {
        setTasks(data.results);
      } else {
        // defensive fallback
        console.warn('Unexpected tasks response shape', data);
        setTasks([]);
      }
    } catch (err: any) {
      console.error('Error fetching tasks', err);
      setError('Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Utility to determine status
  const getTaskStatus = (task: TaskFromApi): 'Completed' | 'In Progress' | 'Pending' => {
    if (task.completion_date) return 'Completed';
    if (task.worker) return 'In Progress';
    return 'Pending';
  };


  const getBorderColor = (task: TaskFromApi) => {
    if (task.completion_date) return '#3b82f6'; 
    if (task.worker) return '#10b981';
    if (task.reserved) return '#ef4444'; 
    return '#f59e0b'; 
  };

  const formatDate = (maybeDate?: string | null) => {
    if (!maybeDate) return '-';
    try {
      const d = new Date(maybeDate);
      return d.toLocaleString();
    } catch {
      return maybeDate;
    }
  };

  const handleClaim = async (taskId: number) => {
    if (!user) {
      alert('You must be logged in to claim a task.');
      return;
    }
  

    if (!user.worker_id) {
      alert('Only staff members can claim tasks.');
      console.log('User role:', user.role);
      console.log('Worker ID:', user.worker_id); 
      return;
    }
  
    try {
      const payload = {
        worker: user.worker_id,  
      };
    
      console.log("CLAIM → worker_id =", user.worker_id);
    
      await axios.put(`${API_BASE_URL}/worker/tasks/${taskId}/`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    
      await fetchTasks();
      alert('Task claimed successfully!');
    } catch (error: any) {
      console.error('Claim failed:', error);
      console.error('Response data:', error.response?.data);
      alert(`Failed to claim task: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!user) {
      alert('You must be logged in to delete a task.');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (String(task.worker) !== String(user.worker_id)) {
      alert('Only the worker who completed the task can delete it.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/worker/tasks/${taskId}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await fetchTasks();
      alert('Task deleted successfully.');
    } catch (err) {
      console.error('Delete failed', err);
      alert('Unable to delete task. Check console for details.');
    }
  };



  // Complete a task (only allowed for owner) — sets completion_date to now
  const handleComplete = async (task: TaskFromApi) => {
    if (!user) {
      alert('You must be logged in to complete a task.');
      return;
    }
    // compare as strings to be robust (user.id may be string)
    if (String(task.worker) !== String(user.worker_id)) {
      alert('Only the worker who claimed the task can complete it.');
      return;
    }

    try {
      const payload = {
        completion_date: new Date().toISOString(),
      };
      await axios.put(`${API_BASE_URL}/worker/tasks/${task.id}/`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await fetchTasks();
    } catch (err) {
      console.error('Complete failed', err);
      alert('Unable to complete task. Check console for details.');
    }
  };

  // Filter tasks for render
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'All Tasks') return true;
    return getTaskStatus(t) === statusFilter;
  });

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
            onChange={(e) => setStatusFilter(e.target.value as any)}
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
          {loading ? 'Loading...' : `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00' }}>
          {error}
        </div>
      )}

      {(!loading && filteredTasks.length === 0) ? (
        <div className="check-message" style={{ marginBottom: '2rem' }}>
          <h2>📭 No Tasks Found</h2>
          <p style={{ color: 'rgba(255,255,255,0.95)' }}>There are currently no tasks matching your filter.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {filteredTasks.map((task) => {
            const status = getTaskStatus(task);
            const borderColor = getBorderColor(task);

            return (
              <div key={task.id} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderLeft: `8px solid ${borderColor}`,
                border: `3px solid ${borderColor}`,
                position: 'relative',
                transition: 'all 0.25s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      color: '#2c3e50',
                      marginBottom: '0.5rem',
                      lineHeight: '1.3'
                    }}>{task.name}</h2>
                  </div>

                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: borderColor,
                    whiteSpace: 'nowrap'
                  }}>{status}</span>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>👤</span>
                    <span style={{ color: '#5a6c7d', fontSize: '0.95rem' }}>
                      <strong>Assigned to:</strong>{' '}
                      <strong style={{ color: '#2c3e50' }}>
                        {task.worker_name ?? 'No worker assigned'}
                      </strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📤</span>
                    <span style={{ color: '#5a6c7d', fontSize: '0.9rem' }}>
                      Upload: {formatDate(task.upload_date)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📅</span>
                    <span style={{ color: '#5a6c7d', fontSize: '0.9rem' }}>
                      Due: {formatDate(task.end_datetime ?? task.completion_date)}
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
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Claim button appears only if task is unclaimed and not completed */}
                  {!task.worker && !task.completion_date && (
                  <button
                    className="btn-primary"
                    onClick={() => handleClaim(task.id)}
                  >
                  Claim Task
                  </button>
                  )}

                  {/* Complete button appears only if task is claimed, not completed, and assigned to current user */}
                  {task.worker && !task.completion_date && String(task.worker) === String(user?.worker_id) && (
                  <button
                    className="btn-primary"
                    style={{ backgroundColor: '#10b981' }}
                    onClick={() => handleComplete(task)}
                  >
                  Complete Task
                  </button>
                  )}

                  {/* Delete Completed Task button */}
                  {task.completion_date && String(task.worker) === String(user?.worker_id) && (
                    <button
                      className="btn-danger"
                      style={{ backgroundColor: '#ef4444' }}
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete Task
                    </button>
                  )}
                </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="navigation-link">
        <Link to="/planning" className="nav-button">📅 Access Planning →</Link>
      </div>
    </div>
  );
};

export default TaskList;
