import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCardData } from '../views/DayView';

interface EventCardProps {
  event: EventCardData;
  compact?: boolean;
}

export const EventCard = ({ event, compact = false }: EventCardProps) => {
  const navigate = useNavigate();

  const getDisplayAddress = (location: EventCardData['location']): string => {
    if (typeof location === 'string') return location;
    return location.address;
  };

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-1 bg-primary text-primary-content rounded cursor-pointer hover:bg-primary-focus transition-colors ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      <div className="font-semibold truncate">{event.title}</div>
      <div className="truncate">
        {new Date(`${event.startDate}T${event.startTime}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })} - {new Date(`${event.endDate}T${event.endTime}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      {event.location && (
        <div className="truncate">
          <i className="fas fa-map-marker-alt mr-1"></i>
          {getDisplayAddress(event.location)}
        </div>
      )}
    </div>
  );
};