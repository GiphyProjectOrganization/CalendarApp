import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WeatherCard } from '../weather/WeateherCard';
import { WEATHER_API_KEY, WEATHER_API_URL } from "../../constants";
import { UserLocation } from '../../hook/userLocation-hook';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../hook/auth-hook';
import { EventCard } from '../events/EventCard';
import { Event } from '../../services/eventService';

type ForecastDay = {
  dt: number;
  temp: { day: number; min: number; max: number };
  weather: any[]; 
};

export type EventCardData = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
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
};

export const DayView = () => {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date");
  const holidayName = searchParams.get("holiday");
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const { location, isLoading: locationLoading, error: locationError } = UserLocation();
  const { userId, token } = useAuth();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);


  useEffect(() => {
    if (!location.lat || !location.lon || !location.countryCode) return;
    const fahrenheitCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
    const userUnit = fahrenheitCountries.includes(location.countryCode) ? 'imperial' : 'metric';
    setUnit(userUnit);

    const fetchWeatherData = async () => {
      try {
        const res = await fetch(
          `${WEATHER_API_URL}/onecall?lat=${location.lat}&lon=${location.lon}&exclude=minutely,hourly,alerts&units=${userUnit}&appid=${WEATHER_API_KEY}`
        );
        const data = await res.json();
        setForecast(data.daily.slice(0, 7));
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, [location]);

  useEffect(() => {
    if (!token) return;
    
    const fetchEvents = async () => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const events = await eventService.getParticipatingEvents(token);
        setEvents(events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setEventsError('Failed to load events. Please try again.');
      } finally {
        setEventsLoading(false);
      }
    };
    
    fetchEvents();
  }, [token]);

  const parseUTCDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  const getTodayUTC = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  };

  const targetDate = selectedDate ? parseUTCDate(selectedDate) : getTodayUTC();

  const dayForecast = forecast.find((day) => {
    const forecastDate = new Date(day.dt * 1000);
    return (
      forecastDate.getUTCFullYear() === targetDate.getUTCFullYear() &&
      forecastDate.getUTCMonth() === targetDate.getUTCMonth() &&
      forecastDate.getUTCDate() === targetDate.getUTCDate()
    );
  });

  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    time: `${i.toString().padStart(2, '0')}:00`,
    events: [] as EventCardData[]
  }));

    const eventToCardData = (event: Event): EventCardData => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.startDate,
    startTime: event.startTime,
    endDate: event.endDate,
    endTime: event.endTime,
    location: event.location,
    isPublic: event.isPublic
  });

  events.forEach(event => {
    const eventStart = new Date(`${event.startDate}T${event.startTime}`);
    const eventEnd = new Date(`${event.endDate}T${event.endTime}`);

    const eventStartUTC = new Date(
      Date.UTC(
        eventStart.getFullYear(),
        eventStart.getMonth(),
        eventStart.getDate(),
        eventStart.getHours(),
        eventStart.getMinutes()
      )
    );
    
    const eventEndUTC = new Date(
      Date.UTC(
        eventEnd.getFullYear(),
        eventEnd.getMonth(),
        eventEnd.getDate(),
        eventEnd.getHours(),
        eventEnd.getMinutes()
      )
    );

    const timeSlotEvent: EventCardData = {
      ...event,
      location: typeof event.location === 'object' 
        ? event.location.address 
        : event.location
    };

    if (
      eventStartUTC.getUTCFullYear() === targetDate.getUTCFullYear() &&
      eventStartUTC.getUTCMonth() === targetDate.getUTCMonth() &&
      eventStartUTC.getUTCDate() === targetDate.getUTCDate()
    ) {
      const startHour = eventStartUTC.getUTCHours();
      const endHour = Math.min(eventEndUTC.getUTCHours(), 23); //Cap at 23:59

      for (let hour = startHour; hour <= endHour; hour++) {
        timeSlots[hour].events.push(eventToCardData(event));
      }
    }
  });

  const isEventStartingAtHour = (event: EventCardData, hour: number) => {
    const eventStart = new Date(`${event.startDate}T${event.startTime}`);
    const eventStartUTC = new Date(
      Date.UTC(
        eventStart.getFullYear(),
        eventStart.getMonth(),
        eventStart.getDate(),
        eventStart.getHours(),
        eventStart.getMinutes()
      )
    );
    return eventStartUTC.getUTCHours() === hour;
  };

  return (
    <div className="grid md:grid-cols-4 gap-4 p-4">
      <div className="md:col-span-3">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-4">
            <h2 className="card-title text-xl mb-2">
              {targetDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>

            {holidayName && (
              <div
                className="inline-block rounded-full px-2 py-0.5 font-cubao text-xs font-semibold select-none cursor-default max-w-xs truncate"
                style={{
                  background: "linear-gradient(90deg, var(--color-error), var(--color-accent))",
                  color: "var(--color-base-100)",
                }}
                title={decodeURIComponent(holidayName)}
              >
                🎉 {decodeURIComponent(holidayName)}
              </div>
            )}
            <div className="divider my-2" />

            {eventsLoading && (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {eventsError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{eventsError}</span>
              </div>
            )}

            {!eventsLoading && (
              <div className="overflow-y-auto max-h-[75vh]">
                {timeSlots.map((slot, hourIndex) => (
                  <div
                    key={slot.time}
                    className={`flex items-start py-2 px-1 transition-colors ${
                      hoveredHour === hourIndex ? 'bg-base-200' : 'hover:bg-base-100'
                    }`}
                    onMouseEnter={() => setHoveredHour(hourIndex)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    <div className="w-16 text-sm text-right pr-3 text-base-content/50 font-mono">
                      {slot.time}
                    </div>
                    <div className="flex-1 border-l pl-4 text-base-content text-sm min-h-[2rem] space-y-1">
                      {slot.events.length > 0 ? (
                        slot.events.map((event) => (
                          isEventStartingAtHour(event, hourIndex) ? (
                            <EventCard 
                              key={event.id}
                              event={event as EventCardData}
                              compact={false}
                            />
                          ) : (
                            <div 
                              key={`${event.id}-cont`}
                              className="h-2 bg-primary/20 rounded-full"
                            />
                          )
                        ))
                      ) : (
                        <span className="italic text-base-content/40">No events</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-1">
        {dayForecast && <WeatherCard day={dayForecast} unit={unit} locationName={location.city} />}
        {!dayForecast && locationError && (
          <div className="alert alert-error shadow-md w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M5.93 19h12.14c1.12 0 1.87-1.13 1.34-2.15L13.34 4.5a1.5 1.5 0 0 0-2.68 0L4.59 16.85c-.53 1.02.22 2.15 1.34 2.15z"
              />
            </svg>
            <span className="font-bold text-error-content">
              Weather data not currently available for this day.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};