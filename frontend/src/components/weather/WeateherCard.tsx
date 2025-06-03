import React from "react";

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
  day: DailyForecast;
  unit: "metric" | "imperial";
}

export function WeatherCard({ day, unit }: WeatherCardProps) {
  if (!day) {
    return (
      <div className="p-4 text-center text-error font-semibold">
        Weather data not available for this day.
      </div>
    );
  }

  const date = new Date(day.dt * 1000);
  const weekday = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const formatTime = (timestamp?: number) =>
    timestamp
      ? new Date(timestamp * 1000).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  return (
    <div className="card bg-base-100 shadow-md p-4 w-full">
      <div className="card-body p-0">
        <h3 className="card-title text-base-content mb-2">{weekday}</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">
              {Math.round(day.temp.day)}°{unit === "metric" ? "C" : "F"}
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
          <div><span className="font-semibold">Sunrise:</span> {formatTime(day.sunrise)}</div>
          <div><span className="font-semibold">Sunset:</span> {formatTime(day.sunset)}</div>
        </div>
      </div>
    </div>
  );
};
