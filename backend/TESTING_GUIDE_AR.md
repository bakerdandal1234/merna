# 🧪 دليل الاختبار العملي - نظام المراجعة المشتركة

## 📋 المتطلبات

- ✅ قاعدة بيانات MongoDB متصلة
- ✅ Server يعمل على المنفذ 3000 (أو حسب إعداداتك)
- ✅ أداة اختبار API (Postman، Thunder Client، أو cURL)
- ✅ حسابين مستخدمين على الأقل

---

## 🚀 إعداد بيئة الاختبار

### الخطوة 1: تشغيل الـ Server المُحدّث

```bash
# في مجلد backend
cd backend

# إذا أردت تجربة النسخة الجديدة مباشرة
node server_updated.js

# أو استبدل الملف الأصلي
cp server_updated.js server.js
npm start
```

**تأكد من الرسالة:**
```
╔════════════════════════════════════════╗
║   📚 Review Access: All Users          ║
╚════════════════════════════════════════╝
```

---

## 👥 الخطوة 2: إنشاء حسابات المستخدمين

### المستخدم الأول (أحمد):

```bash
POST http://localhost:3000/api/auth/register

Content-Type: application/json

{
  "name": "أحمد",
  "email": "ahmed@example.com",
  "password": "Test1234!"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني"
}
```

### المستخدم الثاني (سارة):

```bash
POST http://localhost:3000/api/auth/register

Content-Type: application/json

{
  "name": "سارة",
  "email": "sara@example.com",
  "password": "Test1234!"
}
```

---

## 🔐 الخطوة 3: تفعيل الحسابات وتسجيل الدخول

### ملاحظة: إذا كان التطبيق يستخدم تفعيل البريد

**الطريقة السهلة للاختبار:** قم بتفعيل الحسابات يدوياً في قاعدة البيانات:

```javascript
// في MongoDB Compass أو mongo shell
db.users.updateMany(
  { email: { $in: ["ahmed@example.com", "sara@example.com"] } },
  { $set: { isVerified: true } }
);
```

### تسجيل دخول أحمد:

```bash
POST http://localhost:3000/api/auth/login

Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "Test1234!"
}
```

**النتيجة:**
```json
{
  "success": true,
  "user": {
    "_id": "676...",
    "name": "أحمد",
    "email": "ahmed@example.com"
  },
  "accessToken": "eyJhbGc..."
}
```

**احفظ الـ token:**
```
AHMED_TOKEN=eyJhbGc...
```

### تسجيل دخول سارة:

```bash
POST http://localhost:3000/api/auth/login

Content-Type: application/json

{
  "email": "sara@example.com",
  "password": "Test1234!"
}
```

**احفظ الـ token:**
```
SARA_TOKEN=eyJhbGc...
```

---

## 📝 الخطوة 4: أحمد يضيف جمل

### إضافة الجملة الأولى:

```bash
POST http://localhost:3000/api/sentences

Authorization: Bearer AHMED_TOKEN
Content-Type: application/json

{
  "german": "Guten Morgen",
  "arabic": "صباح الخير"
}
```

**النتيجة:**
```json
{
  "success": true,
  "message": "✅ تم إضافة الجملة بنجاح",
  "sentence": {
    "_id": "sentence_1_id",
    "german": "Guten Morgen",
    "arabic": "صباح الخير",
    "userId": "ahmed_id",
    "reviewLevel": "new",
    "interval": 0,
    "reviewCount": 0
  }
}
```

### إضافة جمل إضافية لأحمد:

```bash
# الجملة 2
POST http://localhost:3000/api/sentences
Authorization: Bearer AHMED_TOKEN
{
  "german": "Wie geht es dir?",
  "arabic": "كيف حالك؟"
}

# الجملة 3
POST http://localhost:3000/api/sentences
Authorization: Bearer AHMED_TOKEN
{
  "german": "Danke schön",
  "arabic": "شكراً جزيلاً"
}
```

---

## 📚 الخطوة 5: سارة تضيف جمل

```bash
POST http://localhost:3000/api/sentences

Authorization: Bearer SARA_TOKEN
Content-Type: application/json

{
  "german": "Gute Nacht",
  "arabic": "ليلة سعيدة"
}

# الجملة 2 لسارة
{
  "german": "Bis später",
  "arabic": "إلى اللقاء"
}
```

---

## 🧪 اختبارات التعديل الجديد

### ✅ اختبار 1: أحمد يرى جميع الجمل المستحقة

