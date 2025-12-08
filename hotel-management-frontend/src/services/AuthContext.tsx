import React, {
  createContext,
  useContext,
  useEffect
} from 'react';
import { useState } from "react";
import type { ReactNode } from "react";

import type { User } from '../types/User';
import { loginWithCredentials } from './userService';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void; // for profile updates
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const CURRENT_USER_KEY = 'hm_current_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      setUserState(JSON.parse(raw));
    }
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  const login = async (username: string, password: string) => {
    const found = await loginWithCredentials(username, password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const value: AuthContextValue = {
    user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
