'use client'

import React,{useState, useEffect} from 'react';
import dayjs from 'dayjs';


const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const startOfMounth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startDay = startOfMounth.day(); //domingo
    const daysInMonth = currentDate.daysInMonth();

    const days = []

    for (let i=0; i<startDay ; i++) {
        days.push(null); // dias vacios al principio
    }

    for (let d = 1; d <= daysInMonth; d++) {
        days.push(d);
    }

  return (
    <div className='p-4'>
        <h2 className='text-2xl font-bold mb-4'>
            {currentDate.format('MMMM YYYY')}
        </h2>
        <div className='grid grid-cols-7 gap-2 text-center'>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map(day=> (
                <div key={day} className='font-bold'>
                    {day}
                </div>
            ))}

            {days.map((day, index) => (
                <div 
                key={index}
                className='border border-gray-300 rounded-md h-24 flex flex-col items-start bg-white'
                >
                    {day && (
                        <div className='text-sm font-bold bg-teal-200 w-full rounded-t-md'>
                            {day}
                        </div>
                    )}

                </div>
            ))}

        </div>
    </div>
  )
}

export default Calendar