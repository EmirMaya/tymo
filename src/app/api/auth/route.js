import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { dni, password } = body;

    const filePath = path.join(process.cwd(), "src/app/api/db/user.json");
    const fileData = await readFile(filePath, "utf8");
    const users = JSON.parse(fileData);

    const user = users.find(
      (u) => u.DNI === dni && u.password === password
    );

    if (user) {
  
      return NextResponse.json({
        success: true,
        user: {
          name: user.name,  // Solo el nombre
          DNI: user.DNI,    // Y el DNI
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: "DNI o Contraseña Incorrecta" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("Error en la autenticación:", err);
    return NextResponse.json(
      { success: false, message: "Error en el servidor" },
      { status: 500 }
    );
  }
};
