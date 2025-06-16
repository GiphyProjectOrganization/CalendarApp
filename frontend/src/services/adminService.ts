export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isBlocked: boolean;
  createdAt: string;
  profilePhoto?: string;
  address?: string;
}

export interface AdminEvent {
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

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SystemStats {
  totalUsers: number;
  totalEvents: number;
  draftEvents?: number; // Optional: if your backend provides this
  publicEvents?: number; // Optional: if your backend provides this
  // Add any other stats your backend might return
}

const API_BASE_URL = 'http://localhost:5000/api';

export const adminService = {
  async searchUsers(
    query: string = '',
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  },

  async blockUser(userId: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/block`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to block user');
    }

    return response.json();
  },

  async unblockUser(userId: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/unblock`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unblock user');
    }

    return response.json();
  },

  async searchEvents(
    query: string = '',
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<AdminEvent>> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/admin/events?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch events');
    }

    return response.json();
  },

  async deleteEvent(eventId: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete event');
    }

    return response.json();
  },

  async updateEvent(
    eventId: string,
    eventData: Partial<AdminEvent>
  ): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update event');
    }

    return response.json();
  },

  async getSystemStats(): Promise<SystemStats> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch system statistics');
    }

    return response.json();
  },
};
