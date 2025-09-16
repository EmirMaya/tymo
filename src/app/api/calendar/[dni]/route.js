import { NextResponse } from "next/server";
import pool from "@/app/api/db/mysql"; // ajusta si tu ruta es diferente

export const GET = async (req, context) => {
  try {
    const dni = context.params.dni;

    const [rows] = await pool.query(
      "SELECT worked_date FROM worked_dates WHERE user_dni = ?",
      [dni]
    );

    const fechas = rows.map(row =>
      row.worked_date.toISOString().split("T")[0]
    );

    return NextResponse.json({ success: true, fechas });
  } catch (err) {
    console.error("Error al leer calendario:", err);
    return NextResponse.json(
      { success: false, message: "Error servidor" },
      { status: 500 }
    );
  }
};

export const PUT = async (req, context) => {
  try {
    const dni = context.params.dni;
    const { fechas } = await req.json(); // array de fechas nuevas

    if (!fechas || fechas.length === 0) {
      // Si envían un array vacío, borramos todas las fechas
      await pool.query("DELETE FROM worked_dates WHERE user_dni = ?", [dni]);
      return NextResponse.json({ success: true, fechas: [] });
    }

    // 1️⃣ Borramos las fechas que no están en el nuevo array
    await pool.query(
      "DELETE FROM worked_dates WHERE user_dni = ? AND worked_date NOT IN (?)",
      [dni, fechas]
    );

    // 2️⃣ Insertamos o actualizamos fechas (si ya existían, ON DUPLICATE KEY las mantiene)
    const values = fechas.map(d => [dni, d, 6]);
    await pool.query(
      `INSERT INTO worked_dates (user_dni, worked_date, hours) VALUES ? 
       ON DUPLICATE KEY UPDATE hours = VALUES(hours)`,
      [values]
    );

    return NextResponse.json({ success: true, fechas });
  } catch (err) {
    console.error("Error al guardar calendario:", err);
    return NextResponse.json(
      { success: false, message: "Error servidor" },
      { status: 500 }
    );
  }
};
