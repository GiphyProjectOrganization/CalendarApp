import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { WeatherCard } from '../weather/WeateherCard';

type ForecastDay = {
  dt: number;
  temp: { day: number; min: number; max: number };
  weather: any[]; 
};

interface DayViewProps {
  forecast?: ForecastDay[];
  unit: "metric" | "imperial";
}

export const DayView = ({ forecast = [], unit }: DayViewProps) => {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date");

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
      </div>
    </div>
  );
};
