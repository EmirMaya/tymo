import { NextResponse } from "next/server";
import cookie from "cookie";

export const POST = async () => {
  try {
    // Respuesta JSON
    const res = NextResponse.json({
      success: true,
      message: "Sesión cerrada",
    });

    // Eliminar cookie JWT
    res.headers.set(
      "Set-Cookie",
      cookie.serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0), // Expira inmediatamente
        path: "/",
      })
    );

    return res;
  } catch (err) {
    console.error("Error cerrando sesión: ", err);
    return NextResponse.json(
      { success: false, message: "Error cerrando sesión" },
      { status: 500 }
    );
  }
};
