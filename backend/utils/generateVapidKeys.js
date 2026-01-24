// سكريبت لتوليد مفاتيح VAPID المطلوبة للإشعارات الفورية
// قم بتشغيل هذا الملف مرة واحدة فقط: node utils/generateVapidKeys.js

const webpush = require('web-push');

console.log('🔐 جاري توليد مفاتيح VAPID...\n');

// توليد المفاتيح
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ تم توليد المفاتيح بنجاح!\n');
console.log('📋 قم بنسخ هذه المفاتيح وإضافتها في ملف .env:\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('\n⚠️  مهم: لا تشارك المفتاح الخاص (PRIVATE_KEY) مع أحد!');
