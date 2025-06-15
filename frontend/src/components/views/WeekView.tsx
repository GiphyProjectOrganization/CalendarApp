import React, { useEffect, useState, useMemo, useCallback } from "react";
import { generateHours } from "../../services/calendarService";
import { eventService } from "../../services/eventService";
import { useAuth } from '../../hook/auth-hook';

interface WeekViewProps {
  startDate?: Date;
}

interface EventType {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string | {
    placeId: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isPublic: boolean;
}

export function WeekView({ startDate = new Date() }: WeekViewProps) {
  const { token } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const getWeekStart = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(startDate));

  const hours = generateHours();

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

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

  const getEventsForTimeSlot = useCallback((day: Date, hour: number): EventType[] => {
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
  }, [events]);

  const getDisplayAddress = useCallback((location: EventType['location']): string => {
    if (typeof location === 'string') return location;
    return location.address;
  }, []);

  const isEventStartingAtHour = useCallback((event: EventType, hour: number) => {
    const eventStart = new Date(`${event.startDate}T${event.startTime}`);
    return eventStart.getHours() === hour;
  }, []);

  const goToPreviousWeek = useCallback(() => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  }, [currentWeekStart]);

  const goToNextWeek = useCallback(() => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  }, [currentWeekStart]);

  const goToToday = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, [getWeekStart]);

  const getCellBackground = (hourIdx: number, dayIdx: number) => {
    const isHourHovered = hoveredHour === hourIdx;
    const isDayHovered = hoveredDay === dayIdx;
    const isCellHovered = isHourHovered && isDayHovered;

    if (isCellHovered) return 'bg-primary/20';
    if (isHourHovered) return 'bg-base-200';
    if (isDayHovered) return 'bg-base-200';
    return 'bg-white';
  };

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
        {days.map((date, dayIdx) => (
          <div 
            key={dayIdx} 
            className="text-center py-2 font-semibold bg-base-200 border-l border-base-300"
            onMouseEnter={() => setHoveredDay(dayIdx)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            <div className="text-sm font-medium">
              {date.toLocaleDateString(undefined, { weekday: 'short' })}
            </div>
            <div className={`text-lg ${
              date.getDate() === new Date().getDate() && 
              date.getMonth() === new Date().getMonth() && 
              date.getFullYear() === new Date().getFullYear()
                ? 'text-primary font-bold' : ''
            }`}>
              {date.getDate()}
            </div>
          </div>
        ))}

        {/* Time slots */}
        {hours.map((hour, hourIdx) => (
          <React.Fragment key={hourIdx}>
            <div 
              className="text-sm text-right pr-2 py-2 border-t border-base-300 bg-base-200"
              onMouseEnter={() => setHoveredHour(hourIdx)}
              onMouseLeave={() => setHoveredHour(null)}
            >
              {hour}
            </div>

            {days.map((day, dayIdx) => {
              const timeSlotEvents = getEventsForTimeSlot(day, hourIdx);
              
              return (
                <div
                  key={dayIdx}
                  className={`min-h-[60px] border-t border-l border-base-300 transition-colors relative ${getCellBackground(hourIdx, dayIdx)}`}
                  onMouseEnter={() => {
                    setHoveredHour(hourIdx);
                    setHoveredDay(dayIdx);
                  }}
                  onMouseLeave={() => {
                    setHoveredHour(null);
                    setHoveredDay(null);
                  }}
                >
                  {timeSlotEvents.map((event, eventIdx) => (
                    isEventStartingAtHour(event, hourIdx) ? (
                      <div
                        key={eventIdx}
                        className="absolute inset-0.5 p-1 bg-primary text-primary-content rounded text-xs overflow-hidden"
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="truncate">
                          {new Date(`${event.startDate}T${event.startTime}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(`${event.endDate}T${event.endTime}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {event.location && (
                          <div className="truncate">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {getDisplayAddress(event.location)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        key={eventIdx}
                        className="absolute inset-0.5 bg-primary/20"
                      ></div>
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