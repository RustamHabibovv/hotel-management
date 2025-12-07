import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏨 Hotel Management System
        </Link>

        <div className="navbar-content">
          {/* MAIN MENU */}
          <ul className="navbar-menu">
            {/* Show User Management / Profile only if logged in */}
            {user && (
              <li className="navbar-item">
                <Link to="/users" className="navbar-link">
                  {isAdmin ? 'User Management' : 'My Profile'}
                </Link>
              </li>
            )}

            {user && (
              <li className="navbar-item">
                <Link to="/my-reservations" className="navbar-link">
                  Reservation Management
                </Link>
              </li>
            )}

            {/* Admin-only links */}
            {isAdmin && (
              <>
                <li className="navbar-item">
                  <Link to="/rooms" className="navbar-link">
                    Room Management
                  </Link>
                </li>
                <li className="navbar-item">
                  <Link to="/workers" className="navbar-link">
                    Worker Management
                  </Link>
                </li>
                <li className="navbar-item">
                  <Link to="/payments" className="navbar-link">
                    Payment Management
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* AUTH ACTIONS */}
          <div className="navbar-auth">
            {!user ? (
              <>
                <Link to="/login" className="navbar-link auth-link">
                  Sign In
                </Link>
                <Link to="/register" className="navbar-link-button">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="navbar-user">
                  {user.firstName} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="navbar-link-button"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
