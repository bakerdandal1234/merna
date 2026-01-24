// مسارات API للإشعارات الفورية
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth'); // middleware للتحقق من تسجيل الدخول

// 📌 جميع المسارات تتطلب تسجيل دخول
router.use(protect);

// ========================================
// المسارات (Routes)
// ========================================

// 1️⃣ الاشتراك في الإشعارات
// POST /api/notifications/subscribe
router.post('/subscribe', notificationController.subscribe);

// 2️⃣ تفعيل/تعطيل الإشعارات
// PUT /api/notifications/toggle
router.put('/toggle', notificationController.toggleNotifications);

// 3️⃣ الحصول على حالة الإشعارات
// GET /api/notifications/status
router.get('/status', notificationController.getNotificationStatus);

// 4️⃣ إلغاء الاشتراك من الإشعارات
// DELETE /api/notifications/unsubscribe
router.delete('/unsubscribe', notificationController.unsubscribe);

module.exports = router;
