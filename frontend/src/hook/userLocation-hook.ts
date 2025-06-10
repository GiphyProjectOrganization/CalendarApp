import { useState, useEffect } from 'react';

interface UserLocation {
  lat: number | null;
  lon: number | null;
  city: string | null;
  countryCode: string | null;
}

export const UserLocation = () => {
  const [location, setLocation] = useState<UserLocation>({
    lat: null,
    lon: null,
    city: null,
    countryCode: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        setLocation({
          lat: data.latitude,
          lon: data.longitude,
          city: data.city,
          countryCode: data.country_code
        });

      } catch (err) {
        console.error('Geolocation failed:', err);
        setError('Could not determine your location');
        setLocation({
          lat: 0,
          lon: 0,
          city: null,
          countryCode: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, isLoading, error };
};