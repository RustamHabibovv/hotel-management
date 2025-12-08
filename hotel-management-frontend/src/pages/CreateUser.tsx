import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, allRoles } from "../services/userService";
import "../styles/UserManagement.css";

const CreateUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    registered_payment_method: "",
    role: "GUEST",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUser(form);
      navigate("/users"); // back to admin list page
    } catch (err) {
      console.error(err);
      setError("Failed to create user");
    }
  };

  return (
    <div className="page">
      <h1>Create User</h1>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>First Name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Last Name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Payment Method</label>
          <input
            name="registered_payment_method"
            value={form.registered_payment_method}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-row">
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* ---- NEW PASSWORD FIELDS ---- */}
        <div className="form-row">
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Create User
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/users")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
