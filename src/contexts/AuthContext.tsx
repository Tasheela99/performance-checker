'use client';

import {
  AuthContextType,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResendOTPData,
  ResetPasswordData,
  User,
  VerifyEmailData
} from '@/types/auth.types';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post('/login', credentials);
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ needsVerification: boolean; email: string }> => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post('/register', data);
      
      return {
        needsVerification: response.data.needsVerification || false,
        email: response.data.email
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (data: VerifyEmailData) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post('/verify-email', data);
      console.log('Email verified successfully:', response.data.message);
    } catch (error: any) {
      console.error('Email verification error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Email verification failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationOTP = async (data: ResendOTPData) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post('/resend-verification', data);
      console.log('Verification code resent:', response.data.message);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to resend verification code';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const forgotPassword = async (data: ForgotPasswordData) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post('/forgot-password', data);
      console.log('Password reset email sent:', response.data.message);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send reset email';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post('/reset-password', data);
      console.log('Password reset successful:', response.data.message);
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Password reset failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      verifyEmail,
      resendVerificationOTP,
      logout,
      updateUser,
      forgotPassword,
      resetPassword,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
