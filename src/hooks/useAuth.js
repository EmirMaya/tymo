"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      // borrado de coockie
      await axios.post('/api/auth/logout', {}, {withCredentials: true});
      setUser(null);
      router.replace('/login');
    } catch (err) {
      console.err('Error al cerrar sesion: ', err);
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get("/api/auth/me", {
          withCredentials: true,
        });

        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.replace("/login");
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Error checking auth:", err);
        }
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  return { user, loading, logout };
};
