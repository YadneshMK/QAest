import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterData } from '../types';
import apiService from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored authentication data on app load
    const storedToken = localStorage.getItem('qaest_token');
    const storedUser = localStorage.getItem('qaest_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Verify token is still valid
        apiService.getProfile()
          .then((response) => {
            if (response.success && response.data) {
              setUser(response.data.user);
            }
          })
          .catch(() => {
            // Token is invalid, clear storage
            localStorage.removeItem('qaest_token');
            localStorage.removeItem('qaest_user');
            setToken(null);
            setUser(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('qaest_token');
        localStorage.removeItem('qaest_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        
        // Store in localStorage
        localStorage.setItem('qaest_token', userToken);
        localStorage.setItem('qaest_user', JSON.stringify(userData));
        
        // Update state
        setToken(userToken);
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.register(data);
      
      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        
        // Store in localStorage
        localStorage.setItem('qaest_token', userToken);
        localStorage.setItem('qaest_user', JSON.stringify(userData));
        
        // Update state
        setToken(userToken);
        setUser(userData);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('qaest_token');
    localStorage.removeItem('qaest_user');
    
    // Clear state
    setToken(null);
    setUser(null);
    setError(null);
    
    // Call logout endpoint (fire and forget)
    apiService.logout().catch(() => {
      // Ignore errors since we're logging out anyway
    });
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 