import { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { updatePassword, updateUser } from '../../services/userService';
import '../../styles/UserManagement.css';
import '../../styles/Modal.css';

const UserProfile = () => {
  const { user, setUser } = useAuth();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState(user);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!user || !profile) return null;

  /* ===== HANDLERS ===== */

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateUser(profile);
    setUser(updated);
    setShowEditProfile(false);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    await updatePassword(user.id, passwordForm.newPassword);
    setShowPassword(false);
  };

  return (
    <div className="page">
      <h1>My Profile</h1>

      {/* ===== PROFILE INFO ===== */}
      <div className="table" style={{ padding: '1rem' }}>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-primary"
            onClick={() => setShowEditProfile(true)}
          >
            Edit Profile
          </button>

          <button
            className="btn-secondary"
            onClick={() => setShowPassword(true)}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* ===== EDIT PROFILE MODAL ===== */}
      {showEditProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditProfile(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProfileSave}>
              <label>First Name</label>
              <input
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
              />

              <label>Last Name</label>
              <input
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
              />

              <label>Email</label>
              <input
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditProfile(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CHANGE PASSWORD MODAL ===== */}
      {showPassword && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Change Password</h2>
              <button
                className="modal-close"
                onClick={() => setShowPassword(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordSave}>
              <label>Old Password</label>
              <input
                type="password"
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                }
              />

              <label>New Password</label>
              <input
                type="password"
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />

              <label>Confirm New Password</label>
              <input
                type="password"
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowPassword(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
