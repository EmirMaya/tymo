"use client";
import { ClipLoader } from "react-spinners";
import Calendar from "./components/Calendar";
import Header from "./components/Header";
import { useAuth } from "@/hooks/useAuth";
export default function Home() {
  const {user, loading} = useAuth();



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-darkbg">
        <ClipLoader size={70} color="#36d7b7" />
      </div>
    );
  }

  
  if (!user) {
    // Si no hay usuario, el hook ya debería redirigir, pero dejamos fallback
    return null;
  }

  return (
    <div className="bg-darkbg flex text-frenchgray">
      <Header />
      <Calendar userDni={user.dni} />
    </div>
  );
  
}
