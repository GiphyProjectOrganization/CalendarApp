import React, { useEffect, useState, useMemo, useCallback } from "react";
import { generateHours } from "../../services/calendarService";
import { eventService } from "../../services/eventService";
import { useAuth } from '../../hook/auth-hook';
import { Event } from "../../services/eventService";
import { EventCard } from "../events/EventCard";
import Holidays from 'date-holidays';
import { UserLocation } from '../../hook/userLocation-hook';

interface WeekViewProps {
  startDate?: Date;
}

export function WeekView({ startDate = new Date() }: WeekViewProps) {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null); // [hourIdx, dayIdx]
  const { location } = UserLocation();
  const [countryCode, setCountryCode] = useState<string | undefined>();

  // Holiday initialization
  const hd = useMemo(() => {
    if (!countryCode) return null;
    return new Holidays(countryCode);
  }, [countryCode]);

  useEffect(() => {
    if (location.countryCode) {
      setCountryCode(location.countryCode);
    }
  }, [location.countryCode]);

  // Memoize week start calculation
  const getWeekStart = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(startDate));

  // Precompute all holidays for the current week
  const weekHolidays = useMemo(() => {
    const holidays = new Map<number, string[]>(); // dayIdx -> holidayNames
    if (!hd) return holidays;

    Array.from({ length: 7 }).forEach((_, dayIdx) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + dayIdx);
      const holiday = hd.isHoliday(date);
      
      if (!holiday) return;
      
      const entries = Array.isArray(holiday) ? holiday : [holiday];
      const publicHolidays = entries
        .filter(e => e.type === 'public')
        .map(e => e.name);
      
      if (publicHolidays.length > 0) {
        holidays.set(dayIdx, publicHolidays);
      }
    });

    return holidays;
  }, [hd, currentWeekStart]);

  // Memoize hours and days
  const hours = useMemo(() => generateHours(), []);
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  // Event fetching
  useEffect(() => {
    if (!token) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const allEvents = await eventService.getParticipatingEvents(token);
        setEvents(allEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  // Memoize event calculations
  const { getEventsForTimeSlot, isEventStartingAtHour } = useMemo(() => {
    const getEventsForTimeSlot = (day: Date, hour: number): Event[] => {
      return events.filter(event => {
        const eventStart = new Date(`${event.startDate}T${event.startTime}`);
        const eventEnd = new Date(`${event.endDate}T${event.endTime}`);
        const isSameDay = eventStart.getDate() === day.getDate() && 
                         eventStart.getMonth() === day.getMonth() && 
                         eventStart.getFullYear() === day.getFullYear();
        const startsBeforeHourEnd = eventStart.getHours() <= hour;
        const endsAfterHourStart = eventEnd.getHours() >= hour;
        return isSameDay && startsBeforeHourEnd && endsAfterHourStart;
      });
    };

    const isEventStartingAtHour = (event: Event, hour: number) => {
      const eventStart = new Date(`${event.startDate}T${event.startTime}`);
      return eventStart.getHours() === hour;
    };

    return { getEventsForTimeSlot, isEventStartingAtHour };
  }, [events]);

  // Navigation handlers
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, [getWeekStart]);

  // Cell background calculation
  const getCellClasses = useCallback((hourIdx: number, dayIdx: number) => {
    const isHovered = hoveredCell && hoveredCell[0] === hourIdx && hoveredCell[1] === dayIdx;
    const isHourHovered = hoveredCell && hoveredCell[0] === hourIdx;
    const isDayHovered = hoveredCell && hoveredCell[1] === dayIdx;
    const isHoliday = weekHolidays.has(dayIdx);

    let classes = [
      'min-h-[60px]',
      'border-t',
      'border-l',
      'border-base-300',
      'transition-colors',
      'relative'
    ];

    if (isHoliday) classes.push('bg-error/10');
    if (isHovered) classes.push('bg-primary/20');
    else if (isHourHovered) classes.push('bg-base-200');
    else if (isDayHovered) classes.push('bg-base-200');
    else classes.push('bg-white');

    return classes.join(' ');
  }, [hoveredCell, weekHolidays]);

  // Handle cell hover
  const handleCellHover = useCallback((hourIdx: number, dayIdx: number) => {
    setHoveredCell([hourIdx, dayIdx]);
  }, []);

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white-100">
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousWeek} className="btn btn-sm btn-ghost">
          &larr; Previous Week
        </button>
        <h2 className="text-xl font-semibold">
          {currentWeekStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h2>
        <div>
          <button onClick={goToToday} className="btn btn-sm btn-ghost mr-2">
            Today
          </button>
          <button onClick={goToNextWeek} className="btn btn-sm btn-ghost">
            Next Week &rarr;
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] border border-base-300 rounded-lg overflow-hidden">
        {/* Header row */}
        <div className="bg-base-200"></div>
        {days.map((date, dayIdx) => {
          const holidayNames = weekHolidays.get(dayIdx) || [];
          const isToday = date.getDate() === new Date().getDate() && 
                          date.getMonth() === new Date().getMonth() && 
                          date.getFullYear() === new Date().getFullYear();
          
          return (
            <div 
              key={dayIdx} 
              className="text-center py-2 font-semibold bg-base-200 border-l border-base-300"
              onMouseEnter={() => handleCellHover(-1, dayIdx)}
              onMouseLeave={handleCellLeave}
            >
              <div className="text-sm font-medium">
                {date.toLocaleDateString(undefined, { weekday: 'short' })}
              </div>
              <div className={`text-lg ${isToday ? 'text-primary font-bold' : ''}`}>
                {date.getDate()}
              </div>
              {holidayNames.length > 0 && (
                <div className="text-xs mt-1 px-1 truncate text-error">
                  {holidayNames[0]}
                </div>
              )}
            </div>
          );
        })}

        {/* Time slots */}
        {hours.map((hour, hourIdx) => (
          <React.Fragment key={hourIdx}>
            <div 
              className="text-sm text-right pr-2 py-2 border-t border-base-300 bg-base-200"
              onMouseEnter={() => handleCellHover(hourIdx, -1)}
              onMouseLeave={handleCellLeave}
            >
              {hour}
            </div>

            {days.map((day, dayIdx) => {
              const timeSlotEvents = getEventsForTimeSlot(day, hourIdx);
              const isHoliday = weekHolidays.has(dayIdx);
              
              return (
                <div
                  key={dayIdx}
                  className={getCellClasses(hourIdx, dayIdx)}
                  onMouseEnter={() => handleCellHover(hourIdx, dayIdx)}
                  onMouseLeave={handleCellLeave}
                >
                  {isHoliday && hourIdx === 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-error/50"></div>
                  )}
                  {timeSlotEvents.map((event) => (
                    isEventStartingAtHour(event, hourIdx) ? (
                      <EventCard 
                        key={event.id}
                        event={event}
                        compact={true}
                      />
                    ) : (
                      <div 
                        key={`${event.id}-cont`}
                        className="absolute inset-0.5 bg-primary/20"
                      />
                    )
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}