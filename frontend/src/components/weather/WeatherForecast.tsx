import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WEATHER_API_KEY, WEATHER_API_URL } from "../../constants";
import { UserLocation } from "../../hook/userLocation-hook";
interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Temp {
  day: number;
  min: number;
  max: number;
}

interface DailyForecast {
  dt: number;
  temp: Temp;
  weather: Weather[];
}

export function WeatherForecast() {
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [currentWeather, setCurrentWeather] = useState<any | null>(null);

  const { location, isLoading, error } = UserLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('UserLocation:', location);
    if (!location.lat || !location.lon || !location.countryCode) return;

    const fahrenheitCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
    const userUnit = fahrenheitCountries.includes(location.countryCode) ? 'imperial' : 'metric';
    setUnit(userUnit);

    fetch(`${WEATHER_API_URL}/onecall?lat=${location.lat}&lon=${location.lon}&exclude=minutely,hourly,alerts&units=${userUnit}&appid=${WEATHER_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        console.log('Weather API response:', data);
        setForecast(data.daily ? data.daily.slice(0, 7) : []);
        setCurrentWeather(data.current || null);
      })
      .catch(err => console.error('Weather API error:', err));
  }, [location.lat, location.lon, location.countryCode]);

  const handleDayClick = (dayTimestamp: number) => {
    const date = new Date(dayTimestamp * 1000);
    const dateString = date.toISOString().split('T')[0];
    navigate(`/calendar/day?date=${dateString}`);
  };

  const current = forecast[0];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[10rem]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

if (error) {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 top-3 z-10">
      <div className="alert alert-error px-4 py-2 text-sm shadow-md w-fit mx-auto rounded-md">
        <svg
          className="w-4 h-4 stroke-current shrink-0 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 9v2m0 4h.01M5.93 19h12.14a1.5 1.5 0 001.34-2.15L13.34 4.5a1.5 1.5 0 00-2.68 0L4.59 16.85A1.5 1.5 0 005.93 19z" />
        </svg>
        <span className="font-medium">{error}</span>
      </div>
    </div>
  );
}


  return (
    <div className="dropdown dropdown-hover">
      <div
        tabIndex={0}
        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-base-200 rounded-box bg-base-100 shadow transition"
      >
        {current && (
          <>
            <img
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}.png`}
              alt={current.weather[0].description}
              className="w-6 h-6"
            />
            <span className="font-semibold">
              {Math.round(current.temp.day)}°{unit === 'metric' ? 'C' : 'F'}
            </span>
            {location.city && (
              <span className="text-sm text-base-content/60">({location.city})</span>
            )}
          </>
        )}
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content z-10 menu p-2 shadow-lg bg-base-100 rounded-box w-64"
      >
        {forecast.map((day, idx) => {
          const date = new Date(day.dt * 1000);
          const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });

          return (
            <li
              key={idx}
              className="flex justify-between items-center px-3 py-2 rounded hover:bg-base-200 transition-colors cursor-pointer"
              onClick={() => handleDayClick(day.dt)}
            >
              <span className="font-medium">{weekday}</span>
              <div className="flex items-center gap-2">
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                  alt={day.weather[0].description}
                  className="w-5 h-5"
                />
                <span>{Math.round(day.temp.day)}°</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
