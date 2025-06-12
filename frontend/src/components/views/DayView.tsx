import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WeatherCard } from '../weather/WeateherCard';
import { WEATHER_API_KEY, WEATHER_API_URL } from "../../constants";
import { UserLocation } from '../../hook/userLocation-hook';

type ForecastDay = {
  dt: number;
  temp: { day: number; min: number; max: number };
  weather: any[]; 
};

export const DayView = () => {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date");
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [loading, setLoading] = useState(true);

  const { location, isLoading, error } = UserLocation();

  useEffect(() => {
    if (!location.lat || !location.lon || !location.countryCode) return;
    const fahrenheitCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
    const userUnit = fahrenheitCountries.includes(location.countryCode || '') ? 'imperial' : 'metric';
    setUnit(userUnit);

    const fetchWeatherData = async () => {
      try {
        const weatherRes = await fetch(
          `${WEATHER_API_URL}/onecall?lat=${location.lat}&lon=${location.lon}&exclude=minutely,hourly,alerts&units=${userUnit}&appid=${WEATHER_API_KEY}`
        );
        const weatherData = await weatherRes.json();
        setForecast(weatherData.daily.slice(0, 7));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, [location.lat, location.lon, location.countryCode]);

  const parseUTCDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const getTodayUTC = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  };

  const targetDate = selectedDate ? parseUTCDate(selectedDate) : getTodayUTC();

  console.log('selectedDate:', selectedDate);
  console.log('targetDate (UTC):', targetDate.toISOString());

  const dayForecast = forecast.find((day) => {
    const forecastDate = new Date(day.dt * 1000);
    console.log('Comparing forecastDate (UTC):', forecastDate.toISOString());
    return (
      forecastDate.getUTCFullYear() === targetDate.getUTCFullYear() &&
      forecastDate.getUTCMonth() === targetDate.getUTCMonth() &&
      forecastDate.getUTCDate() === targetDate.getUTCDate()
    );
  });

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  return (
    <div className="grid md:grid-cols-4 gap-4 p-4">
      <div className="md:col-span-3">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-4">
            <h2 className="card-title text-xl mb-4">
              {targetDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>

            <div className="divider my-2" />

            <div className="overflow-y-auto max-h-[75vh]">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="flex items-start py-2 px-1 hover:bg-base-200 transition-colors"
                >
                  <div className="w-16 text-sm text-right pr-3 text-base-content/50 font-mono">
                    {hour}
                  </div>
                  <div className="flex-1 border-l pl-4 text-base-content text-sm min-h-[2rem]">
                    <span className="italic text-base-content/40">No events</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-1">
        {dayForecast && <WeatherCard day={dayForecast} unit={unit} />}
        {!dayForecast && error && (
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