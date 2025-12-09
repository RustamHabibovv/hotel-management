import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/User";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_LOGIN = "http://localhost:8000/api/auth/custom-login/";
const API_ME = "http://localhost:8000/api/auth/me/";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";

  // ----------------------------------------------------------
  // LOAD USER ON REFRESH (GET /auth/me/)
  // ----------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(API_ME, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token invalid");
        return res.json();
      })
      .then((data) => {
        // backend returns:
        // { id, name, surname, email, registered_payment_method, role }
        const mappedUser: User = {
          id: data.id,
          firstName: data.name,
          lastName: data.surname,
          email: data.email,
          registered_payment_method: data.registered_payment_method ?? "",
          role: data.role,
        };

        setUser(mappedUser);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ----------------------------------------------------------
  // LOGIN (POST /auth/custom-login/)
  // ----------------------------------------------------------
  const login = async (email: string, password: string) => {
    const res = await fetch(API_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Invalid email or password");

    const data = await res.json();

    const mappedUser: User = {
      id: data.user.id,
      firstName: data.user.name,
      lastName: data.user.surname,
      email: data.user.email,
      registered_payment_method: data.user.registered_payment_method ?? "",
      role: data.user.role,
    };

    localStorage.setItem("access_token", data.access);
    setUser(mappedUser);
  };

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------
  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
