# 🧪 اختبار التحسينات - Quick Test Guide

## ✅ خطوات الاختبار

### 1️⃣ اختبار تشغيل السيرفر

```bash
cd backend
npm start
```

**المتوقع:**
```
✅ MongoDB connected
╔════════════════════════════════════════╗
║   🚀 Server Running on Port 3000      ║
║   🌍 Environment: development         ║
║   🔐 Authentication: Enabled          ║
║   🛡️  Authorization: Active           ║
║   🧠 SM-2 Algorithm: Active           ║
║   🔗 API: http://localhost:3000/api   ║
╚════════════════════════════════════════╝
```

---

### 2️⃣ اختبار Health Check

```bash
curl http://localhost:3000/health
```

**المتوقع:**
```json
{
  "success": true,
  "message": "Server is running! 🚀",
  "timestamp": "2024-01-23T..."
}
```

---

### 3️⃣ اختبار Pagination

#### A. الصفحة الأولى (بدون Token - سيفشل)
```bash
curl http://localhost:3000/api/sentences?page=1&limit=5
```

**المتوقع:**
```json
{
  "success": false,
  "message": "غير مصرح. يرجى تسجيل الدخول"
}
```

#### B. مع Token (بعد تسجيل الدخول)
```bash
# 1. سجل دخول أولاً
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "YourPassword123!@#"
  }'

# 2. احفظ الـ accessToken من الاستجابة
# 3. استخدمه في الطلبات:

curl http://localhost:3000/api/sentences?page=1&limit=5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**المتوقع:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 50,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 4️⃣ اختبار الفلاتر

#### A. جمل المستوى "good" فقط
```bash
curl "http://localhost:3000/api/sentences?level=good&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### B. الجمل المستحقة للمراجعة
```bash
curl "http://localhost:3000/api/sentences?due=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### C. المفضلة فقط
```bash
curl "http://localhost:3000/api/sentences?favorite=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5️⃣ اختبار إضافة جملة

```bash
curl -X POST http://localhost:3000/api/sentences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "german": "Ich lerne Deutsch jeden Tag",
    "arabic": "أنا أتعلم الألمانية كل يوم"
  }'
```

**المتوقع:**
```json
{
  "success": true,
  "message": "✅ تم إضافة الجملة بنجاح",
  "data": {
    "_id": "...",
    "german": "Ich lerne Deutsch jeden Tag",
    "arabic": "أنا أتعلم الألمانية كل يوم",
    "reviewLevel": "new",
    "interval": 0,
    ...
  }
}
```

---

### 6️⃣ اختبار Validation

#### A. جملة ناقصة (يجب أن يفشل)
```bash
curl -X POST http://localhost:3000/api/sentences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "german": "Test"
  }'
```

**المتوقع:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "arabic",
      "message": "الترجمة العربية مطلوبة"
    }
  ]
}
```

---

### 7️⃣ اختبار المراجعة (SM-2)

```bash
# استبدل SENTENCE_ID بـ ID جملة موجودة
curl -X POST http://localhost:3000/api/sentences/SENTENCE_ID/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "quality": 3
  }'
```

**المتوقع:**
```json
{
  "success": true,
  "message": "✅ تم تحديث البطاقة بنجاح",
  "data": {
    "interval": 1,
    "easeFactor": 2.65,
    "reviewLevel": "learning",
    ...
  },
  "changes": {
    "intervalChange": "0 → 1 أيام",
    "levelChange": "learning",
    "nextReviewDate": "..."
  }
}
```

---

### 8️⃣ اختبار الإحصائيات

```bash
curl http://localhost:3000/api/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**المتوقع:**
```json
{
  "success": true,
  "stats": {
    "total": 50,
    "new": 10,
    "learning": 15,
    "hard": 8,
    "good": 12,
    "excellent": 5,
    "mastered": 0,
    "due": 20,
    "masteryPercentage": "34.0",
    "totalReviews": 150,
    "overallAccuracy": "78.5"
  }
}
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "Cannot find module './models/Sentence'"
**الحل:**
```bash
# تأكد أن الملف موجود
ls models/Sentence.js

# تأكد من اسم الملف الصحيح (case-sensitive)
```

### خطأ: "JWT_ACCESS_SECRET is not defined"
**الحل:**
```bash
# تأكد من وجود .env file
cat .env | grep JWT_ACCESS_SECRET

# أعد تشغيل السيرفر
npm start
```

### خطأ: "MongoDB connection error"
**الحل:**
```bash
# تأكد من صحة MONGODB_URI في .env
# تأكد من اتصالك بالإنترنت (إذا كنت تستخدم MongoDB Atlas)
```

---

## 📊 قياس الأداء

### قبل Pagination:
```bash
# جلب 1000 جملة دفعة واحدة
time curl http://localhost:3000/api/sentences

# النتيجة: ~2-3 seconds ❌
```

### بعد Pagination:
```bash
# جلب 20 جملة فقط
time curl "http://localhost:3000/api/sentences?page=1&limit=20"

# النتيجة: ~50-100ms ✅
```

---

## 🎯 نتائج متوقعة

✅ **السيرفر يعمل بدون أخطاء**
✅ **Pagination يعمل بشكل صحيح**
✅ **الفلاتر تعمل (level, due, favorite)**
✅ **Validation يمنع البيانات الخاطئة**
✅ **SM-2 Algorithm يحدّث البطاقات**
✅ **Authorization يمنع التعديل غير المصرح**

---

## 📝 ملاحظات

1. استبدل `YOUR_ACCESS_TOKEN` بالـ token الحقيقي من `/api/auth/login`
2. استبدل `SENTENCE_ID` بـ ID جملة موجودة في قاعدة البيانات
3. كل الـ endpoints تتطلب Authentication ما عدا:
   - `/health`
   - `/`
   - `/api/auth/register`
   - `/api/auth/login`
   - `/api/auth/verify-email/:token`
   - `/api/auth/reset-password/:token`

---

## 🚀 الخطوة التالية

بعد نجاح الاختبارات:
1. حدّث Frontend ليستخدم Pagination
2. أضف UI للفلاتر (level, favorite, due)
3. أضف Loading states للـ pagination
4. أضف Infinite Scroll (optional)

---

**نجح الاختبار؟ 🎉**

انتقل إلى Priority 3 improvements:
- Winston Logger
- Error Handling
- Caching
- Unit Tests
