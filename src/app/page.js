"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import Calendar from "./components/Calendar";
import Header from "./components/Header";

export default function Home() {
  const [loading, setLoading] = useState(true); // Estado de carga.
  const [userDni, setUserDni] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
   

    if (!token) {
      // si no hay token, redirigir a login
      router.push("/login");
    } else {
      const user = JSON.parse(localStorage.getItem('userData'));
      setUserDni(user?.DNI || null);
      // const monthData = localStorage.getItem("userMonthData");
      // if (monthData) {
      //   setUserMonthData(JSON.parse(monthData)); // Guardamos los datos del mes
      // }
      setLoading(false);
    }
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
        <div>No se encontró el DNI del usuario.</div>
      )}
    </div>
  );
}
