'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Calendar from "./components/Calendar";
import Header from "./components/Header";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // si no hay token, redirigir a login
      router.push('/login');
    }
  }, [router]);

  return (


    <div className="bg-darkbg flex text-frenchgray">
      <Header />
      <Calendar />
    </div>
  );
}
