import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import {
  setToken,
  getToken,
  clearToken,
  setStoredUser,
  getStoredUser,
  clearStoredUser,
} from "../lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [token, cachedUser] = await Promise.all([getToken(), getStoredUser()]);
      if (!token) {
        await clearStoredUser();
        setLoading(false);
        return;
      }
      if (cachedUser) setUser(cachedUser);
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        await setStoredUser(res.data);
      } catch (err) {
        // Only an authentication rejection means the saved login is invalid.
        // Keep the cached session during temporary network/server failures.
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          await Promise.all([clearToken(), clearStoredUser()]);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    await setToken(res.data.token);
    // The login response's user object is minimal and doesn't include
    // groupMemberships — fetch the full profile via /me right away so
    // the group-gating check in app/(app)/_layout.js works immediately,
    // not just after an app relaunch.
    const meRes = await api.get("/auth/me");
    setUser(meRes.data);
    await setStoredUser(meRes.data);
    return meRes.data;
  }

  async function logout() {
    await Promise.all([clearToken(), clearStoredUser()]);
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
