import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WeekendHour from "@/models/WeekendHour";

//put /api/calendar/weekend

export async function PUT(req) {
  try {
    await connectDB();

    const { userDni, date, ingreso } = await req.json();

    if (!userDni || !date || !ingreso) {
      return NextResponse.json(
        { success: false, message: "Faltan campos: userDni, date, ingreso" },
        { status: 400 }
      );
    }

    // normalizamos a "HH:MM"
    const ingresoStr =
      ingreso.length === 5 ? ingreso : ingreso.toString().slice(0, 5);

    const workedDate = new Date(date);

    await WeekendHour.updateOne(
      { userDni, workedDate },
      { $set: { ingresoTime: ingresoStr } },
      { upsert: true }
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
    await connectDB();

    const { userDni, date } = await req.json();

    if (!userDni || !date) {
      return NextResponse.json(
        { success: false, message: "Faltan campos: userDni, date" },
        { status: 400 }
      );
    }

    const workedDate = new Date(date);

    await WeekendHour.deleteOne({ userDni, workedDate });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error eliminando weekend hour:", err);
    return NextResponse.json(
      { success: false, message: "Error eliminando" },
      { status: 500 }
    );
  }
}
