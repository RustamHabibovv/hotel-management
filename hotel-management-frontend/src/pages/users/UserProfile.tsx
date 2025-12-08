import { useState } from "react";
import { useAuth } from "../../services/AuthContext";
import { updateProfile, updatePassword } from "../../services/userService";
import "../../styles/UserManagement.css";
import "../../styles/Modal.css";

const UserProfile = () => {
  const { user, setUser } = useAuth();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

const [profileForm, setProfileForm] = useState({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
  registered_payment_method: user?.registered_payment_method || "",
});

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) return <div className="page">Loading...</div>;

  // ---------------------------------------------------
  // Convert backend result → frontend User format
  // ---------------------------------------------------
  function normalizeUser(u: any) {
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      registered_payment_method: u.registered_payment_method ?? "",
      role: u.role,
    };
  }

  // ---------------------------------------------------
  // SAVE PROFILE CHANGES
  // ---------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedUser = await updateProfile(Number(user.id), profileForm);

      // 🔥 FIX: Normalize backend → frontend shape
      setUser(normalizeUser(updatedUser));

      setShowEditProfile(false);
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  // ---------------------------------------------------
  // SAVE NEW PASSWORD
  // ---------------------------------------------------
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await updatePassword(
        Number(user.id),
        passwordForm.oldPassword,
        passwordForm.newPassword
      );

      alert("Password updated successfully!");
      setShowPasswordModal(false);
    } catch (err) {
      alert("Failed to change password.");
    }
  };

  return (
    <div className="page">
      <h1>My Profile</h1>

      <div className="table" style={{ padding: "1rem" }}>
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Payment Method:</strong> {user.registered_payment_method || "-"}</p>
        <p><strong>Role:</strong> {user.role}</p>

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button className="btn-primary" onClick={() => setShowEditProfile(true)}>
            Edit Profile
          </button>

          <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
        </div>
      </div>

      {/* ----------------------- EDIT PROFILE MODAL ----------------------- */}
      {showEditProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setShowEditProfile(false)}>×</button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <label>First Name</label>
              <input
                value={profileForm.firstName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, firstName: e.target.value })
                }
              />

              <label>Last Name</label>
              <input
                value={profileForm.lastName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, lastName: e.target.value })
                }
              />
               <label>Email</label>
               <input
  value={profileForm.email}
  onChange={(e) =>
    setProfileForm({ ...profileForm, email: e.target.value })
  }
/>


              <label>Payment Method</label>
              <input
                value={profileForm.registered_payment_method}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    registered_payment_method: e.target.value,
                  })
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

      {/* ----------------------- PASSWORD MODAL ----------------------- */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>

            <form onSubmit={handleSavePassword}>
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
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Change Password
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
