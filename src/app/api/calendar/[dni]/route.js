import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "src/app/api/db/calendar/calendar.json"
);

export const GET = async (req, { params }) => {
  try {
    const { dni } = params;
    const fileData = await readFile(filePath, "utf8");
    const calendar = JSON.parse(fileData);
    const userData = calendar.find((u) => u.DNI === dni);
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, fechas: userData.fechas || [] });
  } catch (err) {
    console.error("Error al leer calendario:", err);
    return NextResponse.json(
      { success: false, message: "Error servidor" },
      { status: 500 }
    );
  }
};

export const PUT = async (req, { params }) => {
  try {
    const { dni } = params;
    const body = await req.json();
    const { fechas } = body;

    const fileData = await readFile(filePath, "utf8");
    const calendar = JSON.parse(fileData);

    const userIndex = calendar.findIndex((u) => u.DNI === dni);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    // Actualizamos las fechas
    calendar[userIndex].fechas = fechas;

    // Guardamos de nuevo en el JSON
    await writeFile(filePath, JSON.stringify(calendar, null, 2), "utf8");
    return NextResponse.json({ success: true, fechas });
  } catch (err) {
    console.error("Error al guardar calendario:", err);
    return NextResponse.json(
      { success: false, message: "Error servidor" },
      { status: 500 }
    );
  }
};
