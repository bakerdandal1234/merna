import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// ✅ قائمة المسارات العامة (لا تحتاج Token)
const authFreePaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/refresh-token' // ← ضروري لتجنب الحلقات
];

// إنشاء Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let accessToken = null;
export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // ✅ 1. استخراج المسار النسبي من الـ URL
    const requestUrl = originalRequest?.url || '';
    const requestPath = requestUrl.startsWith(API_URL) 
      ? requestUrl.replace(API_URL, '') 
      : requestUrl;

    // ✅ 2. التحقق من القائمة (بدون حساسية لحالة الأحرف)
    const isAuthFreePath = authFreePaths.some(path => 
      requestPath.toLowerCase().startsWith(path.toLowerCase())
    );

    // ✅ 3. التعامل مع 401 فقط في المسارات المحمية
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !isAuthFreePath
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ 4. استخدام نفس الـ instance (api) وليس axios مباشر
        const { data } = await api.post('/auth/refresh-token');
        
        const newAccessToken = data.accessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        
        // ✅ 5. منع إعادة التوجيه في المسارات العامة
        if (!isAuthFreePath) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ 6. السماح للأخطاء في المسارات العامة بالمرور
    return Promise.reject(error);
  }
);

export default api;