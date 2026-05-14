import type { User } from './authApi';

export interface Reaction {
  emoji: string;
  user: User;
}

export interface ChatMessage {
  id: number;
  content: string;
  createdAt: string;
  modifiedAt?: string | null;
  creator: User;
  reactions?: Reaction[];
}

export interface WebSocketError {
  code: string;
  message: string;
}

export interface DeletePayload {
  id: number;
}

export interface ReactionPayload {
  messageId: number;
  emoji: string;
  isRemoved: boolean;
  user: User;
}

export interface WebSocketPayload<T> {
  type: 'message' | 'error' | 'status' | 'delete' | 'reaction';
  payload: T;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as T;
};

const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
};

export const chatApi = {
  // Fetch chat messages
  async getMessages(): Promise<ChatMessage[]> {
    try {
      const response = await apiFetch('/api/messages');
      return handleApiResponse<ChatMessage[]>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch chat messages');
    }
  },

  async deleteMessage(id: number): Promise<void> {
    try {
      const response = await apiFetch(`/api/messages/${id}`, { method: 'DELETE' });
      await handleApiResponse<void>(response);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to delete message');
    }
  },

  async addReaction(messageId: number, emoji: string): Promise<void> {
    try {
      const response = await apiFetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to add reaction');
    }
  },

  async removeReaction(messageId: number): Promise<void> {
    try {
      const response = await apiFetch(`/api/messages/${messageId}/reactions`, {
        method: 'DELETE',
      });
      await handleApiResponse<void>(response);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to remove reaction');
    }
  },

  // Create WebSocket connection
  createWebSocket(): WebSocket | null {
    if (!API_BASE_URL) {
      console.error('Backend URL is not configured');
      return null;
    }

    try {
      const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      return new WebSocket(`${wsUrl}/api/ws`);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  },

  async testConnection(): Promise<boolean> {
    try {
      const response = await apiFetch('/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};
