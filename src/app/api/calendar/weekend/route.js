import { NextResponse } from "next/server";
import pool from "@/app/api/db/mysql";

// PUT /api/calendar/weekend
export async function PUT(req) {
  try {
    const { userDni, date, ingreso } = await req.json();

    if (!userDni || !date || !ingreso) {
      return NextResponse.json(
        { success: false, message: "Faltan campos: userDni, date, ingreso" },
        { status: 400 }
      );
    }

    // Normalizar a HH:MM:SS para MySQL
    const ingresoSql = ingreso.length === 5 ? `${ingreso}:00` : ingreso;

    await pool.query(
      `INSERT INTO weekend_hours (user_dni, worked_date, ingreso_time)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE ingreso_time = VALUES(ingreso_time)`,
      [userDni, date, ingresoSql]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error guardando weekend hour:", err);
    return NextResponse.json(
      { success: false, message: "Error guardando" },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/weekend
export async function DELETE(req) {
  try {
    const { userDni, date } = await req.json();

    if (!userDni || !date) {
      return NextResponse.json(
        { success: false, message: "Faltan campos: userDni, date" },
        { status: 400 }
      );
    }

    await pool.query(
      "DELETE FROM weekend_hours WHERE user_dni = ? AND worked_date = ?",
      [userDni, date]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error eliminando weekend hour:", err);
    return NextResponse.json(
      { success: false, message: "Error eliminando" },
      { status: 500 }
    );
  }
}
