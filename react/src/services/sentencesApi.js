// ============================================
// 📚 Sentences API Service
// ============================================
import api from './api';

/**
 * جلب جميع الجمل مع pagination وfilters
 */
export const getSentences = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.level) queryParams.append('level', params.level);
  if (params.favorite !== undefined) queryParams.append('favorite', params.favorite);
  if (params.due !== undefined) queryParams.append('due', params.due);
  if (params.sort) queryParams.append('sort', params.sort);
  
  const query = queryParams.toString();
  const url = query ? `/sentences?${query}` : '/sentences';
  
  const response = await api.get(url);
  return response.data;
};

/**
 * جلب جمل المستخدم فقط
 */
export const getMySentences = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.level) queryParams.append('level', params.level);
  if (params.favorite !== undefined) queryParams.append('favorite', params.favorite);
  if (params.due !== undefined) queryParams.append('due', params.due);
  if (params.sort) queryParams.append('sort', params.sort);
  
  const query = queryParams.toString();
  const url = query ? `/sentences/my-sentences?${query}` : '/sentences/my-sentences';
  
  const response = await api.get(url);
  return response.data;
};

/**
 * جلب الجمل المستحقة للمراجعة
 */
export const getDueSentences = async (limit = 20) => {
  const url = limit ? `/sentences/due?limit=${limit}` : '/sentences/due';
  const response = await api.get(url);
  return response.data;
};

/**
 * إضافة جملة جديدة
 */
export const createSentence = async (german, arabic) => {
  const response = await api.post('/sentences', { german, arabic });
  return response.data;
};

/**
 * مراجعة جملة بنظام SM-2
 * @param {string} id - معرف الجملة
 * @param {number} quality - التقييم (0-3)
 */
export const reviewSentence = async (id, quality) => {
  const response = await api.post(`/sentences/${id}/review`, { quality });
  return response.data;
};

/**
 * تعديل جملة
 */
export const updateSentence = async (id, updates) => {
  const response = await api.put(`/sentences/${id}`, updates);
  return response.data;
};

/**
 * حذف جملة
 */
export const deleteSentence = async (id) => {
  const response = await api.delete(`/sentences/${id}`);
  return response.data;
};

/**
 * إعادة تعيين جميع الجمل
 */
export const resetSentences = async () => {
  const response = await api.post('/sentences/reset', {});
  return response.data;
};

/**
 * جلب الإحصائيات
 */
export const getStats = async () => {
  const response = await api.get('/sentences/stats');
  return response.data;
};

export default {
  getSentences,
  getMySentences,
  getDueSentences,
  createSentence,
  reviewSentence,
  updateSentence,
  deleteSentence,
  resetSentences,
  getStats
};
