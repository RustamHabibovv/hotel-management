import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import '../styles/worker.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface Task {
  id?: number;
  name: string;
  start_datetime: string;
  end_datetime: string;
  reserved: boolean;
  worker: number | null;
}

const CreateTask: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    start_datetime: '',
    end_datetime: '',
    reserved: false,
    worker: null,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/worker/tasks/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("TASKS FROM API = ", response.data);
      setTasks(response.data.results);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };
  

  const handleModeChange = (newMode: 'create' | 'edit') => {
    setMode(newMode);
    setError('');
    setShowSuccess(false);
    
    if (newMode === 'create') {
      setFormData({
        name: '',
        start_datetime: '',
        end_datetime: '',
        reserved: false,
        worker: null,
      });
      setSelectedTaskId(null);
    }
  };

  const handleTaskSelect = async (taskId: number) => {
    if (!taskId) return; // Ne rien faire si aucune tâche n'est sélectionnée
    
    setSelectedTaskId(taskId);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/worker/tasks/${taskId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const task = response.data;
      setFormData({
        name: task.name || '',
        start_datetime: task.start_datetime ? task.start_datetime.slice(0, 16) : '',
        end_datetime: task.end_datetime ? task.end_datetime.slice(0, 16) : '',
        reserved: task.reserved || false,
        worker: task.worker ?? null,
      });
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        name: formData.name,
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime,
        reserved: formData.reserved,
        worker: null, 
      };

      if (mode === 'create') {
        await axios.post(`${API_BASE_URL}/worker/tasks/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          name: '',
          start_datetime: '',
          end_datetime: '',
          reserved: false,
          worker: null,
        });
      } else {
        await axios.put(`${API_BASE_URL}/worker/tasks/${selectedTaskId}/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowSuccess(true);
      }

      // Refresh tasks list
      fetchTasks();
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving task:', err);
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="worker-management-container">
      <div className="breadcrumb">
        <Link to="/workers">← Back to Worker Management</Link>
      </div>
      
      <header className="worker-header">
        <h1>📝 {mode === 'create' ? 'Create a Task' : 'Edit a Task'}</h1>
        <p className="subtitle">
          {mode === 'create' 
            ? 'Create unassigned tasks. Workers can claim them later.' 
            : 'Modify existing task details.'}
        </p>
      </header>

      {/* Mode Selector */}
      <div className="mode-selector" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center'
      }}>
        <button
          type="button"
          onClick={() => handleModeChange('create')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'create' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ➕ Create New Task
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('edit')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'edit' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ✏️ Edit Existing Task
        </button>
      </div>

      {/* Task selector for edit mode */}
      {mode === 'edit' && (
        <div className="form-group">
          <label htmlFor="taskSelect">Select a task to edit *</label>
          <select
            id="taskSelect"
            value={selectedTaskId || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                handleTaskSelect(parseInt(value));
              }
            }}
            required
          >
            <option value="">-- Select a task --</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.name || `Task #${task.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {showSuccess && (
        <div className="success-banner">
          ✅ Task {mode === 'create' ? 'created' : 'updated'} successfully!
        </div>
      )}

      {error && (
        <div className="error-message" style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="name">Task Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Clean Up Room 101"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_datetime">Starting Date/Time *</label>
            <input
              type="datetime-local"
              id="start_datetime"
              name="start_datetime"
              value={formData.start_datetime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_datetime">End Date/Time *</label>
            <input
              type="datetime-local"
              id="end_datetime"
              name="end_datetime"
              value={formData.end_datetime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="reserved"
              checked={formData.reserved}
              onChange={handleChange}
            />
            <span>Mark as reserved/important task</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? '✅ Create Task' : '💾 Update Task'}
          </button>
          <Link to="/workers" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      <div className="info-box">
        <h3>📊 Current Statistics</h3>
        <p>Total tasks: <strong>{tasks.length}</strong></p>
        <p className="info-note">Workers can claim their tasks in the Task List!</p>
      </div>
    </div>
  );
};

export default CreateTask;