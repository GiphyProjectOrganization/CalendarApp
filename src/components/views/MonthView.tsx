import React, { useState } from 'react';
import { MonthGrid } from '../../services/calendarService';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthView: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const dates = MonthGrid(currentYear, currentMonth);

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isCurrentMonth = (date: Date) =>
    date.getMonth() === currentMonth && date.getFullYear() === currentYear;

  const prevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const nextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  return (
    <div className="max-w-4xl bg-white-100 mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="px-2 py-1 bg-gray-200 rounded">←</button>
        <h2 className="text-xl font-bold">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </h2>
        <button onClick={nextMonth} className="px-2 py-1 bg-gray-200 rounded">→</button>
      </div>

      <div className="grid grid-cols-7 text-center font-medium border-b">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dates.map((date, idx) => (
          <div
            key={idx}
            className={[
              "border p-2 h-24 text-sm",
              !isCurrentMonth(date) && "text-gray-400",
              isToday(date) && "bg-blue-100 font-bold border-blue-300"
            ].join(" ")}
          >
            {date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
};