import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types/User';
import { deleteUser, searchUsers } from '../../services/userService';
import { useAuth } from '../../services/AuthContext';
import '../../styles/UserManagement.css';

const AdminUserManagement = () => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await searchUsers(query);
      setUsers(list);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    if (currentUser && currentUser.id === id) {
      alert('You cannot delete yourself.');
      return;
    }
    await deleteUser(id);
    await load();
  };


return (
  <div className="page">
    {/* HEADER */}
    <div className="page-header">
      <h1>User Management (Admin)</h1>
      <Link to="/users/new">+ Create User</Link>
    </div>

    {/* SEARCH */}
    <form className="search-form" onSubmit={handleSearch}>
      <input
        placeholder="Search by name, username, email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>

    {/* TABLE */}
    <table className="table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.username}</td>
            <td>
              {u.firstName} {u.lastName}
            </td>
            <td>{u.email}</td>
            <td>
              <span
                className={`role-badge role-${u.role.toLowerCase()}`}
              >
                {u.role}
              </span>
            </td>
           <td>
  <Link to={`/users/${u.id}/edit`}>Edit</Link>
  <button
    type="button"
    onClick={() => handleDelete(u.id)}
  >
    Delete
  </button>
</td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};

export default AdminUserManagement;
