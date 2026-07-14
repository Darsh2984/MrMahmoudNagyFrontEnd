import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import { setToken, getToken, clearToken } from "../lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        // Token invalid/expired — clear it and send back to login.
        await clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    await setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
