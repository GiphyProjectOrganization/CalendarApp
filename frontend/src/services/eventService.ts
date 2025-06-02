export interface Event {
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
  reminders: number[];
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
}

const API_BASE_URL = 'http://localhost:5000/api';

export const eventService = {
  async createEvent(
    eventData: Event & { createdAt?: string; updatedAt?: string }
  ): Promise<{ message: string; eventId?: string }> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authorization header when auth is implemented
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(eventData),
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
};
