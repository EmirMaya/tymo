"use client";
import { ClipLoader } from "react-spinners";
import Calendar from "./components/Calendar";
import Header from "./components/Header";
import { useAuth } from "@/hooks/useAuth";
export default function Home() {
  const {user, loading} = useAuth();



  if (loading || (!loading && !user)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-darkbg">
        <ClipLoader size={70} color="#005DFF" />
      </div>
    );
  }

  

  return (
    <div className="bg-darkbg flex text-frenchgray">
      <Header />
      {user ? <Calendar userDni={user.dni} /> : <div>No se encontró el DNI.</div>}
    </div>
  );
  
}
