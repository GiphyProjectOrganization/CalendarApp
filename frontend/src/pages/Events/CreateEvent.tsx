import React, { useState, ChangeEvent, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/contexts/authContext/authContext';
import { eventService, Event } from '../../services/eventService';
import { UserLocation } from '../../hook/userLocation-hook';
import PlacePicker from '../../components/map/PlacePicker';
import { MAP_API_KEY } from '../../constants';

const GOOGLE_MAP_LIBRARIES = ['places'];

const CreateEvent = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  
  useEffect(() => {
    if (!auth.isLoggedIn) {
      alert('Please log in to create events');
      navigate('/login');
      return;
    }
  }, [auth.isLoggedIn, navigate]);

  const [event, setEvent] = useState<Event>({
    id: '',
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: {
      placeId: '',
      address: '',
      coordinates: undefined
    },
    isPublic: false,
    isDraft: false,
    tags: [],
    participants: [], 
    reminders: [],
    isRecurring: false,
  });

  const [newTag, setNewTag] = useState('');
  const [newParticipant, setNewParticipant] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const countries = [];
  const { location, isLoading, error } = UserLocation();
  const [participantQuery, setParticipantQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    email: string;
    username: string;
    name: string;
  }>>([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (auth.isLoggedIn && auth.token) {
        try {
          const response = await fetch(`http://localhost:5000/api/user/me`, {
            headers: {
              'Authorization': `Bearer ${auth.token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUserEmail(userData.email);
            setEvent(prev => ({
              ...prev,
              participants: [userData.email]
            }));
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      }
    };
    fetchUserInfo();
  }, [auth.isLoggedIn, auth.token]);

  const updateEvent =
    (field: keyof Event) =>
      (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        const value =
          e.target.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target.value;
        setEvent((prev) => ({
          ...prev,
          [field]: value,
        }));
      };

  const updateRecurrence =
    (field: string) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value =
          e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
        setEvent((prev) => ({
          ...prev,
          recurrencePattern: {
            ...prev.recurrencePattern,
            [field]: value,
          } as Event['recurrencePattern'],
        }));
      };

  const addTag = () => {
    if (newTag.trim() && !event.tags.includes(newTag.trim())) {
      setEvent((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEvent((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSearchUsers = async () => {
    if (!participantQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await eventService.searchUsers(participantQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search users:', err);
      alert('Failed to search users. Please try again.');
    }
  };

  const addParticipant = (user: { id: string; email: string }) => {
     if (!user.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Please enter a valid email address');
      return;
    }

    if (user.email === userEmail) {
      alert('You are already the creator of this event');
      return;
    }

    if (event.participants.includes(user.email)) {
      alert('This participant is already added');
      return;
    }

    setEvent((prev) => ({
      ...prev,
      participants: [...prev.participants, user.email],
    }));
    setParticipantQuery('');
    setSearchResults([]);
  };

  const removeParticipant = (participantToRemove: string) => {
    if (participantToRemove === userEmail) {
      alert('You cannot remove yourself as the event creator');
      return;
    }
    
    setEvent((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p !== participantToRemove),
    }));
  };

  const addReminder = () => {
    const minutes = parseInt(newReminder);

    if (minutes > 0 && !event.reminders.includes(minutes)) {
      setEvent((prev) => ({
        ...prev,
        reminders: [...prev.reminders, minutes].sort((a, b) => a - b),
      }));

      setNewReminder('');
    }
  };

  const removeReminder = (reminderToRemove: number) => {
    setEvent((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r !== reminderToRemove),
    }));
  };

  const formatReminderText = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
    return `${Math.floor(minutes / 1440)} days`;
  };

  const validateEvent = () => {
    if (!event.title.trim()) return 'Title is required';
    if (event.title.length < 3 || event.title.length > 30)
      return 'Title must be between 3 and 30 characters';
    if (!event.startDate || !event.startTime)
      return 'Start date and time are required';
    if (!event.endDate || !event.endTime)
      return 'End date and time are required';
    if (event.description.length > 500)
      return 'Description must not exceed 500 characters';

    const startDateTime = new Date(`${event.startDate}T${event.startTime}`);
    const endDateTime = new Date(`${event.endDate}T${event.endTime}`);

    if (endDateTime <= startDateTime)
      return 'End time must be after start time';

    return null;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!auth.isLoggedIn) {
      alert('Please log in to create events');
      navigate('/login');
      return;
    }

    const validationError = validateEvent();
    if (validationError && !isDraft) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);

    const eventData = {
      ...event,
      isDraft,
      createdBy: auth.userId, 
      creatorEmail: userEmail, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const result = await eventService.createEvent(eventData);
      alert(result.message);
      navigate('/calendar');
    } catch (err) {
      console.error('Failed to create event:', err);
      alert(err instanceof Error ? err.message : 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!auth.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Authentication Required</h2>
          <p className="text-base-content mb-4">Please log in to create events</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-primary/20 p-8">
          <h1 className="text-4xl font-bold text-primary mb-8 text-center">
            Create New Event
          </h1>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={event.title}
                  onChange={updateEvent('title')}
                  placeholder="Enter event title"
                  className="input input-bordered w-full"
                  maxLength={30}
                />
                <div className="text-xs text-base-content/60 mt-1">
                  {event.title.length}/30 characters
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
                    <span className="loading loading-spinner loading-xs text-primary" />
                    Detecting your location...
                  </div>
                )}
                {(!isLoading && location.lat === 0 && location.lon === 0) && (
                  <div className="alert alert-warning my-2 text-sm">
                    Location not available. Some features may be limited.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-base-content font-medium mb-2">Event Location</label>
                <PlacePicker
                  onPlaceSelected={(placeData) => {
                    setEvent(prev => ({
                      ...prev,
                      location: placeData
                    }));
                  }}
                  lat={location.lat}
                  lon={location.lon}
                />
                <div className="text-xs text-base-content/60 mt-1">
                  {typeof event.location === 'object' ? event.location.address : ''}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                Description
              </label>
              <textarea
                value={event.description}
                onChange={updateEvent('description')}
                placeholder="Enter event description"
                className="textarea textarea-bordered w-full h-24"
                maxLength={500}
              />
              <div className="text-xs text-base-content/60 mt-1">
                {event.description.length}/500 characters
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={event.startDate}
                  onChange={updateEvent('startDate')}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={event.startTime}
                  onChange={updateEvent('startTime')}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={event.endDate}
                  onChange={updateEvent('endDate')}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={event.endTime}
                  onChange={updateEvent('endTime')}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={event.isPublic}
                  onChange={updateEvent('isPublic')}
                  className="checkbox checkbox-primary"
                />
                <span className="text-sm font-medium">Public Event</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={event.isRecurring}
                  onChange={(e) => {
                    updateEvent('isRecurring')(e);
                    setShowRecurrenceOptions(e.target.checked);
                  }}
                  className="checkbox checkbox-primary"
                />
                <span className="text-sm font-medium">Recurring Event</span>
              </label>
            </div>

            {showRecurrenceOptions && (
              <div className="bg-base-200 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-base-content">
                  Recurrence Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-2">
                      Repeat Type
                    </label>
                    <select
                      onChange={updateRecurrence('type')}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select type</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-base-content mb-2">
                      Repeat Every
                    </label>
                    <input
                      type="number"
                      min="1"
                      onChange={updateRecurrence('interval')}
                      className="input input-bordered w-full"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-base-content mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      onChange={updateRecurrence('endDate')}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                Tags/Categories
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="input input-bordered flex-1"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addTag())
                  }
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-primary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-secondary cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                Participants
              </label>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={participantQuery}
                    onChange={(e) => {
                      setParticipantQuery(e.target.value);
                      handleSearchUsers();
                    }}
                    placeholder="Search by email or username"
                    className="input input-bordered w-full"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg rounded-md max-h-60 overflow-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-2 hover:bg-base-200 cursor-pointer"
                          onClick={() => addParticipant(user)}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-base-content/60">
                            {user.email} • @{user.username}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearchUsers}
                  className="btn btn-primary"
                >
                  Search
                </button>
              </div>
              <div className="space-y-1">
                {event.participants.map((participantEmail) => (
                  <div
                    key={participantEmail}
                    className="flex items-center justify-between bg-base-200 p-2 rounded"
                  >
                    <span>
                      {participantEmail}
                      {participantEmail === userEmail && (
                        <span className="badge badge-accent ml-2 text-xs">Creator</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeParticipant(participantEmail)}
                      className={`btn btn-sm btn-ghost text-error ${
                        participantEmail === userEmail ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={participantEmail === userEmail}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                Reminders
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  className="select select-bordered flex-1"
                >
                  <option value="">Select reminder time</option>
                  <option value="5">5 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                  <option value="10080">1 week before</option>
                </select>
                <button
                  type="button"
                  onClick={addReminder}
                  className="btn btn-primary"
                  disabled={!newReminder}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.reminders.map((reminder) => (
                  <span
                    key={reminder}
                    className="badge badge-accent cursor-pointer"
                    onClick={() => removeReminder(reminder)}
                  >
                    {formatReminderText(reminder)} ×
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className={`btn btn-outline btn-secondary flex-1 ${isSubmitting ? 'loading' : ''}`}
              >
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className={`btn btn-primary flex-1 ${isSubmitting ? 'loading' : ''}`}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/calendar')}
                disabled={isSubmitting}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
            {error && (
              <div className="alert alert-warning my-2 text-sm">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;