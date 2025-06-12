import { useState, useEffect } from 'react';

interface UserLocation {
  lat: number;
  lon: number;
  city: string | null;
  countryCode: string | null;
}

export const UserLocation = () => {
  const [location, setLocation] = useState<UserLocation>({
    lat: 0,
    lon: 0,
    city: null,
    countryCode: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let didRespond = false;
    const fallbackTimeout = setTimeout(() => {
      if (!didRespond) {
        didRespond = true;
        setLocation({ lat: 0, lon: 0, city: null, countryCode: null });
        setIsLoading(false);
        setError('Geolocation timed out. Using fallback.');
      }
    }, 2000); // 2 seconds

    const fetchIpLocation = async () => {
      if (didRespond) return;
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error(`IP API error: ${response.status}`);
        const data = await response.json();
        if (didRespond) return;
        didRespond = true;
        setLocation({
          lat: data.latitude,
          lon: data.longitude,
          city: data.city,
          countryCode: data.country_code,
        });
        setIsLoading(false);
      } catch (err) {
        if (didRespond) return;
        didRespond = true;
        console.warn('IP location fetch failed:', err);
        setError('Unable to determine location via IP.');
        setLocation({
          lat: 0,
          lon: 0,
          city: null,
          countryCode: null,
        });
        setIsLoading(false);
      }
    };

    const fetchReverseGeocode = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        if (!response.ok) throw new Error('Reverse geocoding failed');
        const data = await response.json();
        return {
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.hamlet ||
            null,
          countryCode:
            data.address.country_code?.toUpperCase() || null,
        };
      } catch (err) {
        console.warn('Reverse geocoding error:', err);
        return { city: null, countryCode: null };
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (didRespond) return;
          didRespond = true;
          clearTimeout(fallbackTimeout);
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geo = await fetchReverseGeocode(lat, lon);
          setLocation({
            lat,
            lon,
            city: geo.city,
            countryCode: geo.countryCode,
          });
          setIsLoading(false);
        },
        (err) => {
          if (didRespond) return;
          clearTimeout(fallbackTimeout);
          fetchIpLocation();
        },
        { timeout: 2000 }
      );
    } else {
      fetchIpLocation();
    }
    return () => clearTimeout(fallbackTimeout);
  }, []);

  return { location, isLoading, error };
};
