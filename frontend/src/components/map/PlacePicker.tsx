import React, { useRef, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { MAP_API_KEY } from '../../constants';

declare global {
  interface Window {
    gmapsLoaded?: boolean;
  }
}

function PlacePicker({ onPlaceSelected, lat = 0, lon = 0 }: { onPlaceSelected: (placeId: string, address: string) => void, lat?: number, lon?: number }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAP_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    if (!autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['place_id', 'formatted_address'],
        bounds: (lat !== 0 || lon !== 0)
          ? new window.google.maps.LatLngBounds(
              new window.google.maps.LatLng(lat - 0.1, lon - 0.1),
              new window.google.maps.LatLng(lat + 0.1, lon + 0.1)
            )
          : undefined,
        strictBounds: (lat !== 0 || lon !== 0)
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace();
        if (place.place_id) {
          onPlaceSelected(place.place_id, place.formatted_address || '');
        }
      });
    }
  }, [isLoaded, lat, lon, onPlaceSelected]);

  return (
    <input
      ref={inputRef}
      placeholder="Enter a place or address"
      className="input bg-white input-bordered w-full"
      autoComplete="off"
      disabled={!isLoaded}
    />
  );
}

export default PlacePicker;
