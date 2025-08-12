import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import bycrpt from "bcryptjs";
import jwt from "jsonwebtoken"; //bcrypt para comparar la contraseña
import cookie from "cookie"; // Importamos jsonwebtoken para crear el JWT

const JWT_SECRET = process.env.JWT_SECRET;

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { dni, password } = body;

    const filePath = path.join(process.cwd(), "src/app/api/db/user.json");
    const fileData = await readFile(filePath, "utf8");
    const users = JSON.parse(fileData);
    // buscamos al user
    const user = users.find((u) => u.DNI === dni);

    if (user) {
      // COMPARAMOS PASSWORD PROPORCIONADA CON LA ALMACENADA, USANDO BCRYPT
      const passwordMatch = await bycrpt.compare(password, user.password);
      if (passwordMatch) {
        // si es correecta la pass generamos jwt
        const token = jwt.sign({ DNI: user.DNI, name: user.name }, JWT_SECRET, {
          expiresIn: "1h",
        });

        // obtener datos del mes
        const monthFilePath = path.join(process.cwd(), `src/app/api/db/month/april.json`);
        const monthData = await readFile(monthFilePath, 'utf8');
        const month = JSON.parse(monthData);

        // filtro por usuario
        const userMonthData = month.find(item => item.dni === dni);

        // ENVIO JWT
        const res = NextResponse.json({
          success: true,
          user: {
            name: user.name,
            DNI: user.DNI,
          },
          token,
          userMonthData,
        });

        //enviar token al front o coockies cookie al front
        const serializedCookie = cookie.serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 7 dias de validez
          path: "/",
        });

        // añado la coockie a los headers de la respuesta
        res.headers.set("Set-Cookie", serializedCookie);
        return res;
      } else {
        return NextResponse.json(
          { success: false, message: "Contraseña Incorrecta" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "DNI incorrecto" },
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
