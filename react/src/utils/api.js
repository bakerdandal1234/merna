// ============================================
// 🔧 API Helper Functions
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// الحصول على التوكن
const getToken = () => {
  return localStorage.getItem('token');
};

// Headers مع التوكن
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============================================
// دوال مساعدة للطلبات
// ============================================

export const api = {
  // GET Request
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        // إذا انتهت صلاحية التوكن
        localStorage.removeItem('token');
        window.location.reload();
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ');
      }

      return data;
    } catch (error) {
      console.error('خطأ في GET:', error);
      throw error;
    }
  },

  // POST Request
  post: async (endpoint, body) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ');
      }

      return data;
    } catch (error) {
      console.error('خطأ في POST:', error);
      throw error;
    }
  },

  // PUT Request
  put: async (endpoint, body) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ');
      }

      return data;
    } catch (error) {
      console.error('خطأ في PUT:', error);
      throw error;
    }
  },

  // DELETE Request
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ');
      }

      return data;
    } catch (error) {
      console.error('خطأ في DELETE:', error);
      throw error;
    }
  }
};

// ============================================
// دوال محددة للجمل
// ============================================

export const sentencesAPI = {
  // جلب جميع الجمل
  getAll: () => api.get('/sentences'),
  
  // إضافة جملة
  add: (german, arabic) => api.post('/sentences', { german, arabic }),
  
  // مراجعة جملة
  review: (id, quality) => api.post(`/sentences/${id}/review`, { quality }),
  
  // الجمل المستحقة
  getDue: () => api.get('/sentences/due'),
  
  // الإحصائيات
  getStats: () => api.get('/stats'),
  
  // تحديث جملة
  update: (id, data) => api.put(`/sentences/${id}`, data),
  
  // حذف جملة
  delete: (id) => api.delete(`/sentences/${id}`),
  
  // إعادة تعيين
  reset: () => api.post('/sentences/reset', {})
};

export default api;
