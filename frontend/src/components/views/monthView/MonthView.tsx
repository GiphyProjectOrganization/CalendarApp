import React, { useState, useEffect, useMemo } from 'react';
import { MonthGrid } from '../../../services/calendarService';
import './MonthView.css';
import 'date-holidays';
import 'date-holidays-parser';
import Holidays from 'date-holidays';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthView: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isHexTheme, setIsHexTheme] = useState(false);
  const [countryCode, setCountryCode] = useState()

  const dates = MonthGrid(currentYear, currentMonth, 1);

  //This is for honeycomb grid in honey theme
  useEffect(() => {
    const updateHexTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setIsHexTheme(currentTheme === 'honey' || currentTheme === 'darkhoney');
    };

    updateHexTheme();

    const observer = new MutationObserver(updateHexTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isWeekend = (date: Date) => {
    const day = date.getDay() 
    return day === 0 || day === 6
  }

  //this section is to get holidays this month
  useEffect(() => {
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      setCountryCode(data.country_code);
    })
    .catch(err => console.error('Geolocation failed:', err));
  }, []);
 
  const hd = useMemo(() => {
    if (!countryCode) return null;
    return new Holidays(countryCode);
  }, [countryCode]);
    
  const isHoliday = (date: Date) => {
    const holiday = hd?.isHoliday(date);
    if (!holiday) return [];

    const entries = Array.isArray(holiday) ? holiday : [holiday];
    return entries
    .filter(e => e.type === 'public')
    .map(e => e.name);
  };

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

  const chunkDates = (arr: Date[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  return (
    <div className="max-w-5xl bg-white-100 mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="px-2 py-1 bg-secondary rounded">←</button>
        <h2 className="text-xl font-bold">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </h2>
        <button onClick={nextMonth} className="px-2 py-1 bg-secondary rounded">→</button>
      </div>

      <div className="grid grid-cols-7 text-center text-base-content font-medium border-b">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {isHexTheme ? (
        <div className="honeycomb">
          {chunkDates(dates, 7).map((week, rowIdx) => (
            <div key={rowIdx} className={`honey-row ${rowIdx % 2 === 1 ? 'offset' : ''}`}>
              {week.map((date, idx) => (
                <div key={idx} className={`hex-outer ${!isCurrentMonth(date) ? 'opacity-50' : ''} ${isToday(date) ? 'today' : ''}`}>
                  <div className="hex-inner">
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 text-base-content relative z-10">
          {dates.map((date, idx) => {
            const holidayNames = isHoliday(date);

            const baseClasses =
              'relative border rounded-sm p-2 h-24 text-sm text-base-content transform transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:z-10';

            const currentMonthClass = isCurrentMonth(date) ? 'bg-primary' : 'text-neutral bg-accent';
            const weekendClass = isWeekend(date) && isCurrentMonth(date) ? 'bg-secondary' : '';
            const holidayClass = holidayNames.length && isCurrentMonth(date) ? 'bg-secondary' : '';
            const todayClass = isToday(date) ? 'bg-neutral font-bold border-base-content' : '';

            return (
              <div
                key={idx}
                title={holidayNames.length ? holidayNames.join(', ') : undefined}
                className={[
                  baseClasses,
                  currentMonthClass,
                  weekendClass,
                  holidayClass,
                  todayClass
                ].join(' ')}
              >
                {date.getDate()}
                {holidayNames.length > 0 && (
                  <div className="text-xs mt-1 text-accent-content">
                    {holidayNames.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};