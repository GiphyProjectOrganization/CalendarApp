import React, { useRef, useEffect } from 'react';

function PlacePicker({ onPlaceSelected }: { onPlaceSelected: (placeId: string, address: string) => void }) {
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

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['place_id', 'formatted_address'],
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
  }, []);

  return <input ref={inputRef} placeholder="Enter a place" className="input bg-white input-bordered w-full" />;
}

export default PlacePicker;
