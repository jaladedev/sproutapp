"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/api";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch authenticated user from /me
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/me");
      // Backend returns: { success: true, user: { ... } }
      setUser(res.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Call after successful login.
   * Backend login response: { message, data: { token } }
   */
  const login = async (token) => {
    localStorage.setItem("token", token);

    // Set cookie for middleware (auth_token + user_role)
    Cookies.set("auth_token", token, { expires: 7 });

    // Fetch user profile to determine role
    try {
      const res = await api.get("/me");
      const userData = res.data.user;
      setUser(userData);
      Cookies.set("user_role", userData.is_admin ? "admin" : "user", {
        expires: 7,
      });
      return userData;
    } catch {
      logout();
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token");
      Cookies.remove("auth_token");
      Cookies.remove("user_role");
      setUser(null);
    }
  };

  // Refresh user data from the server (e.g. after balance change)
  const refreshUser = async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data.user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, checkAuth, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}