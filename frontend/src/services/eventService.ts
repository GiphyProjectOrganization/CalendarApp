export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: {
    placeId: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | string;
  isPublic: boolean;
  isDraft: boolean;
  tags: string[];
  participants: string[];
  reminders: number[];
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  createdBy: string;
  creatorUsername?: string;
  creatorEmail?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const eventService = {
  async createEvent(
    eventData: Event & { createdAt?: string; updatedAt?: string }
  ): Promise<{ message: string; eventId?: string }> {

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formattedEventData = {
      ...eventData,
      location: typeof eventData.location === 'string'
        ? eventData.location
        : {
            placeId: eventData.location.placeId,
            address: eventData.location.address,
            ...(eventData.location.coordinates && {
              coordinates: eventData.location.coordinates
            })
          }
    };

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // TODO: Add authorization header when auth is implemented
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(formattedEventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create event');
    }

    return response.json();
  },

  async getEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authorization header when auth is implemented
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch events');
    }

    return response.json();
  },

    async getCreatedEvents(userId: string): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/created/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch created events');
    }

    return response.json();
  },

  async searchUsers(query: string): Promise<Array<{
    id: string;
    email: string;
    username: string;
    name: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/users/lookup?query=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search users');
    }

    return response.json();
  },

  async getParticipatingEvents(token: string): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/participating`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const events = await response.json();
  
    return events.map((event: any) => ({
      ...event,
      location: event.location?.address || event.location || ''
    }));
  },

  async getEventById(eventId: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch event';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response:', text);
      throw new Error('Invalid response format');
    }
  }
};
