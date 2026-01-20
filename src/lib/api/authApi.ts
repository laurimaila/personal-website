interface User {
  id: string;
  username: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
}

export type { User, LoginRequest, RegisterRequest };

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Fetch function with cookies for authentication
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

  return fetch(url, mergedOptions);
};

export const authApi = {
  async login(credentials: LoginRequest): Promise<User> {
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Login failed');
        throw new Error(errorText);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login request failed');
    }
  },

  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Registration failed');
        throw new Error(errorText);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration request failed');
    }
  },

  async checkAuth(): Promise<User | null> {
    try {
      const response = await apiFetch('/api/auth/whoami');

      if (response.status === 401) {
        return null; // Not authenticated
      }

      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error('Auth check failed:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      const response = await apiFetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        console.warn('Logout request failed, but continuing with client-side logout');
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  },
};
