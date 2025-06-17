import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Event } from '../../services/eventService';
import { useAuth } from '../../hook/auth-hook';
import { EventCard } from '../../components/events/EventCard';

export const ManageEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!token) {
      setError('Authentication required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.searchEvents(searchTerm);
      setEvents(response.data as unknown as Event[]);
    } catch (err: any) {
      setError(err.message || 'Failed to search events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleDelete = async (eventId: string) => {
    if (!token) {
      setError('Authentication required.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await adminService.deleteEvent(eventId);
        setEvents(events.filter((event) => event.id !== eventId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete event.');
      }
    }
  };

  const handleEdit = (event: Event) => {
    console.log('Navigating to edit event with ID:', event.id);
    navigate(`/events/edit/${event.id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Events</h1>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events by title, description..."
            className="input input-bordered w-full max-w-xs"
          />
          <button type="submit" className="btn btn-primary ml-2">
            Search
          </button>
        </div>
      </form>

      {error && <p className="text-error">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;
