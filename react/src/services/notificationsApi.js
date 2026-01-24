// API للتعامل مع الإشعارات Push
import api from './api';

// 🔑 المفتاح العام من الـ Backend
// ⚠️ يجب نسخه من VAPID_PUBLIC_KEY في .env بعد توليده
const VAPID_PUBLIC_KEY = 'BD_kLi1uT5Yj-rg_QGhTGlLjWOM53weGrLHxffR0J_H_xUguFP3zkgkZn1zQMxc4MtRP6dBZqFSE5sbyn9ugVM4';

// 🔄 تحويل VAPID key من base64 إلى Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 1️⃣ طلب إذن الإشعارات والاشتراك
export const subscribeToNotifications = async () => {
  try {
    // التحقق من دعم المتصفح
    if (!('serviceWorker' in navigator)) {
      throw new Error('المتصفح لا يدعم Service Workers');
    }

    if (!('PushManager' in window)) {
      throw new Error('المتصفح لا يدعم الإشعارات Push');
    }

    // طلب الإذن
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error('المستخدم رفض السماح بالإشعارات');
    }

    // الحصول على Service Worker registration
    const registration = await navigator.serviceWorker.ready;

    // الاشتراك في Push Notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // إرسال بيانات الاشتراك للـ Backend
    const response = await api.post('/notifications/subscribe', {
      subscription: subscription.toJSON()
    });

    return {
      success: true,
      message: response.data.message,
      data: response.data
    };

  } catch (error) {
    console.error('❌ خطأ في الاشتراك بالإشعارات:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'فشل الاشتراك في الإشعارات'
    };
  }
};

// 2️⃣ تفعيل/تعطيل الإشعارات
export const toggleNotifications = async (enabled) => {
  try {
    const response = await api.put('/notifications/toggle', { enabled });

    return {
      success: true,
      message: response.data.message,
      data: response.data
    };

  } catch (error) {
    console.error('❌ خطأ في تبديل حالة الإشعارات:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل تحديث الإشعارات'
    };
  }
};

// 3️⃣ الحصول على حالة الإشعارات
export const getNotificationStatus = async () => {
  try {
    const response = await api.get('/notifications/status');

    return {
      success: true,
      data: response.data.data
    };

  } catch (error) {
    console.error('❌ خطأ في جلب حالة الإشعارات:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل جلب حالة الإشعارات'
    };
  }
};

// 4️⃣ إلغاء الاشتراك من الإشعارات
export const unsubscribeFromNotifications = async () => {
  try {
    // إلغاء الاشتراك من المتصفح
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
    }

    // إلغاء الاشتراك من الـ Backend
    const response = await api.delete('/notifications/unsubscribe');

    return {
      success: true,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ خطأ في إلغاء الاشتراك:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'فشل إلغاء الاشتراك'
    };
  }
};

// 5️⃣ التحقق من حالة إذن الإشعارات
export const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported'; // المتصفح لا يدعم الإشعارات
  }
  return Notification.permission; // 'granted', 'denied', 'default'
};
