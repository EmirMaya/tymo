import { NextResponse } from "next/server";

import pool from "@/app/api/db/mysql";

export const GET = async (req, context) => {
  try {
    const dni = context.params.dni;

    const [rows] = await pool.query(
      "SELECT worked_date FROM worked_dates WHERE user_dni = ?",
      [dni]
    );

    const fechas = rows.map(
      (row) => row.worked_date.toISOString().split("T")[0]
    ); // yyyy-mm-dd

    return NextResponse.json({ success: true, fechas });
  } catch (err) {
    console.error("Error al leer calendario: ", err);
    return NextResponse.json(
      { success: false, message: "Error servidor" },
      { status: 500 }
    );
  }
};

export const PUT = async (req, context) => {
  try {
    const dni = context.params.dni;
    const body = await req.json();
    const { fechas } = body; // array de fechas nuevas que el usuario quiere tener

    // Obtenemos fechas actuales si es que las hay
    const [currentRows] = await pool.query(
      "SELECT worked_date FROM worked_dates WHERE user_dni = ?",
      [dni]
    );

    const currentDates = currentRows.map(
      (row) => row.worked_date.toISOString().split("T")[0]
    );

    //calculamos que fechas agregar y cuales eliminar
    const fechasParaAgregar = fechas.filter((d) => !currentDates.includes(d));
    const fechasParaEliminar = currentDates.filter((d) => !fechas.includes(d));

    //Insertar nuevas fechas
    if (fechasParaAgregar.length > 0) {
      const values = fechasParaAgregar.map((d) => [dni, d, 6]);
      await pool.query(
        "INSERT INTO worked_dates (user_dni, worked_date, hours) VALUES ?",
        [values]
      );
    }

    //Eliminar fechas desmarcadas
    if (fechasParaEliminar.length > 0) {
      await pool.query(
        "DELETE FROM worked_dates WHERE user_dni = ? AND worked_date IN (?)",
        [dni, fechasParaEliminar]
      );
    }
    return NextResponse.json({ success: true, fechas });
  } catch (err) {
    console.error("Error al guardar calendario:", err);
    return NextResponse.json(
      { success: false, message: "Error servidor" },
      { status: 500 }
    );
  }
};
