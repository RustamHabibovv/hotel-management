import { type FormEvent, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { allRoles, createUser } from '../services/userService';
import { useAuth } from '../services/AuthContext';
import '../styles/UserForm.css';
import type { UserRole } from '../types/User';


const CreateUser = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<{
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
}>({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'GUEST',
  password: '',
});

  const [error, setError] = useState('');

  if (!isAdmin) {
    return <Navigate to="/users" replace />;
  }

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]:
      name === 'role' ? (value as UserRole) : value,
  }));
};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createUser(form);
      navigate('/users');
    } catch {
      setError('Failed to create user');
    }
  };

  return (
    <div className="user-form-page">
      <h1>Create User</h1>

      <div className="user-form-card">
        <form onSubmit={handleSubmit}>
          <div className="user-form-grid">
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                {allRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/users')}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
