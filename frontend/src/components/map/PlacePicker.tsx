import React, { useRef, useEffect } from 'react';

function PlacePicker({ onPlaceSelected, lat = 0, lon = 0 }: { onPlaceSelected: (placeId: string, address: string) => void, lat?: number, lon?: number }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        inputRef.current.blur(); 
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['place_id', 'formatted_address'],
      bounds: (lat !== 0 || lon !== 0)
        ? new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(lat - 0.1, lon - 0.1),
            new window.google.maps.LatLng(lat + 0.1, lon + 0.1)
          )
        : undefined,
      strictBounds: (lat !== 0 || lon !== 0)
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.place_id) {
        onPlaceSelected(place.place_id, place.formatted_address || '');
      } else {
        console.warn('No place_id found');
      }
    });

    autocompleteRef.current = autocomplete;
  }, [lat, lon]);

  return <input ref={inputRef} placeholder="Enter a place or address" className="input bg-white input-bordered w-full" autoComplete="off" />;
}

export default PlacePicker;
