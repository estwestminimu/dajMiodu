import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("dm_token"));
  const [loading, setLoading] = useState(true);

  // Przy starcie sprawdź czy token jest ważny
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("dm_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (tokenVal, userData) => {
    localStorage.setItem("dm_token", tokenVal);
    setToken(tokenVal);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("dm_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
