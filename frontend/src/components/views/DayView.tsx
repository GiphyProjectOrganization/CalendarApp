import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WeatherCard } from '../weather/WeateherCard';
import { WEATHER_API_KEY, WEATHER_API_URL } from "../../constants";

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

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const locationRes = await fetch('https://ipapi.co/json/');
        const locationData = await locationRes.json();
        
        const fahrenheitCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
        const userUnit = fahrenheitCountries.includes(locationData.country_code) ? 'imperial' : 'metric';
        setUnit(userUnit);

        const weatherRes = await fetch(
          `${WEATHER_API_URL}/onecall?lat=${locationData.latitude}&lon=${locationData.longitude}&exclude=minutely,hourly,alerts&units=${userUnit}&appid=${WEATHER_API_KEY}`
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
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

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
      </div>
    </div>
  );
};