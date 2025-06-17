import { useNavigate } from 'react-router-dom';
import { Event } from '../../services/eventService';
import { MouseEvent } from 'react';

interface EventCardProps {
  event: Event;
  compact?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

export const EventCard = ({ event, compact = false, onEdit, onDelete }: EventCardProps) => {
  const navigate = useNavigate();

  const getDisplayAddress = (location: Event['location']): string => {
    if (typeof location === 'string') return location;
    return location.address;
  };

  const handleClick = () => {
    if (!onEdit && !onDelete) {
      navigate(`/events/${event.id}`);
    }
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(event.id);
    }
  };

  const isAdmin = onEdit && onDelete;

  return (
    <div
      onClick={handleClick}
      className={`p-2 bg-primary text-primary-content rounded ${!isAdmin ? 'cursor-pointer hover:bg-primary-focus' : ''} transition-colors ${
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
      {isAdmin && (
        <div className="mt-2 flex justify-end space-x-2">
          <button onClick={handleEdit} className="btn btn-xs btn-outline btn-info">Edit</button>
          <button onClick={handleDelete} className="btn btn-xs btn-outline btn-error">Delete</button>
        </div>
      )}
    </div>
  );
};