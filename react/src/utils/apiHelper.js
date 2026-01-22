/**
 * 🔧 API Response Handler
 * 
 * دالة مساعدة لمعالجة استجابات API الموحدة
 * تعمل مع الشكل الجديد للاستجابات من Backend
 */

/**
 * معالجة استجابة API الناجحة
 * @param {Object} response - استجابة axios
 * @returns {Object} البيانات المعالجة
 */
export const handleApiResponse = (response) => {
  // إذا كانت الاستجابة بالشكل الجديد {success, data}
  if (response.data && typeof response.data.success !== 'undefined') {
    return {
      success: response.data.success,
      data: response.data,
      message: response.data.message
    };
  }
  
  // إذا كانت الاستجابة بالشكل القديم (array أو object مباشر)
  return {
    success: true,
    data: response.data,
    message: null
  };
};

/**
 * معالجة خطأ API
 * @param {Error} error - خطأ axios
 * @returns {Object} معلومات الخطأ
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // الخطأ من الـ server
    return {
      success: false,
      message: error.response.data?.message || 'حدث خطأ في الخادم',
      errors: error.response.data?.errors || null,
      status: error.response.status
    };
  } else if (error.request) {
    // الطلب تم إرساله لكن لم يتم استقبال رد
    return {
      success: false,
      message: 'فشل الاتصال بالخادم. تحقق من الإنترنت',
      status: 0
    };
  } else {
    // خطأ في إعداد الطلب
    return {
      success: false,
      message: error.message || 'حدث خطأ غير متوقع',
      status: -1
    };
  }
};

/**
 * استخراج البيانات من استجابة sentences
 * @param {Object} response - استجابة API
 * @returns {Array} مصفوفة الجمل
 */
export const extractSentences = (response) => {
  const handled = handleApiResponse(response);
  
  // الشكل الجديد: {success, count, sentences}
  if (handled.data.sentences) {
    return handled.data.sentences;
  }
  
  // الشكل القديم: array مباشر
  if (Array.isArray(handled.data)) {
    return handled.data;
  }
  
  return [];
};

/**
 * استخراج جملة واحدة من استجابة
 * @param {Object} response - استجابة API
 * @returns {Object} الجملة
 */
export const extractSentence = (response) => {
  const handled = handleApiResponse(response);
  
  // الشكل الجديد: {success, message, sentence}
  if (handled.data.sentence) {
    return handled.data.sentence;
  }
  
  // الشكل القديم: object مباشر
  return handled.data;
};

/**
 * استخراج الإحصائيات من استجابة
 * @param {Object} response - استجابة API
 * @returns {Object} الإحصائيات
 */
export const extractStats = (response) => {
  const handled = handleApiResponse(response);
  
  // الشكل الجديد: {success, stats}
  if (handled.data.stats) {
    return handled.data.stats;
  }
  
  // الشكل القديم: object مباشر
  return handled.data;
};

export default {
  handleApiResponse,
  handleApiError,
  extractSentences,
  extractSentence,
  extractStats
};
