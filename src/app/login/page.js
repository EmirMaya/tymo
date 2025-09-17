"use client";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dni || !password) {
      setError("Por favor completa todos los campos");
      return;
    }
    try {
      const res = await axios.post("/api/auth", { dni, password });
      // console.log("DATA: ", res.data);

      if (res.data.success) {
        setUser(res.data.user);
        setError("");
        router.push("/");
      }
    } catch (err) {
      setError("DNI o Contraseña Incorrecta");
    }
  };

  return (
    <div className="bg-darkbg min-h-screen">
      <div className="w-screen border-b-3 border-rblack">
        <Image src={'/logo-txt.png'} alt="logo" width={150} height={150}/>
      </div>

      <div className="my-22 flex flex-col items-center justify-center ">
        <form
          onSubmit={handleSubmit}
          className="bg-rblack px-6 py-16 rounded shadow-md text-linencream"
        >
          <h2 className="text-xl  font-bold mb-4">Iniciar Sesion</h2>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="DNI"
            className="p-2 rounded w-full mb-4 outline-none bg-inputblack"
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="p-2 pr-10 rounded w-full outline-none bg-inputblack"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-linear-to-b from-grlblue to-grdblue w-full text-white px-4 py-2 rounded hover:to-midnightblue"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
