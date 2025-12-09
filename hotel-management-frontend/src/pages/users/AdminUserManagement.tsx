import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { User } from "../../types/User";
import { deleteUser, getUsers } from "../../services/userService";
import { useAuth } from "../../services/AuthContext";
import "../../styles/UserManagement.css";

const AdminUserManagement = () => {
  const { user: currentUser } = useAuth();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------
  // LOAD USERS
  // --------------------------
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const list = await getUsers(); // returns array

      const q = query.toLowerCase();
      const filtered = list.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );

      setUsers(filtered);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }

    setLoading(false);
  };

  useEffect(() => {
    load(); // load once on open
  }, []);

  // --------------------------
  // SEARCH
  // --------------------------
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    load();
  };

  // --------------------------
  // DELETE USER
  // --------------------------
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;

    if (currentUser && Number(currentUser.id) === Number(id)) {
      alert("You cannot delete yourself.");
      return;
    }

    try {
      await deleteUser(id);
      await load();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>User Management (Admin)</h1>
        <Link to="/users/new">+ Create User</Link>
      </div>

      {/* SEARCH */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <div className="error-text">{error}</div>}
      {loading && <div>Loading...</div>}

      {/* TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Payment Method</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.registered_payment_method || "-"}</td>
              <td>
                <span className={`role-badge role-${u.role.toLowerCase()}`}>
                  {u.role}
                </span>
              </td>
              <td>
                <Link to={`/users/${u.id}/edit`}>Edit</Link>{" "}
                <button type="button" onClick={() => handleDelete(u.id)}>
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
