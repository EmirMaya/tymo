"use client";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const startOfMounth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMounth.day(); //domingo
  const daysInMonth = currentDate.daysInMonth();

  const feriadosArgentina = [
    "2025-01-01", // Año Nuevo
    "2025-03-24", // Día de la Memoria
    "2025-04-02", // Malvinas
    "2025-05-01", // Día del trabajador
    "2025-05-25", // Revolución de Mayo
    "2025-06-20", // Paso a la inmortalidad de Belgrano
    "2025-07-09", // Independencia
    "2025-12-25", // Navidad
    // Agregá más según necesites
  ];

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null); // dias vacios al principio
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        {currentDate.format("MMMM YYYY")}
      </h2>
      <div className="grid grid-cols-7 gap-2 text-center">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"].map((day) => (
          <div key={day} className="font-bold">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const isRealDay = day !== null;

          let esFeriado = false;
          if (isRealDay) {
            const fecha = currentDate.clone().date(day).format("YYYY-MM-DD");
            esFeriado = feriadosArgentina.includes(fecha);
          }

          return (
            <div
              key={index}
              className="border border-gray-300 rounded-md h-24 flex flex-col items-start bg-white"
            >
              {isRealDay && (
                <div
                  className={`text-sm font-bold w-full rounded-t-md px-1 ${
                    esFeriado ? "bg-violet-400 text-white" : "bg-teal-200"
                  }`}
                >
                  {day}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
