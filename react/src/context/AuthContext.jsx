import { createContext, useState, useContext, useEffect } from 'react';
import api, { setAccessToken, clearAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحميل المستخدم عند بدء التطبيق
  useEffect(() => {
    checkAuth();
  }, []);

  // التحقق من حالة المصادقة
  const checkAuth = async () => {
    try {
      // محاولة الحصول على access token جديد من refresh token
      const { data } = await api.post('/auth/refresh-token');
      setAccessToken(data.accessToken);

      // جلب بيانات المستخدم
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data.user);
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // تسجيل مستخدم جديد
  const register = async (userData) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/register', userData);
      return { success: true, message: data.message };
    } catch (error) {
      console.log('Registration error:', error);
      const message = error.response?.data?.errors?.message || error.response?.data?.message || 'حدث خطأ في التسجيل';
      setError(message);
      return { success: false, message };
    }
  };

  // تفعيل الحساب
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const { data } = await api.get(`/auth/verify-email/${token}`);
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ في التفعيل';
      setError(message);
      return { success: false, message };
    }
  };

  // تسجيل الدخول
  const login = async (credentials) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/login', credentials);
      
      // حفظ الـ access token
      setAccessToken(data.accessToken);
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ في تسجيل الدخول';
      setError(message);
      return { success: false, message };
    }
  };

  // تسجيل الخروج
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

  // نسيت كلمة المرور
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/forgot-password', { email });
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ';
      setError(message);
      return { success: false, message };
    }
  };

  // إعادة تعيين كلمة المرور
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const { data } = await api.put(`/auth/reset-password/${token}`, {
        password
      });
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ';
      setError(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook للاستخدام السهل
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
