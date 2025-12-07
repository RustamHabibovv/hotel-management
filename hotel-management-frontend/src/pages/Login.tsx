import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { useAuth } from '../services/AuthContext';
import { type User } from '../types/User';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'guest' as 'guest' | 'staff' | 'admin',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Map UI user types to system roles
    const roleMap = {
      guest: 'GUEST',
      staff: 'WORKER',
      admin: 'ADMIN',
    } as const;

    // ✅ Mock authenticated user (for frontend project)
    const loggedInUser: User = {
      id: Date.now().toString(),
      username: formData.email.split('@')[0],
      firstName:
        formData.userType === 'admin'
          ? 'Admin'
          : formData.userType === 'staff'
          ? 'Staff'
          : 'Guest',
      lastName: 'User',
      email: formData.email,
      role: roleMap[formData.userType],
      password: formData.password, // demo only
    };

    // ✅ Save user in AuthContext
    setUser(loggedInUser);

    alert(`Login successful as ${loggedInUser.role}!`);

    // ✅ Redirect to user management / profile
    navigate('/users');
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

          <button type="submit" className="btn-primary">
            Sign In
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
