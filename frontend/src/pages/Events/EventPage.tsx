import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';
import { AuthContext } from '../../components/contexts/authContext/authContext';
import { STATIC_MAP_API_KEY } from '../../constants';
import { DailyForecast } from '../../components/weather/WeateherCard';
import { fetchWeatherForDate } from '../../services/weatherService';
import { WeatherCard } from '../../components/weather/WeateherCard';

const EventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [showParticipants, setShowParticipants] = useState(false);
  const [allParticipants, setAllParticipants] = useState<string[]>([]);
  const [displayedParticipants, setDisplayedParticipants] = useState<string[]>([]);
  const [weatherForecast, setWeatherForecast] = useState<DailyForecast | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherUnit, setWeatherUnit] = useState<'metric' | 'imperial'>('metric');
  const participantsPerPage = 20;

  const getLocationDetails = (location: Event['location']) => {
    if (typeof location === 'string') {
      return {
        address: location,
        placeId: '',
        coordinates: undefined
      };
    }
    return location;
  };

  const locationDetails = event ? getLocationDetails(event.location) : {
    address: '',
    placeId: '',
    coordinates: undefined
  };

  useEffect(() => {
    if (!event || !locationDetails.coordinates) {
      setWeatherLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        const eventDate = new Date(`${event.startDate}T${event.startTime}`);
        const fahrenheitCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
        const unit = fahrenheitCountries.includes(event.location?.countryCode || '') ? 'imperial' : 'metric';
        setWeatherUnit(unit);

        const forecast = await fetchWeatherForDate(
          locationDetails.coordinates.lat,
          locationDetails.coordinates.lng,
          eventDate,
          unit
        );
        setWeatherForecast(forecast);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [event, locationDetails.coordinates]);

  const calculateDuration = () => {
    if (!event) return { hours: 0, minutes: 0};

    try {
      const start = new Date(`${event.startDate}T${event.startTime}`);
      const end = new Date(`${event.endDate}T${event.endTime}`);
      const durationMs = end.getTime() - start.getTime();
      
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return { hours, minutes };
    } catch (e) {
      return { hours: 0, minutes: 0 };
    }
  };

  const duration = calculateDuration();

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hourNum = parseInt(hours);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } catch (e) {
      return timeString;
    }
  };

    useEffect(() => {
        const fetchEvent = async () => {
            setIsLoading(true); 
            try {
            const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
            
            if (!response.ok) throw new Error('Failed to fetch');
            
            const eventData = await response.json();
            
            setEvent(eventData);
            setAllParticipants(eventData.participants || []);
            setDisplayedParticipants((eventData.participants || []).slice(0, participantsPerPage));
            } catch (err) {
            console.error('Full error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
            setIsLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    const handleRemoveParticipant = async (email: string) => {
        if (email === event?.creatorEmail) {
            alert("Cannot remove the event creator");
            return;
        }

        try {
            const response = await fetch(`/api/events/${eventId}/participants`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ email })
            });

            if (!response.ok) {
            throw new Error('Failed to remove participant');
            }

            setEvent(prev => prev ? {
            ...prev,
            participants: prev.participants.filter(p => p !== email)
            } : null);
        } catch (err) {
            console.error('Error removing participant:', err);
        }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Event not found</span>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-primary/20 p-6 md:p-8">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-ghost mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>

          <div className="mb-4">
            <div className="mb-1">
              {event.isPublic ? (
                <span className="badge bg-accent border-accent badge-success">Public</span>
              ) : (
                <span className="badge bg-accent border-accent badge-info">Private</span>
              )}
            </div>

            <h1 className="text-3xl font-bold">{event.title}</h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/80 mt-2">
              <span className="font-medium">Created by:</span>
              <span className="text-primary font-semibold">{event.creatorUsername || 'Unknown'}</span>
              <span className="text-base-content/50">|</span>
              {event.isDraft && <span className="badge badge-warning">Draft</span>}
              {event.isRecurring && <span className="badge badge-secondary">Recurring</span>}
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-base-content whitespace-pre-line">{event.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">Date & Time</h2>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">{formatDate(event.startDate)}</p>
                    <p className="text-base-content/80">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                    <p className="text-base-content/60 mt-1">
                      Duration: {duration.hours > 0 && `${duration.hours} hr${duration.hours > 1 ? 's' : ''} `}
                      {duration.minutes > 0 && `${duration.minutes} min${duration.minutes > 1 ? 's' : ''}`}
                    </p>
                    {event.isRecurring && event.recurrencePattern && (
                      <div className="mt-2 text-sm text-base-content/60">
                        <p>Repeats: {event.recurrencePattern.type}</p>
                        {event.recurrencePattern.endDate && (
                          <p>Until: {formatDate(event.recurrencePattern.endDate)}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-primary">
                    Participants ({event.participants?.length || 0})
                  </h3>
                  <button 
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="btn btn-xs btn-ghost bg-accent text-accent-content"
                  >
                    {showParticipants ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showParticipants && (
                  <div className="bg-base-200 rounded-lg p-3 border border-base-300 max-h-64 overflow-y-auto">
                    <ul className="space-y-2">
                      {event.participants?.map((participant, index) => (
                        <li 
                          key={index} 
                          className="flex items-center justify-between bg-base-100 p-2 rounded-md shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-8">
                                <span className="text-xs">
                                  {participant.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{participant}</p>
                              <div className="flex gap-1 text-xs mt-0.5">
                                {auth.userEmail === participant && (
                                  <span className="badge badge-accent badge-xs">You</span>
                                )}
                                {event.creatorEmail === participant && (
                                  <span className="badge badge-primary badge-xs">Creator</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {auth.userId === event.createdBy && 
                          participant !== event.creatorEmail && 
                          participant !== auth.userEmail && (
                              <button 
                                className="btn btn-xs btn-ghost text-error"
                                onClick={() => handleRemoveParticipant(participant)}
                              >
                                Remove
                              </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">Weather Forecast</h2>
              <div className="border border-base-300 rounded-lg p-4 bg-base-200">
                {weatherLoading ? (
                  <div className="flex justify-center items-center min-h-[8rem]">
                    <span className="loading loading-spinner loading-md text-primary" />
                    <p className="ml-2">Loading weather...</p>
                  </div>
                ) : (
                  <div className="scale-90 md:scale-100">
                    <WeatherCard
                      day={weatherForecast}
                      unit={weatherUnit}
                      locationName={typeof event.location === 'string' ? event.location : event.location.address}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-primary mb-4">Location</h2>
              <div className="flex items-start gap-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium">{locationDetails.address || 'Location not specified'}</p>
                  {locationDetails.placeId && locationDetails.coordinates && (
                    <a 
                      href={`https://www.google.com/maps/place/?q=place_id:${locationDetails.placeId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 inline-block"
                    >
                      View on Google Maps
                    </a>
                  )}
                </div>
              </div>

              {locationDetails.placeId && locationDetails.coordinates && (
                <div className="w-full h-64 rounded-xl overflow-hidden border border-base-300">
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${locationDetails.coordinates.lat},${locationDetails.coordinates.lng}&zoom=15&size=800x350&maptype=roadmap&markers=color:red%7C${locationDetails.coordinates.lat},${locationDetails.coordinates.lng}&key=${STATIC_MAP_API_KEY}`}
                    alt="Event location map"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span key={index} className="badge badge-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-4">
            {auth.userEmail && auth.userEmail === event.creatorEmail && (
              <>
                <button className="btn btn-primary">Edit Event</button>
                <button className="btn btn-error">Cancel Event</button>
              </>
            )}
            {auth.userEmail && !event.participants.includes(auth.userEmail) && (
              <button className="btn btn-accent">Join Event</button>
            )}
            {auth.userEmail && event.participants.includes(auth.userEmail) && auth.userEmail !== event.creatorEmail && (
              <button className="btn btn-error">Leave Event</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventPage;