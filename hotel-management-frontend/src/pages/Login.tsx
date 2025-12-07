import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';
import { useAuth } from '../services/AuthContext';
import { type User } from '../types/User';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'guest' as 'guest' | 'staff' | 'admin',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call custom backend login endpoint (email and password)
      const response = await axios.post(`${API_BASE_URL}/auth/custom-login/`, {
        email: formData.email,
        password: formData.password,
      });

      const { access, refresh, user: backendUser } = response.data;

      // Store JWT tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Use user data from backend
      const loggedInUser: User = {
        id: backendUser.id.toString(),
        username: backendUser.email.split('@')[0],
        firstName: backendUser.name,
        lastName: backendUser.surname,
        email: backendUser.email,
        role: backendUser.role,
        password: '', // Don't store password
      };

      // Save user in AuthContext
      setUser(loggedInUser);

      alert(`Login successful! Welcome ${loggedInUser.firstName} ${loggedInUser.lastName}!`);

      // Redirect based on role
      const userRole = backendUser.role?.toUpperCase();
      if (userRole === 'GUEST' || userRole === 'guest') {
        navigate('/my-reservations');
      } else if (userRole === 'ADMIN' || userRole === 'admin') {
        navigate('/users');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏨 Welcome Back</h1>
          <p>Sign in to your hotel management account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="userType">I am a:</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="guest">Guest</option>
              <option value="staff">Hotel Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="link">
              Forgot password?
            </Link>
          </div>

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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="link">
              Sign up here
            </Link>
          </p>
        </div>

        <div className="user-type-info">
          <div className="info-section">
            <h3>👤 Guest Access</h3>
            <p>Find rooms, manage reservations, view bills, and make bookings</p>
          </div>
          <div className="info-section">
            <h3>👔 Staff Access</h3>
            <p>Manage day-to-day hotel operations and customer services</p>
          </div>
          <div className="info-section">
            <h3>🔑 Admin Access</h3>
            <p>Full system control and management capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
