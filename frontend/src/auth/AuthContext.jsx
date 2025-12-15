import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [access, setAccess] = useState(localStorage.getItem("access") || "");
  const [refresh, setRefresh] = useState(localStorage.getItem("refresh") || "");

  async function loadMe(token) {
    const r = await fetch("/api/auth/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return r.json();
  }

  useEffect(() => {
    if (!access) return;
    loadMe(access)
      .then(setUser)
      .catch(() => setUser(null));
  }, [access]);

  function setTokens({ access, refresh }) {
    setAccess(access);
    setRefresh(refresh);
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
  }

  function logout() {
    setUser(null);
    setAccess("");
    setRefresh("");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }

  return (
    <AuthContext.Provider value={{ user, access, refresh, setTokens, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
