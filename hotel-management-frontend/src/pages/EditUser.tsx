import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import type { User } from '../types/User';
import { allRoles, getUserById, updateUser } from '../services/userService';
import { useAuth } from '../services/AuthContext';

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  if (!isAdmin) {
    return <Navigate to="/users" replace />;
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const found = id ? await getUserById(id) : undefined;
      if (!found) {
        setError('User not found');
      } else {
        setUser(found);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!user) return;
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    try {
      await updateUser(user);
      navigate('/users');
    } catch (err) {
      setError('Failed to update user');
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <div className="page">User not found</div>;

  return (
    <div className="page">
      <h1>Edit User</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Username</label>
          <input
            name="username"
            value={user.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>First Name</label>
          <input
            name="firstName"
            value={user.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Last Name</label>
          <input
            name="lastName"
            value={user.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Role</label>
          <select name="role" value={user.role} onChange={handleChange}>
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="form-actions">
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
