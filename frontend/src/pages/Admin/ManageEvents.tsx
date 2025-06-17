import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

interface AdminEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  createdBy: string;
  creatorEmail: string;
  isPublic: boolean;
  isDraft: boolean;
  participants: string[];
  createdAt: string;
}

const ManageEvents = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log('Fetching events with search term:', searchTerm); // Debug log
      const response = await adminService.searchEvents(searchTerm, 1, 50);
      console.log('Events response:', response); // Debug log
      setEvents(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete the event "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteEvent(eventId);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      alert('Event deleted successfully');
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      (event.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (event.creatorEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="bg-base-100 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Manage Events</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by title, description, or creator email..."
          className="input input-bordered flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={fetchEvents}
          className="btn btn-primary"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Creator</th>
              <th>Date</th>
              <th>Type</th>
              <th>Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td>
                  <div>
                    <div className="font-bold">{event.title}</div>
                    <div className="text-sm text-base-content/70 truncate max-w-xs">
                      {event.description || 'No description'}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    <div>{event.creatorEmail}</div>
                    <div className="text-base-content/70">
                      ID: {event.createdBy.slice(-6)}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    <div>{formatDate(event.startDate)}</div>
                    <div className="text-base-content/70">
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className={`badge badge-sm ${event.isPublic ? 'badge-success' : 'badge-info'}`}>
                      {event.isPublic ? 'Public' : 'Private'}
                    </span>
                    {event.isDraft && (
                      <span className="badge badge-sm badge-warning">Draft</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="badge badge-outline">
                    {event.participants.length} participants
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/events/${event.id}`, '_blank')}
                      className="btn btn-sm btn-info"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.title)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEvents.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No events found.</p>
      )}
    </div>
  );
};

export default ManageEvents;