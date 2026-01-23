// ============================================
// 🔧 API Error Handler & Helper Utilities
// ============================================

/**
 * معالجة أخطاء API
 */
export const handleApiError = (error) => {
  if (error.response) {
    // خطأ من الخادم
    return {
      status: error.response.status,
      message: error.response.data?.message || 'حدث خطأ في الخادم',
      errors: error.response.data?.errors || null,
      data: error.response.data
    };
  } else if (error.request) {
    // لم يتم استلام رد
    return {
      status: null,
      message: 'فشل الاتصال بالخادم. تحقق من اتصال الإنترنت',
      errors: null,
      data: null
    };
  } else {
    // خطأ آخر
    return {
      status: null,
      message: error.message || 'حدث خطأ غير متوقع',
      errors: null,
      data: null
    };
  }
};

/**
 * استخراج الجمل من الاستجابة
 */
export const extractSentences = (response) => {
  // التعامل مع كلا الشكلين:
  // 1. { success: true, data: [...] }
  // 2. { sentences: [...] }
  
  if (response.data?.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  if (response.data?.success && Array.isArray(response.data.sentences)) {
    return response.data.sentences;
  }
  
  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  console.warn('تنسيق غير متوقع للاستجابة:', response);
  return [];
};

/**
 * تنسيق التاريخ العربي
 */
export const formatArabicDate = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * التحقق من صلاحية Token
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // تحويل لـ milliseconds
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
};

/**
 * حساب الوقت المتبقي حتى انتهاء صلاحية Token
 */
export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const remaining = exp - Date.now();
    return Math.max(0, remaining);
  } catch (error) {
    return 0;
  }
};

export default {
  handleApiError,
  extractSentences,
  formatArabicDate,
  isTokenExpired,
  getTokenTimeRemaining
};
