import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import '../styles/worker.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

type TaskFromApi = {
  id: number;
  name: string;
  worker: number | null;
  worker_name: string | null;
  upload_date?: string | null;
  start_datetime?: string | null;
  completion_date?: string | null;
  end_datetime?: string | null; 
};


const Planning: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  const [tasks, setTasks] = useState<TaskFromApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });


  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/worker/tasks/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = Array.isArray(res.data) ? res.data : res.data.results;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading planning tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });


  const filteredTasks = showOnlyMine && user?.worker_id
    ? tasks.filter(t => String(t.worker) === String(user.worker_id))
    : tasks;

  const getTasksForDay = (date: Date): TaskFromApi[] => {
    return filteredTasks.filter(task => {
      if (!task.start_datetime) return false;

      const upload = new Date(task.start_datetime);
      const end = task.end_datetime
        ? new Date(task.end_datetime)
        : upload;

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return upload <= dayEnd && end >= dayStart;
    });
  };


  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();

  const getTaskStatus = (task: TaskFromApi, date: Date) => {
    const upload = new Date(task.start_datetime!);
    const end = task.end_datetime ? new Date(task.end_datetime) : null;

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const uploadDay = new Date(upload);
    uploadDay.setHours(0, 0, 0, 0);

    const endDay = end ? new Date(end.setHours(0, 0, 0, 0)) : null;

    if (uploadDay.getTime() === day.getTime()) return 'starting';
    if (endDay && endDay.getTime() === day.getTime()) return 'ending';
    return 'ongoing';
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'starting': return '#3b82f6';
      case 'ending': return '#10b981';
      case 'ongoing': return '#f59e0b';
      default: return '#6b7280';
    }
  };


  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };


  return (
    <div className="worker-management-container">
      <div className="breadcrumb">
        <Link to="/task-list">← Back to the Task List</Link>
      </div>

      <header className="worker-header">
        <h1>📅 Worker's Planning</h1>
        <p>Weekly task schedule</p>
      </header>

      {/* FILTER */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <label>
          <input
            type="checkbox"
            checked={showOnlyMine}
            onChange={() => setShowOnlyMine(!showOnlyMine)}
            style={{ marginRight: '0.5rem' }}
          />
          Show only my tasks
        </label>
      </div>

      {/* NAVIGATION */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => navigateWeek('prev')}>← Previous</button>
        <button onClick={goToToday}>Today</button>
        <button onClick={() => navigateWeek('next')}>Next →</button>
      </div>

      {loading && <p>Loading planning...</p>}

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '1rem' }}>
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const today = isToday(day);

          return (
            <div key={index} style={{
              background: today ? '#fffbeb' : 'white',
              border: today ? '2px solid #f59e0b' : '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <h3 style={{ textAlign: 'center' }}>
                {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </h3>

              {dayTasks.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center' }}>No tasks</p>
              ) : (
                dayTasks.map(task => {
                  const status = getTaskStatus(task, day);

                  return (
                    <div key={task.id} style={{
                      borderLeft: `4px solid ${getStatusColor(status)}`,
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      background: '#f9fafb'
                    }}>
                      <strong>{task.name}</strong>
                      <div style={{ fontSize: '0.8rem' }}>
                        👤 {task.worker_name ?? 'Unassigned'}
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        background: getStatusColor(status),
                        color: 'white',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        {status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      <div className="navigation-link" style={{ marginTop: '2rem' }}>
        <Link to="/task-list" className="nav-button">
          📋 Back to Task List →
        </Link>
      </div>
    </div>
  );
};

export default Planning;
