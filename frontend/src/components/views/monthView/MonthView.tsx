import React, { useState, useEffect, useMemo } from 'react';
import { MonthGrid } from '../../../services/calendarService';
import './MonthView.css';
import 'date-holidays';
import 'date-holidays-parser';
import { useNavigate } from 'react-router-dom';
import Holidays from 'date-holidays';
import { UserLocation } from '../../../hook/userLocation-hook';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthView = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isHexTheme, setIsHexTheme] = useState(false);
  const [countryCode, setCountryCode] = useState<string | undefined>();
  const { location, isLoading, error } = UserLocation();
  const navigate = useNavigate(); 

  const handleDateClick = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;
    const holidayNames = hd ? isHoliday(date) : [];
    const holidayParam = holidayNames.length > 0 ? `&holiday=${encodeURIComponent(holidayNames[0])}` : '';
    navigate(`/calendar/day?date=${dateString}${holidayParam}`);
  };

  const dates = MonthGrid(currentYear, currentMonth, 1);

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
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  useEffect(() => {
    if (location.countryCode) {
      setCountryCode(location.countryCode);
    }
  }, [location.countryCode]);

  const hd = useMemo(() => {
    if (!countryCode) return null;
    return new Holidays(countryCode);
  }, [countryCode]);

  const isHoliday = (date: Date): string[] => {
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
        <button onClick={prevMonth} className="px-2 py-1 bg-secondary text-secondary-content rounded">←</button>
        <h2 className="text-xl font-bold text-base-content">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </h2>
        <button onClick={nextMonth} className="px-2 py-1 bg-secondary text-secondary-content rounded">→</button>
      </div>

      <div className="grid grid-cols-7 text-center text-base-content font-medium border-b">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {error && (
        <div className="text-error text-center my-2 text-sm">
          Could not load holidays for your country. Calendar is still available.
        </div>
      )}

      {isHexTheme ? (
        <div className="honeycomb">
          {chunkDates(dates, 7).map((week, rowIdx) => (
            <div key={rowIdx} className={`honey-row ${rowIdx % 2 === 1 ? 'offset' : ''}`}>
              {week.map((date, idx) => {
                const isWeekendDate = isWeekend(date);
                const holidayNames = hd ? isHoliday(date) : [];
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleDateClick(date)}
                    className={`hex-outer ${!isCurrentMonth(date) ? 'opacity-50' : ''} ${
                      isToday(date) ? 'today' : ''
                    } ${
                      isWeekendDate && isCurrentMonth(date) ? 'weekend' : ''
                    }`}
                  >
                    <div className="hex-inner">
                      <div>{date.getDate()}</div>
                      {holidayNames.length > 0 && (
                        <div className="holiday-badge">
                          {holidayNames[0]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 text-base-content relative z-10 grid-view">
          {dates.map((date, idx) => {
            const holidayNames = hd ? isHoliday(date) : [];

            const cellClasses = [
              'relative border rounded-sm p-2 h-24 text-sm transition-transform hover:scale-105 hover:shadow-lg hover:z-10 cursor-pointer',
              isToday(date) ? 'today border-neutral font-bold' : '',
              isCurrentMonth(date) ? 'bg-primary text-primary-content' : 'bg-accent text-accent-content opacity-50',
              isWeekend(date) && isCurrentMonth(date) ? 'bg-secondary text-secondary-content' : '',
              holidayNames.length > 0 && isCurrentMonth(date) ? 'bg-error text-error-content border-error font-semibold' : '',
            ].filter(Boolean).join(' ');

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(date)}
                title={holidayNames.length > 1 ? holidayNames.join(', ') : undefined}
                className={cellClasses}
              >
                <div>{date.getDate()}</div>
                {holidayNames.length > 0 && (
                  <div className="mt-1 text-xs bg-error-content text-error px-2 py-0.5 rounded-full inline-block">
                    {holidayNames[0]}
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