```bash
GET http://localhost:3000/api/sentences/due

Authorization: Bearer AHMED_TOKEN
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 5,
  "sentences": [
    {
      "_id": "...",
      "german": "Guten Morgen",
      "arabic": "صباح الخير",
      "userId": "ahmed_id",
      "isOwner": true,        // ✅ جملة أحمد
      "reviewLevel": "new"
    },
    {
      "_id": "...",
      "german": "Wie geht es dir?",
      "arabic": "كيف حالك؟",
      "userId": "ahmed_id",
      "isOwner": true,        // ✅ جملة أحمد
      "reviewLevel": "new"
    },
    {
      "_id": "...",
      "german": "Gute Nacht",
      "arabic": "ليلة سعيدة",
      "userId": "sara_id",
      "isOwner": false,       // ✅ جملة سارة - يراها أحمد الآن!
      "reviewLevel": "new"
    }
  ]
}
```

**✅ النجاح:** أحمد يرى جمل سارة!

---

### ✅ اختبار 2: أحمد يراجع جملة سارة

```bash
POST http://localhost:3000/api/sentences/[SARA_SENTENCE_ID]/review

Authorization: Bearer AHMED_TOKEN
Content-Type: application/json

{
  "quality": 3
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "✅ تم تحديث البطاقة بنجاح",
  "sentence": {
    "_id": "...",
    "german": "Gute Nacht",
    "arabic": "ليلة سعيدة",
    "userId": "sara_id",
    "isOwner": false,         // ✅ ليست جملة أحمد
    "reviewCount": 1,         // +1
    "correctCount": 1,        // +1
    "interval": 1,            // 0 → 1
    "reviewLevel": "learning"
  },
  "changes": {
    "intervalChange": "0 → 1 أيام",
    "levelChange": "learning",
    "nextReviewDate": "..."
  }
}
```

**✅ النجاح:** أحمد استطاع مراجعة جملة سارة!

---

### ✅ اختبار 3: سارة تراجع جملة أحمد

```bash
POST http://localhost:3000/api/sentences/[AHMED_SENTENCE_ID]/review

Authorization: Bearer SARA_TOKEN
Content-Type: application/json

{
  "quality": 2
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "✅ تم تحديث البطاقة بنجاح",
  "sentence": {
    "_id": "...",
    "german": "Guten Morgen",
    "arabic": "صباح الخير",
    "userId": "ahmed_id",
    "isOwner": false,         // ✅ ليست جملة سارة
    "reviewCount": 1,
    "correctCount": 1,
    "interval": 1
  }
}
```

**✅ النجاح:** سارة استطاعت مراجعة جملة أحمد!

---

### ✅ اختبار 4: سارة لا تستطيع تعديل جملة أحمد

```bash
PUT http://localhost:3000/api/sentences/[AHMED_SENTENCE_ID]

Authorization: Bearer SARA_TOKEN
Content-Type: application/json

{
  "german": "Modified sentence"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

**✅ النجاح:** سارة لا تستطيع تعديل جملة أحمد (الصلاحيات محفوظة)

---

### ✅ اختبار 5: أحمد لا يستطيع حذف جملة سارة

```bash
DELETE http://localhost:3000/api/sentences/[SARA_SENTENCE_ID]

Authorization: Bearer AHMED_TOKEN
```

**النتيجة المتوقعة:**
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

**✅ النجاح:** أحمد لا يستطيع حذف جملة سارة

---

### ✅ اختبار 6: مراجعات متعددة على نفس الجملة

```bash
# أحمد يراجع جملة سارة
POST http://localhost:3000/api/sentences/[SARA_SENTENCE_ID]/review
Authorization: Bearer AHMED_TOKEN
{ "quality": 3 }

# ثم سارة نفسها تراجع جملتها
POST http://localhost:3000/api/sentences/[SARA_SENTENCE_ID]/review
Authorization: Bearer SARA_TOKEN
{ "quality": 2 }
```

**النتيجة المتوقعة للجملة:**
```json
{
  "reviewCount": 2,        // مراجعتان
  "correctCount": 2,
  "interval": 3,           // تضاعف الفاصل
  "reviewLevel": "hard",
  "reviewHistory": [
    {
      "date": "2026-01-23...",
      "quality": 3,
      // يمكن إضافة reviewerId في المستقبل
    },
    {
      "date": "2026-01-23...",
      "quality": 2
    }
  ]
}
```

**✅ النجاح:** الجملة تستفيد من مراجعات المستخدمين المتعددين

---

## 📊 اختبار الإحصائيات

### إحصائيات أحمد:

```bash
GET http://localhost:3000/api/stats

