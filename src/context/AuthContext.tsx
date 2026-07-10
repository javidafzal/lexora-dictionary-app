import React, { createContext, useContext, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  savedWords: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleSavedWord: (wordId: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, ask the API if we already have a valid session cookie.
  useEffect(() => {
    api
      .get<{ user: AuthUser }>("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const { user } = await api.post<{ user: AuthUser }>("/auth/login", { email, password });
      setUser(user);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in. Try again.");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const { user } = await api.post<{ user: AuthUser }>("/auth/signup", { name, email, password });
      setUser(user);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create your account. Try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    api.post("/auth/logout").catch(() => {
      /* cookie will simply expire client-side even if this call fails */
    });
  };

  const toggleSavedWord = (wordId: string) => {
    if (!user) return;
    const already = user.savedWords.includes(wordId);
    const optimistic = already
      ? user.savedWords.filter((id) => id !== wordId)
      : [...user.savedWords, wordId];

    setUser({ ...user, savedWords: optimistic });

    api
      .post<{ savedWords: string[] }>(`/saved/${wordId}`)
      .then(({ savedWords }) => setUser((current) => (current ? { ...current, savedWords } : current)))
      .catch(() => setUser((current) => (current ? { ...current, savedWords: user.savedWords } : current)));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, toggleSavedWord, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
