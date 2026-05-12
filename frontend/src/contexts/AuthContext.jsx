import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(username, password) {
    const u = await authApi.login(username, password);
    setUser(u);
    return u;
  }

  // register no longer sets session — account is pending until admin approves
  async function register(username, display_name, password, avatar) {
    const result = await authApi.register(username, display_name, password, avatar);
    return result; // { message, status: "pending" }
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  async function updateAvatar(avatar) {
    const u = await authApi.updateAvatar(avatar);
    setUser(u);
    return u;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
