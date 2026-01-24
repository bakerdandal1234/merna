// Service Worker للإشعارات الفورية
// هذا الملف يعمل في الخلفية ويستقبل الإشعارات حتى عند إغلاق الموقع

// 🔔 استقبال الإشعارات الفورية (Push Notifications)
self.addEventListener('push', function(event) {
  console.log('📩 تم استقبال إشعار جديد');

  // قراءة محتوى الإشعار
  let notificationData = {
    title: 'إشعار جديد',
    body: 'لديك رسالة جديدة',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.error('❌ خطأ في قراءة بيانات الإشعار:', e);
    }
  }

  // إعدادات الإشعار
  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/badge-72x72.png',
    vibrate: [200, 100, 200], // نمط الاهتزاز
    data: notificationData.data,
    requireInteraction: false, // الإشعار يختفي تلقائياً
    tag: 'review-notification', // لمنع تكرار الإشعارات
    renotify: true, // إعادة الإشعار حتى لو كان موجود
    actions: [
      {
        action: 'open',
        title: '✅ افتح الموقع',
        icon: '/icon-open.png'
      },
      {
        action: 'close',
        title: '❌ إغلاق',
        icon: '/icon-close.png'
      }
    ]
  };

  // عرض الإشعار
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// 🖱️ عند النقر على الإشعار
self.addEventListener('notificationclick', function(event) {
  console.log('👆 تم النقر على الإشعار');
  
  event.notification.close(); // إغلاق الإشعار

  const urlToOpen = event.notification.data?.url || '/';

  // إذا نقر على زر محدد
  if (event.action === 'close') {
    // لا تفعل شيء، فقط أغلق الإشعار
    return;
  }

  // فتح الموقع في تبويب جديد أو التبديل إلى تبويب موجود
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // البحث عن تبويب مفتوح بالفعل
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === self.location.origin + urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // إذا لم يوجد تبويب مفتوح، افتح تبويب جديد
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 🚀 تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('✅ Service Worker تم تثبيته');
  self.skipWaiting(); // تفعيل فوري
});

// 🔄 تفعيل Service Worker
self.addEventListener('activate', function(event) {
  console.log('✅ Service Worker تم تفعيله');
  event.waitUntil(self.clients.claim()); // السيطرة على جميع الصفحات
});
