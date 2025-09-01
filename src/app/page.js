"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import Calendar from "./components/Calendar";
import Header from "./components/Header";
import axios from "axios";

export default function Home() {
  const [loading, setLoading] = useState(true); // Estado de carga.
  const [userDni, setUserDni] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get("/api/auth/me", {
          withCredentials: true,
        });

        if (data.authenticated) {
          setUserDni(data.user.dni);
        } else {
          router.replace("/login"); // mejor que push para no mantener historial
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-darkbg">
        <ClipLoader size={70} color="#36d7b7" />
      </div>
    );
  }
  return (
    <div className="bg-darkbg flex text-frenchgray">
      <Header />
      {userDni ? (
        <Calendar userDni={userDni} />
      ) : (
        <div>No se encontró el DNI.</div>
      )}
    </div>
  );
}
