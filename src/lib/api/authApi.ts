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

interface ApiError {
  code?: string;
  message?: string;
  errors?: string[];
}

async function handleResponse<T>(response: Response, defaultErrorMessage: string): Promise<T> {
  if (response.ok) {
    return response.json();
  }

  let errorMessage = defaultErrorMessage;
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = (await response.json()) as ApiError;
      if (errorData.errors && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join('. ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }
  } catch (e) {
    console.error('Error backend ApiError response', e);
  }

  throw new Error(errorMessage);
}

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
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    return handleResponse<User>(response, 'Login failed');
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return handleResponse<User>(response, 'Registration failed');
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
