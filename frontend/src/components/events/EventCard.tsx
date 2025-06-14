import React from 'react';

interface Event {
  _id?: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  isPublic: boolean;
  isDraft: boolean;
  tags: string[];
  participants: string[];
  creatorEmail: string;
  createdBy: string;
}

interface EventCardProps {
  event: Event;
  currentUserEmail: string;
  showActions?: boolean;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  currentUserEmail,
  showActions = true,
  onJoin,
  onLeave,
  onEdit,
  onDelete,
  onViewDetails,
}) => {

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return date; 
    }
  };

  const formatTime = (time: string) => {
    try {
      const timeStr = time.includes(':') ? time : `${time}:00`;
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return time; 
    }
  };

  const isCreator = event.creatorEmail === currentUserEmail;
  const isParticipant = event.participants?.includes(currentUserEmail) || false;
  const canJoin = event.isPublic && !isParticipant && !isCreator;

  const handleCardClick = () => {
    if (onViewDetails && event._id) {
      onViewDetails(event._id);
    } else if (event._id) {
      window.location.href = `/event/${event._id}`;
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  if (!event || !event.title) {
    return null;
  }

  return (
    <div 
      className="card bg-base-100 shadow-lg border border-primary/10 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-primary/30"
      onClick={handleCardClick}
    >
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="card-title text-xl text-primary mb-2 line-clamp-2">
              {event.title}
              {event.isDraft && (
                <span className="badge badge-secondary badge-sm ml-2">Draft</span>
              )}
              {!event.isPublic && (
                <span className="badge badge-accent badge-sm ml-2">Private</span>
              )}
            </h3>
            {event.description && (
              <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          {event.startDate && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary">📅</span>
              <span>
                {formatDate(event.startDate)}
                {event.endDate && event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
              </span>
            </div>
          )}

          {(event.startTime || event.endTime) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary">🕐</span>
              <span>
                {event.startTime && formatTime(event.startTime)}
                {event.startTime && event.endTime && ' - '}
                {event.endTime && formatTime(event.endTime)}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary">📍</span>
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary">👥</span>
            <span>
              {event.participants?.length || 0} participant{(event.participants?.length || 0) !== 1 ? 's' : ''}
              {isCreator && <span className="text-accent ml-1">(You're the creator)</span>}
              {isParticipant && !isCreator && <span className="text-secondary ml-1">(You're participating)</span>}
            </span>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-primary mt-0.5">🏷️</span>
              <div className="flex flex-wrap gap-1">
                {event.tags.slice(0, 3).map((tag, index) => (
                  <span key={`${tag}-${index}`} className="badge badge-ghost badge-sm">
                    {tag}
                  </span>
                ))}
                {event.tags.length > 3 && (
                  <span className="badge badge-ghost badge-sm">
                    +{event.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {showActions && (
          <div className="card-actions justify-end mt-4 pt-4 border-t border-base-300">
            <div className="flex gap-2 flex-wrap">
              {canJoin && onJoin && event._id && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => handleActionClick(e, () => onJoin(event._id!))}
                >
                  Join Event
                </button>
              )}
              
              {isParticipant && !isCreator && onLeave && event._id && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => handleActionClick(e, () => onLeave(event._id!))}
                >
                  Leave Event
                </button>
              )}
              
              {isCreator && onEdit && event._id && (
                <button
                  className="btn btn-accent btn-sm"
                  onClick={(e) => handleActionClick(e, () => onEdit(event._id!))}
                >
                  Edit
                </button>
              )}
              
              {isCreator && onDelete && event._id && (
                <button
                  className="btn btn-error btn-sm"
                  onClick={(e) => handleActionClick(e, () => onDelete(event._id!))}
                >
                  Delete
                </button>
              )}
              
              <button
                className="btn btn-ghost btn-sm"
                onClick={(e) => handleActionClick(e, handleCardClick)}
              >
                View Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;