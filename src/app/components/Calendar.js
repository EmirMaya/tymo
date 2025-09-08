"use client";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español
import axios from "axios";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import ArrowButton from "./ArrowButton";

dayjs.locale("es");
const Calendar = ({ userDni }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [workedDates, setWorkedDates] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const startOfMounth = currentDate.startOf("month");
  const startDay = startOfMounth.day(); //domingo
  const daysInMonth = currentDate.daysInMonth();
  const [weekendHours, setWeekendHours] = useState({});

  const getDayHours = (dateStr) => {
    const date = dayjs(dateStr);
    const weeklyDay = date.day();
    const isWorkDay = weeklyDay >= 1 && weeklyDay <= 5;
    const isHoliday = holidays.some((h) => h.fecha === dateStr);
    const isWorked = workedDates.includes(dateStr);
    const isWeekend = weeklyDay === 0 || weeklyDay === 6;
    // Fines de semana trabajados
    if (isWeekend && isWorked) {
      const ingreso = weekendHours[dateStr] || "8:00"; // horario por defecto 8:00
      const [hour, minute] = ingreso.split(":").map(Number);

      // Sábado a partir de 13 → doble, Domingo → siempre doble
      if ((weeklyDay === 6 && hour >= 13) || weeklyDay === 0) {
        return 12;
      }
      return 6; // sábado antes de 13
    }

    // Feriados
    if (isHoliday && isWorked) return 12;
    if (isHoliday && !isWorked && isWorkDay) return 6;

    // Días normales de semana
    if (!isHoliday && isWorked) return 6;

    return 0;
  };

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
  //cargar fechas trabajadas desde el back, una vez que haya
  useEffect(() => {
    if (!userDni) return;
    const fetchWorkedDates = async () => {
      try {
        const res = await axios.get(`/api/calendar/${userDni}`);
        if (res.data.success) {
          setWorkedDates(res.data.fechas || []);
        } else {
          console.warn(
            "No se encontraron fechas para este user: ",
            res.data.message
          );
          setWorkedDates([]);
        }
      } catch (err) {
        console.error("Error al cargar fechas trabajadas: ", err);
        setWorkedDates([]);
      }
    };
    fetchWorkedDates();
  }, [userDni]);

  //Alternar dia trabajado
  const toggleWorkedDate = async (dateStr) => {
    if (!userDni) return; // no hacemos nada si no hay DNI

    // Verificamos si la fecha ya está marcada
    const isWorked = workedDates.includes(dateStr);
    const updatedDates = isWorked
      ? workedDates.filter((d) => d !== dateStr)
      : [...workedDates, dateStr];

    // Actualizamos la UI inmediatamente (optimistic update)
    setWorkedDates(updatedDates);

    try {
      const res = await axios.put(`/api/calendar/${userDni}`, {
        fechas: updatedDates,
      });

      if (!res.data.success) {
        // Si el backend no actualizó, revertimos cambios en UI
        console.warn("No se pudo actualizar en el servidor:", res.data.message);
        setWorkedDates(workedDates);
      }
    } catch (err) {
      console.error("Error al guardar fechas trabajadas:", err);
      // Revertimos cambios en la UI si hubo error
      setWorkedDates(workedDates);
    }
  };

  // Construir días calendario
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null); // dias vacios al principio
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  //Calcular horas con reglas de feriados
  let totalHours = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = currentDate.clone().date(d);
    const dateStr = date.format("YYYY-MM-DD");
    const isWorked = workedDates.includes(dateStr);
    const weeklyDay = date.day();

    totalHours += getDayHours(dateStr); // ahora getDayHours contempla fines de semana
  }

  //   CAMBIAR DE MESES PARA ATRAS Y ADELANTE
  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  return (
    <div className="mt-7 p-6 w-screen ">
      <div className="flex justify-between items-center mb-4 w-1/3 border border-bluenavydk bg-bluenavydk rounded-md">
        <ArrowButton
          onClick={handlePrevMonth}
          Icon={ChevronLeftIcon}
          direction="left"
        />
        <h2 className="text-2xl font-bold text-linencream w-full text-center">
          {currentDate.format("MMMM YYYY")}
        </h2>
        <ArrowButton
          onClick={handleNextMonth}
          Icon={ChevronRightIcon}
          direction="right"
        />
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-linencream">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"].map((day) => (
          <div key={day} className="font-bold bg-midnightblue rounded-md">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-24"></div>;
          }

          const date = currentDate.clone().date(day);
          const dateStr = date.format("YYYY-MM-DD");

          const isHoliday = holidays.some((h) => h.fecha === dateStr);
          const isWorked = workedDates.includes(dateStr);
          const weeklyDay = date.day();
          const isWorkDay = weeklyDay >= 1 && weeklyDay <= 5;
          const isWeekend = weeklyDay === 0 || weeklyDay === 6;
          return (
            <div
              key={index}
              className={`relative rounded-md h-24 flex flex-col items-start text-left text-xs select-none bg-bluenavydk`}
              title={
                isHoliday
                  ? "Feriado"
                  : isWorked
                  ? "Día trabajado"
                  : "Día no trabajado"
              }
            >
              <div
                className={`text-sm font-bold w-[26px] rounded-tl-md px-1 text-center 
                 ${
                   isHoliday
                     ? "bg-imperialred text-white"
                     : "bg-crayolablue text-white"
                 }
                `}
              >
                {day}
              </div>

              {/* Mostrar horas */}
              <div className="mt-1">
                {isWorked && isWeekend && (
                  <select
                    value={weekendHours[dateStr] || "8:00"}
                    onChange={(e) =>
                      setWeekendHours({
                        ...weekendHours,
                        [dateStr]: e.target.value,
                      })
                    }
                    className="text-xs rounded px-1 py-0.5 bg-darkbg text-white"
                  >
                    {Array.from({ length: (16 - 8) * 2 + 1 }, (_, i) => {
                      const hour = Math.floor((8 * 2 + i) / 2);
                      const minute = i % 2 === 0 ? "00" : "30";
                      return `${hour}:${minute}`;
                    }).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                )}
                {/* Mostrar horas siempre que corresponda */}
                {getDayHours(dateStr) > 0 && (
                  <div className="mt-1 text-base">
                    ⏱️ {getDayHours(dateStr)} hs
                  </div>
                )}
              </div>

              {/* Botón pequeño en esquina superior derecha */}

              <div
                onClick={(e) => {
                  e.stopPropagation(); // evitar que el click propague al div padre
                  toggleWorkedDate(dateStr);
                }}
                className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-sm  cursor-pointer
            ${isWorked ? "bg-aeroblue" : "bg-darkbg hover:bg-aeroblue"}
          `}
                title={
                  isWorked ? "Desmarcar día trabajado" : "Marcar día trabajado"
                }
              >
                {isWorked && <CheckIcon className="w-6 h-6 text-white" />}
              </div>
            </div>
          );
        })}
      </div>
      {totalHours > 0 && (
        <div className="mt-4 bg-bluenavydk text-white p-2 rounded">
          Horas mensuales trabajadas: {totalHours} hs
        </div>
      )}
    </div>
  );
};

export default Calendar;
