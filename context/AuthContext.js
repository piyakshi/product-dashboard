"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/api/auth";
import {
  setToken,
  getToken,
  clearToken,
  setStoredUser,
  getStoredUser,
} from "@/lib/auth-cookies";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // hydration guard
  const router = useRouter();

  // On first mount, pull whatever's in the cookie so a page refresh
  // doesn't lose the "logged in" UI state (name in navbar, etc).
  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    setToken(data.token);
    const u = { id: data.id, username: data.username, email: data.email, image: data.image };
    setStoredUser(u);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, isAuthed: !!getToken() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
