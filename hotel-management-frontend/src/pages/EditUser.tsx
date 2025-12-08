import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import type { User } from "../types/User";
import { getUser, updateUser, allRoles } from "../services/userService";
import { useAuth } from "../services/AuthContext";

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Only admins can edit users
  if (!isAdmin) return <Navigate to="/users" replace />;

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);

      try {
        if (!id) {
          setError("Invalid user ID");
          return;
        }

        const found = await getUser(Number(id));
        setUser(found);
      } catch (err) {
        setError("User not found");
      }

      setLoading(false);
    };

    loadUser();
  }, [id]);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Submit update
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser(user.id, user);
      navigate("/users");
    } catch (err) {
      console.error(err);
      setError("Failed to update user");
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <div className="page">User not found</div>;

  return (
    <div className="page">
      <h1>Edit User</h1>

      <form className="card" onSubmit={handleSubmit}>
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
          <label>Payment Method</label>
          <input
            name="registered_payment_method"
            value={user.registered_payment_method || ""}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-row">
          <label>Role</label>
          <select
            name="role"
            value={user.role}
            onChange={handleChange}
          >
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
