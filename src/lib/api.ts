import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = '/api';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<any>) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const status = error.response?.status || 500;
    const data = error.response?.data;
    throw new APIError(message, status, data);
  }
);

async function fetchAPI(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<any> {
  try {
    return await axiosInstance({
      url: endpoint,
      ...options,
    });
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error', 500);
  }
}

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      data: credentials,
    });
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      data: data,
    });
  },

  logout: async () => {
    return fetchAPI('/auth/logout', {
      method: 'POST',
    });
  },

  forgotPassword: async (email: string) => {
    return fetchAPI('/auth/forgot-password', {
      method: 'POST',
      data: { email },
    });
  },

  resetPassword: async (token: string, password: string) => {
    return fetchAPI('/auth/reset-password', {
      method: 'POST',
      data: { token, password },
    });
  },

  verifyToken: async () => {
    return fetchAPI('/auth/verify', {
      method: 'GET',
    });
  },

  refreshToken: async () => {
    return fetchAPI('/auth/refresh', {
      method: 'POST',
    });
  },
};

export const userAPI = {
  getProfile: async () => {
    return fetchAPI('/user/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (data: any) => {
    return fetchAPI('/user/profile', {
      method: 'PUT',
      data: data,
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return fetchAPI('/user/change-password', {
      method: 'POST',
      data: { currentPassword, newPassword },
    });
  },
};

export default fetchAPI;
