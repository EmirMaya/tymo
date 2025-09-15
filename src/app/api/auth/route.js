import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; //bcrypt para comparar la contraseña
import cookie from "cookie"; // Importamos jsonwebtoken para crear el JWT
import pool from '@/app/api/db/mysql';

const JWT_SECRET = process.env.JWT_SECRET;

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { dni, password } = body;
    // console.log('dni: ',dni);
    // console.log('password: ', password);
    
        
    // buscamos al user
    const [rows] = await pool.query('SELECT * FROM users WHERE dni = ?', [dni]);
    const user = rows[0]; // obtenemos al primer user si existe
    // console.log('user0: ', user);

  

    if (user) {
      // COMPARAMOS PASSWORD PROPORCIONADA CON LA ALMACENADA, USANDO BCRYPT
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        // si es correecta la pass generamos jwt
        const token = jwt.sign({ dni: user.dni, name: user.name, role: user.role }, JWT_SECRET, {
          expiresIn: "1h",
        });



        // filtro por usuario


        // ENVIO JWT
        const res = NextResponse.json({
          success: true,
          user: {
            name: user.name,
            dni: user.dni,
            role: user.role
          },
        });
 
        
        // añado la coockie a los headers de la respuesta
        res.headers.set(
          "Set-Cookie", 
          cookie.serialize('token', token, {
            httpOnly:true,
            secure: process.env.NODE_ENV=== 'production',
            sameSite: 'strict',
            maxAge: 60*60*24*7, // 7 DIAS
            path: '/',
          })
        );
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
    console.error("Error en la autenticación: ", err);
    return NextResponse.json(
      { success: false, message: "Error en el servidor" },
      { status: 500 }
    );
  }
};
