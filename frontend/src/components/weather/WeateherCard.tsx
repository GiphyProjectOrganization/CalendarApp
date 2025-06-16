interface Weather {
  description: string;
  icon: string;
}

interface Temp {
  day: number;
  min: number;
  max: number;
}

export interface DailyForecast {
  dt: number;
  temp: Temp;
  weather: Weather[];
  uvi?: number;
  sunrise?: number;
  sunset?: number;
  humidity?: number;
}

interface WeatherCardProps {
  day: DailyForecast | null;
  unit: "metric" | "imperial";
  locationName: string;
}

export function WeatherCard({ day, unit, locationName }: WeatherCardProps) {
  if (!day) {
    return (
      <div className="card bg-base-100 shadow-md p-4 w-full">
        <div className="card-body text-base-content p-0">
          <h3 className="card-title">Weather Forecast</h3>
            <p>Weather data not available for this day or location.</p>
        </div>
      </div>
    );
  }

  const date = new Date(day.dt * 1000);
  const weekday = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card bg-base-100 shadow-md p-4 w-full">
      <div className="card-body p-0">
        <h3 className="card-title text-base-content">Weather for {locationName}</h3>
        <p className="text-sm text-base-content/60 ">{weekday}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">
              {Math.round(day.temp.day)}°{unit === 'metric' ? 'C' : 'F'}
            </p>
            <p className="text-sm text-base-content/60">
              Min: {Math.round(day.temp.min)}°, Max: {Math.round(day.temp.max)}°
            </p>
          </div>
          <img
            src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
            alt={day.weather[0].description}
            className="w-16 h-16"
          />
        </div>

        <div className="divider my-3" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-base-content/80">
          <div><span className="font-semibold">UV Index:</span> {day.uvi ?? "N/A"}</div>
          <div><span className="font-semibold">Humidity:</span> {day.humidity ?? "N/A"}%</div>
          <div><span className="font-semibold">Sunrise:</span> 
            {day.sunrise ? new Date(day.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </div>
          <div><span className="font-semibold">Sunset:</span> 
            {day.sunset ? new Date(day.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};
