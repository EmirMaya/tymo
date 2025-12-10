import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; //bcrypt para comparar la contraseña
import cookie from "cookie"; // Importamos jsonwebtoken para crear el JWT

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

export const POST = async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    const { dni, password } = body;
    // console.log('dni: ',dni);
    // console.log('password: ', password);

    // buscamos al user
    const user = await User.findOne({ dni });
    console.log(user);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "DNI incorrecto" },
        { status: 401 }
      );
    }

    // comparo pass con bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Contraseña Incorrecta" },
        { status: 401 }
      );
    }

    // si coincide, genero JWT
    const token = jwt.sign(
      { dni: user.dni, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // envio res
    const res = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        dni: user.dni,
        role: user.role,
      },
    });

    // añadimos cookie HTTPonly
    res.headers.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: "/",
      })
    );

    return res;
  } catch (err) {
    console.error("Error en la autenticación: ", err);
    return NextResponse.json(
      { success: false, message: "Error en el servidor" },
      { status: 500 }
    );
  }
};