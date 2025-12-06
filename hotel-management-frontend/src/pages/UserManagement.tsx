import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import AdminUserManagement from './users/AdminUserManagement';
import UserProfile from './users/UserProfile';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <AdminUserManagement /> : <UserProfile />;
};

export default UserManagement;
