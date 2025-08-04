'use client';
import React,{useState} from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Login = () => {
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [showPassword, setShowPassword]  = useState(false);
  
   return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg">
        <form
        //   onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md"
        >
          <h2 className="text-xl font-bold mb-4">
            Ingresar como administrador
          </h2>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="border p-2 pr-10 rounded w-full"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  
}

export default Login