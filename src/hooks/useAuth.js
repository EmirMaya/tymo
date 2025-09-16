"use client";
import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const { data } = await axios.get("/api/auth/me", {
          withCredentials: true,
        });

        if (data.authenticated) {
          if (!cancelled) {
            setUser(data.user);
            setLoading(false);
          }
        } else {
          router.replace("/login");
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Error checking auth:", err);
        }
        router.replace("/login");
      }
    };
    checkAuth();
    return() => {cancelled = true}
  }, [router]);

  const logout = async () => {
    try {
      // borrado de coockie
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      router.replace("/login");
    } catch (err) {
      console.err("Error al cerrar sesion: ", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
