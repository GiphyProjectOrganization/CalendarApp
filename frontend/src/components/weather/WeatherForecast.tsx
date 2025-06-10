import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { WEATHER_API_KEY, WEATHER_API_URL} from "../../constants";
import { UserLocation } from '../../hook/userLocation-hook';

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
    if (!location.lat || !location.lon || !location.countryCode) return;
    const fahrenheitCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
    const userUnit = fahrenheitCountries.includes(location.countryCode || '') ? 'imperial' : 'metric';
    setUnit(userUnit);
    fetch(`${WEATHER_API_URL}/onecall?lat=${location.lat}&lon=${location.lon}&exclude=minutely,hourly,alerts&units=${userUnit}&appid=${WEATHER_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setForecast(data.daily.slice(0, 7));
        setCurrentWeather(data.current);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-error-content text-center mt-8">{error}</div>;
  }

  return (
    <div className="dropdown dropdown-hover">
      <div tabIndex={0} className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-base-200 rounded">
        {current && (
          <>
            <img
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}.png`}
              alt={current.weather[0].description}
              className="w-6 h-6"
            />
            <span>{Math.round(current.temp.day)}°{unit === 'metric' ? 'C' : 'F'}</span>
            {location.city && <span className="text-sm text-gray-500 ml-2">({location.city})</span>}
          </>
        )}
      </div>

      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64">
        {forecast.map((day, idx) => {
          const date = new Date(day.dt * 1000);
          const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });

          return (
            <li 
              key={idx} 
              className="flex justify-between items-center text-sm px-2 py-1 cursor-pointer hover:bg-base-200 rounded transition-colors"
              onClick={() => handleDayClick(day.dt)}
            >
              <span>{weekday}</span>
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
    )
}