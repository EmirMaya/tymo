import { NextResponse } from "next/server";
import pool from "@/app/api/db/mysql"; // ajusta si tu ruta es diferente

// GET /api/calendar/:dni
export const GET = async (req, { params }) => {
  try {
    const dni = params.dni;

    // 1) Fechas trabajadas
    const [rowsDates] = await pool.query(
      "SELECT worked_date FROM worked_dates WHERE user_dni = ? ORDER BY worked_date",
      [dni]
    );

    const fechas = rowsDates.map((row) =>
      row.worked_date.toISOString().split("T")[0]
    );

    // 2) Ingresos de fin de semana
    const [rowsHours] = await pool.query(
      "SELECT worked_date, ingreso_time FROM weekend_hours WHERE user_dni = ?",
      [dni]
    );

    // Mapa { 'YYYY-MM-DD': 'HH:MM' }
    const weekendHours = {};
    for (const r of rowsHours) {
      const dateStr = r.worked_date.toISOString().split("T")[0];
      // ingreso_time llega como 'HH:MM:SS' -> recortamos a 'HH:MM'
      weekendHours[dateStr] = (typeof r.ingreso_time === "string"
        ? r.ingreso_time
        : String(r.ingreso_time)
      ).slice(0, 5);
    }

    return NextResponse.json({ success: true, fechas, weekendHours });
  } catch (err) {
    console.error("Error al leer calendario:", err);
    return NextResponse.json(
      { success: false, message: "Error servidor" },
      { status: 500 }
    );
  }
};

// PUT /api/calendar/:dni
export const PUT = async (req, { params }) => {
  try {
    const dni = params.dni;
    const { fechas } = await req.json(); // array de fechas nuevas

    if (!Array.isArray(fechas)) {
      return NextResponse.json(
        { success: false, message: "Formato inválido: 'fechas' debe ser array" },
        { status: 400 }
      );
    }

    if (fechas.length === 0) {
      // Si envían un array vacío, borramos todas las fechas
      await pool.query("DELETE FROM worked_dates WHERE user_dni = ?", [dni]);
      return NextResponse.json({ success: true, fechas: [] });
    }

    // 1) Borramos las fechas que no están en el nuevo array
    await pool.query(
      "DELETE FROM worked_dates WHERE user_dni = ? AND worked_date NOT IN (?)",
      [dni, fechas]
    );

    // 2) Insertamos o actualizamos fechas (si ya existían, ON DUPLICATE KEY las mantiene)
    const values = fechas.map((d) => [dni, d, 6]);
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
