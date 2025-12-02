import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockTasks, type Task } from '../data/task';
import { mockWorkers } from '../data/worker';
import '../styles/worker.css';

const getTasks = (): Task[] => {
  const stored = localStorage.getItem('tasks');
  return stored ? JSON.parse(stored) : mockTasks;
};
const saveTasks = (tasks: Task[]) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

const CreateTask: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    uploadDate: '',
    completionDate: '',
    reserved: false,
    fkWorkeridWorker: null as number | null,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentTasks = getTasks();

    const newTask: Task = {
      id: currentTasks.length + 1,
      name: formData.name,
      taskId: 1000 + currentTasks.length + 1,
      uploadDate: new Date(formData.uploadDate).toISOString(),
      completionDate: new Date(formData.completionDate).toISOString(),
      reserved: formData.reserved,
      idTask: `T${String(currentTasks.length + 1).padStart(3, '0')}`,
      fkWorkeridWorker: formData.fkWorkeridWorker,
    };

    const updatedTasks = [...currentTasks, newTask];
    saveTasks(updatedTasks);

    setShowSuccess(true);

    setFormData({
      name: '',
      uploadDate: '',
      completionDate: '',
      reserved: false,
      fkWorkeridWorker: null,
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'fkWorkeridWorker') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value ? parseInt(value) : null 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const currentTaskCount = getTasks().length;

  return (
    <div className="worker-management-container">
      <div className="breadcrumb">
        <Link to="/workers">← Back to Worker Management</Link>
      </div>
      
      <header className="worker-header">
        <h1>📝 Create a Task</h1>
      </header>

      {showSuccess && (
        <div className="success-banner">
          ✅ Task Created with success !
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
            <label htmlFor="uploadDate">Starting day *</label>
            <input
              type="datetime-local"
              id="uploadDate"
              name="uploadDate"
              value={formData.uploadDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="completionDate">End day *</label>
            <input
              type="datetime-local"
              id="completionDate"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="fkWorkeridWorker">Assign to a worker</label>
          <select
            id="fkWorkeridWorker"
            name="fkWorkeridWorker"
            value={formData.fkWorkeridWorker || ''}
            onChange={handleChange}
          >
            <option value="">-- No worker assigned --</option>
            {mockWorkers.map(worker => (
              <option key={worker.id} value={worker.id}>
                {worker.name} {worker.surname} - {worker.jobs}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="reserved"
              checked={formData.reserved}
              onChange={handleChange}
            />
            <span>Reserved/important task</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            ✅ Create the task
          </button>
          <Link to="/workers" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      <div className="info-box">
        <h3>📊 Actual statistics</h3>
        <p>Total number of tasks : <strong>{currentTaskCount}</strong></p>
        <p>Avalaible workers: <strong>{mockWorkers.length}</strong></p>
      </div>
    </div>
  );
};

export default CreateTask;