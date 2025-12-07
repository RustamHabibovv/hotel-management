import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockTasks, type Task } from '../data/task';
import { mockWorkers } from '../data/worker';
import '../styles/worker.css';

const Planning: React.FC = () => {
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(today.setDate(diff));
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const filteredTasks = selectedWorker
    ? mockTasks.filter(task => task.fkWorkeridWorker === selectedWorker)
    : mockTasks;


  const getTasksForDay = (date: Date): Task[] => {
    return filteredTasks.filter(task => {
      const uploadDate = new Date(task.uploadDate);
      const completionDate = new Date(task.completionDate);
      
      return uploadDate <= date && completionDate >= date;
    });
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

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getWorkerName = (workerId: number | null): string => {
    if (!workerId) return 'Unassigned';
    const worker = mockWorkers.find(w => w.id === workerId);
    return worker ? `${worker.name} ${worker.surname}` : 'Unknown';
  };

  const getTaskStatus = (task: Task, date: Date): 'starting' | 'ending' | 'ongoing' => {
    const uploadDate = new Date(task.uploadDate);
    const completionDate = new Date(task.completionDate);
    
    if (uploadDate.toDateString() === date.toDateString()) return 'starting';
    if (completionDate.toDateString() === date.toDateString()) return 'ending';
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

  return (
    <div className="worker-management-container">
      <div className="breadcrumb">
        <Link to="/task-list">← Back to the Task List</Link>
      </div>
      
      <header className="worker-header">
        <h1>📅 Worker's Planning</h1>
        <p>Weekly task schedule and assignments</p>
      </header>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <label htmlFor="worker-filter" style={{ marginRight: '0.5rem', color: '#5a6c7d', fontWeight: '500' }}>
              Filter by Worker:
            </label>
            <select
              id="worker-filter"
              value={selectedWorker || ''}
              onChange={(e) => setSelectedWorker(e.target.value ? parseInt(e.target.value) : null)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">All Workers</option>
              {mockWorkers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} {worker.surname} - {worker.jobs}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => navigateWeek('prev')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #667eea',
                background: '#667eea',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#764ba2';
                e.currentTarget.style.borderColor = '#764ba2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.borderColor = '#667eea';
              }}
            >
              ← Previous
            </button>
            <button
              onClick={goToToday}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #667eea',
                background: 'white',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#667eea';
              }}
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek('next')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #667eea',
                background: '#667eea',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#764ba2';
                e.currentTarget.style.borderColor = '#764ba2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.borderColor = '#667eea';
              }}
            >
              Next →
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1rem', color: '#5a6c7d', fontSize: '0.95rem' }}>
          <strong>Week of:</strong> {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {selectedWorker && (
            <span style={{ marginLeft: '1rem' }}>
              • Showing tasks for: <strong>{getWorkerName(selectedWorker)}</strong>
            </span>
          )}
        </div>
      </div>


      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {weekDays.map((day, index) => {
          const tasksForDay = getTasksForDay(day);
          const today = isToday(day);

          return (
            <div
              key={index}
              style={{
                background: today ? '#fffbeb' : 'white',
                border: today ? '3px solid #f59e0b' : '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1rem',
                minHeight: '300px',
                boxShadow: today ? '0 4px 12px rgba(245, 158, 11, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{
                textAlign: 'center',
                paddingBottom: '0.75rem',
                marginBottom: '0.75rem',
                borderBottom: '2px solid',
                borderColor: today ? '#f59e0b' : '#e0e0e0'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#5a6c7d',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: today ? '#f59e0b' : '#2c3e50'
                }}>
                  {day.getDate()}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#5a6c7d'
                }}>
                  {day.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tasksForDay.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '0.875rem',
                    padding: '2rem 0.5rem'
                  }}>
                    No tasks scheduled
                  </div>
                ) : (
                  tasksForDay.map(task => {
                    const status = getTaskStatus(task, day);
                    return (
                      <div
                        key={task.id}
                        style={{
                          background: '#f8f9fa',
                          borderLeft: '4px solid',
                          borderColor: getStatusColor(status),
                          padding: '0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          fontWeight: '600',
                          color: '#2c3e50',
                          marginBottom: '0.25rem',
                          lineHeight: '1.3'
                        }}>
                          {task.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#5a6c7d',
                          marginBottom: '0.25rem'
                        }}>
                          👤 {getWorkerName(task.fkWorkeridWorker)}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'white',
                          background: getStatusColor(status),
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                          fontWeight: '600'
                        }}>
                          {status === 'starting' ? '🚀 Starting' : 
                           status === 'ending' ? '✅ Ending' : '⏳ Ongoing'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>


      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>📖 Legend</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.9rem', color: '#5a6c7d' }}>🚀 Task Starting</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', background: '#f59e0b', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.9rem', color: '#5a6c7d' }}>⏳ Task Ongoing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', background: '#10b981', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.9rem', color: '#5a6c7d' }}>✅ Task Ending</span>
          </div>
        </div>
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