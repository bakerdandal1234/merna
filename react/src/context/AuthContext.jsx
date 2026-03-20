import { createContext, useState, useContext, useEffect } from 'react';
import api, { setAccessToken, clearAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on app start
  useEffect(() => { checkAuth(); }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      console.log('🔄 Attempting to refresh session...');

      const { data } = await api.post('/auth/refresh-token');

      if (data.success && data.accessToken) {
        console.log('✅ Access Token refreshed');
        setAccessToken(data.accessToken);

        const userResponse = await api.get('/auth/me');
        console.log('✅ User data loaded:', userResponse.data.user.name);
        setUser(userResponse.data.user);
      } else {
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.log('❌ Authentication check failed:', error.response?.data?.message || error.message);
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      return { success: true, message: data.message };
    } catch (error) {
      const backendErrors = error.response?.data?.errors || error.response?.data?.message;
      return {
        success: false,
        errors: Array.isArray(backendErrors) ? backendErrors : [backendErrors]
      };
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const { data } = await api.get(`/auth/verify-email/${token}`);
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Fehler bei der Kontoaktivierung';
      setError(message);
      return { success: false, message };
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/login', credentials);
      setAccessToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Fehler beim Anmelden';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/forgot-password', { email });
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Ein Fehler ist aufgetreten';
      setError(message);
      return { success: false, message };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Ein Fehler ist aufgetreten';
      setError(message);
      return { success: false, message };
    }
  };

  const value = {
    user, loading, error,
    register, verifyEmail, login,
    logout, forgotPassword, resetPassword, checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
