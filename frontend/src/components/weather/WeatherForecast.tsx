import { useEffect, useState } from "react"
import { WEATHER_API_KEY, WEATHER_API_URL} from "../../constants";

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
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null)
  const [currentWeather, setCurrentWeather] = useState<any | null>(null);

    useEffect(() => {
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
            setLat(data.latitude);
            setLon(data.longitude);
            setCountryCode(data.country_code);
            setCity(data.city)

            const fahrenheitCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
            setUnit(fahrenheitCountries.includes(data.country_code) ? 'imperial' : 'metric');
            })
            .catch(err => console.error('Geolocation failed:', err));
    }, []);

    useEffect(() => {
        if (lat && lon) {
        fetch(`${WEATHER_API_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${unit}&appid=${WEATHER_API_KEY}`)
            .then(res => res.json())
            .then(data => {
            setForecast(data.daily.slice(0, 7));
            setCurrentWeather(data.current);
            })
            .catch(err => console.error('Weather API error:', err));
        }
    }, [lat, lon, unit]);

    const current = forecast[0];
    
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
            {city && <span className="text-sm text-gray-500 ml-2">({city})</span>}
          </>
        )}
      </div>

      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64">
        {forecast.map((day, idx) => {
          const date = new Date(day.dt * 1000);
          const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });

          return (
            <li key={idx} className="flex justify-between items-center text-sm px-2 py-1">
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