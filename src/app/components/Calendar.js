"use client";
import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
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
  const [workedDates, setWorkedDates] = useState([]);        // ["YYYY-MM-DD", ...]
  const [weekendHours, setWeekendHours] = useState({});      // { "YYYY-MM-DD": "HH:MM" }
  const [holidays, setHolidays] = useState([]);              // [{ fecha: "YYYY-MM-DD", ... }, ...]

  // Datos de mes actual
  const startOfMonth = currentDate.startOf("month");
  const startDay = startOfMonth.day(); // domingo=0
  const daysInMonth = currentDate.daysInMonth();

  // Opciones 08:00 → 16:00 cada 30'
  const timeOptions = useMemo(() => {
    const out = [];
    for (let h = 8; h <= 16; h++) {
      out.push(`${h}:00`);
      if (h < 16) out.push(`${h}:30`);
    }
    return out;
  }, []);

  /** ---------- CARGA DE DATOS ---------- */
  // Feriados por año (si cambia el año del mes actual)
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = currentDate.year();
        const { data } = await axios.get(
          `https://api.argentinadatos.com/v1/feriados/${year}`
        );
        setHolidays(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar feriados: ", error);
        setHolidays([]);
      }
    };
    fetchHolidays();
  }, [currentDate]);

  // Fechas trabajadas + ingresos de finde
  useEffect(() => {
    if (!userDni) return;
    const fetchWorked = async () => {
      try {
        const { data } = await axios.get(`/api/calendar/${userDni}`);
        if (data?.success) {
          setWorkedDates(data.fechas || []);
          setWeekendHours(data.weekendHours || {});
        } else {
          setWorkedDates([]);
          setWeekendHours({});
        }
      } catch (err) {
        console.error("Error al cargar fechas/ingresos: ", err);
        setWorkedDates([]);
        setWeekendHours({});
      }
    };
    fetchWorked();
  }, [userDni]);

  /** ---------- LÓGICA DE HORAS ---------- */
  const getDayHours = (dateStr) => {
    const date = dayjs(dateStr);
    const weekday = date.day(); // 0=Dom
    const isWorkDay = weekday >= 1 && weekday <= 5;
    const isHoliday = holidays.some((h) => h.fecha === dateStr);
    const isWorked = workedDates.includes(dateStr);
    const isWeekend = weekday === 0 || weekday === 6;

    if (isWeekend && isWorked) {
      const ingresoStr = weekendHours[dateStr] || "8:00";
      const [ingresoHour, ingresoMinute] = ingresoStr.split(":").map(Number);

      if (weekday === 6) {
        // Sábado: 6 h siempre (normales hasta 13:00, dobles después)
        const jornadaTotal = 6;
        const start = ingresoHour + ingresoMinute / 60;
        const end = start + jornadaTotal;
        const normales = Math.max(0, Math.min(13, end) - start);
        const dobles = Math.max(0, end - Math.max(13, start)) * 2;
        return normales + dobles;
      }
      if (weekday === 0) return 12; // Domingo: siempre doble (6h * 2)
    }

    // Feriados
    if (isHoliday && isWorked) return 12;         // trabajado en feriado = doble 6h*2
    if (isHoliday && !isWorked && isWorkDay) return 6; // no trabajado en feriado y día laboral = 6h base

    // Días normales de semana trabajados
    if (!isHoliday && isWorked) return 6;

    return 0;
  };

  /** ---------- ACCIONES ---------- */
  // Alternar día trabajado
  const toggleWorkedDate = async (dateStr) => {
    if (!userDni) return;

    const wasWorked = workedDates.includes(dateStr);
    const nextDates = wasWorked
      ? workedDates.filter((d) => d !== dateStr)
      : [...workedDates, dateStr];

    // UI optimista
    setWorkedDates(nextDates);

    // Si desmarcás un finde, limpiamos su hora en DB (y local state)
    const weekday = dayjs(dateStr).day();
    const isWeekend = weekday === 0 || weekday === 6;

    try {
      const { data } = await axios.put(`/api/calendar/${userDni}`, {
        fechas: nextDates,
      });

      if (!data?.success) {
        setWorkedDates(workedDates); // revertir
        return;
      }

      if (wasWorked && isWeekend && weekendHours[dateStr]) {
        // DELETE en DB
        try {
          await axios.delete("/api/calendar/weekend", {
            data: { userDni, date: dateStr },
          });
        } catch (e) {
          console.error("Error borrando ingreso de finde:", e);
        }
        // Limpiar en estado
        setWeekendHours((prev) => {
          const { [dateStr]: _, ...rest } = prev;
          return rest;
        });
      }
    } catch (err) {
      console.error("Error guardando calendario:", err);
      setWorkedDates(workedDates); // revertir
    }
  };

  // Guardar/actualizar hora de ingreso del finde
  const updateWeekendHour = async (dateStr, value) => {
    // UI optimista
    setWeekendHours((prev) => ({ ...prev, [dateStr]: value }));

    try {
      await axios.put("/api/calendar/weekend", {
        userDni,
        date: dateStr,
        ingreso: value, // 'HH:MM'
      });
    } catch (e) {
      console.error("No se pudo guardar el ingreso:", e);
      // si quisieras, podrías revertir aquí con el valor anterior
    }
  };

  /** ---------- CONSTRUCCIÓN DEL CALENDARIO ---------- */
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [startDay, daysInMonth]);

  // Total mensual (calculado una sola vez por render)
  const totalHours = useMemo(() => {
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = currentDate.clone().date(d).format("YYYY-MM-DD");
      total += getDayHours(dateStr);
    }
    return total;
  }, [currentDate, daysInMonth, workedDates, weekendHours, holidays]);

  const handlePrevMonth = () =>
    setCurrentDate((prev) => prev.subtract(1, "month"));
  const handleNextMonth = () =>
    setCurrentDate((prev) => prev.add(1, "month"));

  return (
    <div className="mt-7 p-6 w-screen">
      <div className="flex justify-between items-center mb-4 w-1/3 border border-bluenavydk bg-bluenavydk rounded-md">
        <ArrowButton onClick={handlePrevMonth} Icon={ChevronLeftIcon} direction="left" />
        <h2 className="text-2xl font-bold text-linencream w-full text-center">
          {currentDate.format("MMMM YYYY")}
        </h2>
        <ArrowButton onClick={handleNextMonth} Icon={ChevronRightIcon} direction="right" />
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-linencream">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"].map((day) => (
          <div key={day} className="font-bold bg-midnightblue rounded-md">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) return <div key={index} className="h-24" />;

          const date = currentDate.clone().date(day);
          const dateStr = date.format("YYYY-MM-DD");
          const isHoliday = holidays.some((h) => h.fecha === dateStr);
          const isWorked = workedDates.includes(dateStr);
          const weekday = date.day();
          const isWeekend = weekday === 0 || weekday === 6;

          // Evitamos llamar getDayHours dos veces
          const computedHours = getDayHours(dateStr);

          return (
            <div
              key={index}
              className="relative rounded-md h-28 flex flex-col items-start text-left text-xs select-none bg-bluenavydk"
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
                  ${isHoliday ? "bg-imperialred text-white" : "bg-crayolablue text-white"}`}
              >
                {day}
              </div>

              {/* Contenido del día */}
              <div className="mt-1">
                {isWorked && isWeekend && (
                  <div className="ml-2">
                    <h4 className="mb-1 ml-2">Ingreso</h4>
                    <select
                      value={weekendHours[dateStr] || "8:00"}
                      onChange={(e) => updateWeekendHour(dateStr, e.target.value)}
                      className="text-xs rounded px-1 py-0.5 bg-darkbg text-white"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {computedHours > 0 && (
                  <div className="mt-1 ml-3">⏱️{computedHours} hs</div>
                )}
              </div>

              {/* Toggle trabajado */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWorkedDate(dateStr);
                }}
                className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-sm cursor-pointer
                  ${isWorked ? "bg-aeroblue" : "bg-darkbg hover:bg-aeroblue"}`}
                title={isWorked ? "Desmarcar día trabajado" : "Marcar día trabajado"}
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
