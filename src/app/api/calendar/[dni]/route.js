import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkedDate from "@/models/WorkedDate";
import WeekendHour from "@/models/WeekendHour";

// GET /api/calendar/:dni
export const GET = async (req, { params }) => {
  try {
    await connectDB();

    const dni = params.dni;

    // fechas trabajadas
    const rowsDates = await WorkedDate.find({ userDni: dni })
      .sort({ WorkedDate: 1 })
      .lean();

    const fechas = rowsDates.map(
      (row) => row.workedDate.toISOString().split("T")[0]
    );

    //fin de semanas
    const rowsHours = await WeekendHour.find({ userDni: dni }).lean();
    // Mapa { 'YYYY-MM-DD': 'HH:MM' }
    const weekendHours = {};
    for (const r of rowsHours) {
      const dateStr = r.workedDate.toISOString().split("T")[0];
      const timeStr = (r.ingresoTime || "").toString().slice(0, 5); // "HH:MM"
      weekendHours[dateStr] = timeStr;
    }

    return NextResponse.json({ success: true, fechas, weekendHours });
  } catch (err) {
    console.error("Error al leer calendario:", err);
    return NextResponse.json(
      { success: false, message: "Error servidor" },
      { status: 500 }
    );
  }

  // PUT /api/calendar/:dni
  export const PUT = async (req, { params }) => {
    try {
      await connectDB();

      const dni = params.dni;
      const { fechas } = await req.json(); // array de fechas nuevas (YYYY-MM-DD)

      if (!Array.isArray(fechas)) {
        return NextResponse.json(
          {
            success: false,
            message: "Formato inválido: 'fechas' debe ser array",
          },
          { status: 400 }
        );
      }

      if (fechas.length === 0) {
        // Si envían un array vacío, borramos todas las fechas
        await WorkedDate.deleteMany({ userDni: dni });
        return NextResponse.json({ success: true, fechas: [] });
      }

      // Convertimos strings "YYYY-MM-DD" a Date
      const dateObjects = fechas.map((d) => new Date(d));

      // 1) Borramos las fechas que NO estén en el nuevo array
      await WorkedDate.deleteMany({
        userDni: dni,
        workedDate: { $nin: dateObjects },
      });

      // 2) Insertamos/actualizamos (upsert) cada fecha con hours = 6
      const ops = dateObjects.map((dateObj) => ({
        updateOne: {
          filter: { userDni: dni, workedDate: dateObj },
          update: { $set: { hours: 6 } },
          upsert: true,
        },
      }));

      await WorkedDate.bulkWrite(ops);

      return NextResponse.json({ success: true, fechas });
    } catch (err) {
      console.error("Error al guardar calendario:", err);
      return NextResponse.json(
        { success: false, message: "Error servidor" },
        { status: 500 }
      );
    }
  };
};