Authorization: Bearer AHMED_TOKEN
```

**النتيجة:**
```json
{
  "success": true,
  "stats": {
    "total": 3,              // جمل أحمد فقط
    "new": 1,
    "learning": 2,
    "due": 3,
    "totalReviews": 5,       // مراجعات أحمد على جمله
    "overallAccuracy": "80"
  }
}
```

**ملاحظة:** الإحصائيات لا تزال شخصية (جمل المستخدم فقط)

---

## 📋 قائمة الاختبار النهائية

استخدم هذه القائمة للتحقق من أن جميع الميزات تعمل:

```
✅ تسجيل مستخدمين جدد
✅ تسجيل دخول المستخدمين
✅ أحمد يضيف جمل
✅ سارة تضيف جمل
✅ أحمد يرى جمل سارة في /api/sentences/due
✅ سارة ترى جمل أحمد في /api/sentences/due
✅ أحمد يراجع جملة سارة بنجاح
✅ سارة تراجع جملة أحمد بنجاح
✅ أحمد لا يستطيع تعديل جملة سارة (403)
✅ سارة لا تستطيع حذف جملة أحمد (403)
✅ أحمد يعدل جملته الخاصة بنجاح
✅ سارة تحذف جملتها الخاصة بنجاح
✅ الجمل تظهر مع isOwner صحيح
✅ المراجعات المتعددة تحدث الجملة بشكل صحيح
✅ الإحصائيات لا تزال شخصية
```

---

## 🐛 استكشاف الأخطاء

### مشكلة: "غير مصرح" عند المراجعة

**السبب:** token منتهي أو غير صالح

**الحل:**
```bash
# سجل دخول مرة أخرى واحصل على token جديد
POST http://localhost:3000/api/auth/login
```

---

### مشكلة: لا يرى المستخدم جمل الآخرين

**السبب:** لا تزال تستخدم `server.js` القديم

**الحل:**
```bash
# تأكد من استخدام الملف المُحدّث
node server_updated.js

# أو استبدل الملف
cp server_updated.js server.js
npm start
```

---

### مشكلة: الجملة غير موجودة (404)

**السبب:** الـ ID غير صحيح

**الحل:**
```bash
# احصل على قائمة الجمل أولاً
GET http://localhost:3000/api/sentences
Authorization: Bearer YOUR_TOKEN

# انسخ الـ _id من الاستجابة واستخدمه
```

---

## 📸 لقطات النجاح

### ✅ مراجعة ناجحة:
```json
{
  "success": true,
  "message": "✅ تم تحديث البطاقة بنجاح",
  "sentence": { ... },
  "changes": {
    "intervalChange": "0 → 1 أيام",
    "levelChange": "learning"
  }
}
```

### ❌ تعديل مرفوض:
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

---

## 🎯 اختبار متقدم (اختياري)

### سيناريو: 3 مستخدمين يراجعون نفس الجملة

```bash
# أحمد يضيف جملة
POST /api/sentences
Authorization: Bearer AHMED_TOKEN
{ "german": "Test", "arabic": "اختبار" }

# أحمد يراجعها (quality: 3)
POST /api/sentences/[ID]/review
Authorization: Bearer AHMED_TOKEN
{ "quality": 3 }

# سارة تراجعها (quality: 2)
POST /api/sentences/[ID]/review
Authorization: Bearer SARA_TOKEN
{ "quality": 2 }

# محمد يراجعها (quality: 3)
POST /api/sentences/[ID]/review
Authorization: Bearer MOHAMED_TOKEN
{ "quality": 3 }
```

**النتيجة المتوقعة:**
```json
{
  "reviewCount": 3,         // 3 مراجعات
  "correctCount": 3,        // جميعها صحيحة
  "interval": 10,           // فاصل أطول
  "reviewLevel": "good"     // مستوى أعلى
}
```

---

## ✅ إتمام الاختبار

إذا نجحت جميع الاختبارات أعلاه، فإن التعديل يعمل بشكل صحيح! 🎉

**التوقيع:**
```
تم اختبار النظام بنجاح ✅
التاريخ: ______________
المختبر: ______________
```

---

تم إنشاء دليل الاختبار: **يناير 2026** 🧪
