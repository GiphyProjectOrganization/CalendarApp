import { DailyForecast } from "../components/weather/WeateherCard";
import { WEATHER_API_URL, WEATHER_API_KEY } from "../constants";

export const fetchWeatherForDate = async (
  lat: number,
  lon: number,
  date: Date,
  unit: 'metric' | 'imperial' = 'metric'
): Promise<DailyForecast | null> => {
  try {
    const response = await fetch(
      `${WEATHER_API_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${unit}&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Weather API request failed');
    
    const data = await response.json();
    
    const eventTimestamp = Math.floor(date.getTime() / 1000);
    const forecastForEventDate = data.daily.find((day: DailyForecast) => {
      const forecastDate = new Date(day.dt * 1000);
      return (
        forecastDate.getDate() === date.getDate() &&
        forecastDate.getMonth() === date.getMonth() &&
        forecastDate.getFullYear() === date.getFullYear()
      );
    });
    
    return forecastForEventDate || null;
  } catch (err) {
    console.error('Weather fetch error:', err);
    return null;
  }
};