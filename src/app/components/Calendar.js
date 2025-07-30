"use client";

import React, { useState, useEffect, use } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español

import axios from "axios";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import ArrowButton from "./ArrowButton";
import { redirect } from "next/dist/server/api-utils";
dayjs.locale("es");
const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [holidays, setHolidays] = useState([]);
  const startOfMounth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMounth.day(); //domingo
  const daysInMonth = currentDate.daysInMonth();

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = currentDate.year();
        const res = await axios.get(
          `https://api.argentinadatos.com/v1/feriados/${year}`
        );

        setHolidays(res.data);
      } catch (error) {
        console.error("Error al cargar feriados: ", error);
      }
    };

    fetchHolidays();
  }, [currentDate]);

  const days = [];

  let totalHours = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = currentDate.clone().date(d);
    const dayOfWeek = date.day(); // 1 a 5 = lunes a viernes
    // const isHoliday = holidays.some(
    //   (h) => h.fecha === date.format("YYYY-MM-DD")
    // );

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      totalHours += 6;
    }
  }

  for (let i = 0; i < startDay; i++) {
    days.push(null); // dias vacios al principio
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  //   CAMBIAR DE MESES PARA ATRAS Y ADELANTE
  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  return (
    <div className="mt-7 p-6 w-screen">
      <div className="flex justify-between items-center mb-4">
        <ArrowButton
          onClick={handlePrevMonth}
          Icon={ChevronLeftIcon}
          direction="left"
        />
        <h2 className="text-2xl font-bold mb-4">
          {currentDate.format("MMMM YYYY")}
        </h2>
        <ArrowButton
          onClick={handleNextMonth}
          Icon={ChevronRightIcon}
          direction="right"
        />
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"].map((day) => (
          <div key={day} className="font-bold">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const isRealDay = day !== null;

          let isHoliday = false;
          if (isRealDay) {
            const date = currentDate.clone().date(day).format("YYYY-MM-DD");
            isHoliday = holidays.some((d) => d.fecha === date);
          }

          return (
            <div
              key={index}
              className="border border-gray-300 rounded-md h-24 flex flex-col items-start bg-white text-left text-xs"
            >
              {isRealDay && (
                <>
                  <div
                    className={`text-sm font-bold w-full rounded-t-md px-1 text-white ${
                      isHoliday ? "bg-violet-400" : "bg-teal-400"
                    }`}
                  >
                    {day}
                  </div>

                  {/* Mostrar horario fijo si es día hábil y no feriado */}
                  {(() => {
                    const date = currentDate.clone().date(day);
                    const weeklyDay = date.day(); // 0 = domingo, 1 = lunes, etc.
                    const isWorkyDay = weeklyDay >= 1 && weeklyDay <= 5;

                    if (isWorkyDay) {
                      return (
                        <div className="mt-1">
                          <div>🕒 9:30 - 15:30</div>
                          <div>⏱️ 6 hs</div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </div>
          );
        })}
      </div>
      {totalHours > 0 && (
        <div className="mt-4 bg-teal-600 text-white p-2 rounded">
          Total del mes: {totalHours} hs
        </div>
      )}
    </div>
  );
};

export default Calendar;
