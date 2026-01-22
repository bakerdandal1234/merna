# 🧪 دليل اختبار النظام الجديد

## 📋 المتطلبات
- Postman أو Insomnia
- حسابين مستخدمين على الأقل

---

## 🎯 سيناريوهات الاختبار

### السيناريو 1️⃣: إنشاء مستخدمين

#### الخطوة 1: تسجيل المستخدم الأول (User A)
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Ahmed",
  "email": "ahmed@test.com",
  "password": "Ahmed@123"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح. يرجى التحقق من إيميلك لتفعيل الحساب"
}
```

#### الخطوة 2: تفعيل الحساب (User A)
```
افتح الإيميل واضغط على رابط التفعيل
أو استخدم endpoint التفعيل مباشرة
```

#### الخطوة 3: تسجيل الدخول (User A)
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "ahmed@test.com",
  "password": "Ahmed@123"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ahmed",
    "email": "ahmed@test.com"
  }
}
```

**احفظ الـ Token:**
```
USER_A_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### الخطوة 4: كرر نفس الخطوات للمستخدم الثاني (User B)
```
name: "Sara"
email: "sara@test.com"
password: "Sara@123"

USER_B_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ8..."
```

---

### السيناريو 2️⃣: إضافة جمل

#### الخطوة 1: إضافة جمل بواسطة User A
```http
POST http://localhost:3000/api/sentences
Authorization: Bearer {USER_A_TOKEN}
Content-Type: application/json

{
  "german": "Ich bin Ahmed",
  "arabic": "أنا أحمد"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "✅ تم إضافة الجملة بنجاح",
  "sentence": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "german": "Ich bin Ahmed",
    "arabic": "أنا أحمد",
    "reviewLevel": "new"
  }
}
```

**احفظ الـ ID:**
```
SENTENCE_A_ID = "507f1f77bcf86cd799439012"
```

#### الخطوة 2: أضف 2-3 جمل إضافية لـ User A

#### الخطوة 3: إضافة جمل بواسطة User B
```http
POST http://localhost:3000/api/sentences
Authorization: Bearer {USER_B_TOKEN}
Content-Type: application/json

{
  "german": "Ich bin Sara",
  "arabic": "أنا سارة"
}
```

**احفظ الـ ID:**
```
SENTENCE_B_ID = "507f1f77bcf86cd799439013"
```

#### الخطوة 4: أضف 2-3 جمل إضافية لـ User B

---

### السيناريو 3️⃣: اختبار القراءة (Read)

#### اختبار 1: User A يجلب كل الجمل
```http
GET http://localhost:3000/api/sentences
Authorization: Bearer {USER_A_TOKEN}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 6,
  "sentences": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "german": "Ich bin Ahmed",
      "arabic": "أنا أحمد",
      "userId": "507f1f77bcf86cd799439011",
      "isOwner": true,      // ✅ جملة User A
      "canEdit": true,       // ✅ يمكن التعديل
      "canDelete": true      // ✅ يمكن الحذف
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "german": "Ich bin Sara",
      "arabic": "أنا سارة",
      "userId": "507f1f77bcf86cd799439014",
      "isOwner": false,     // ❌ جملة User B
      "canEdit": false,      // ❌ لا يمكن التعديل
      "canDelete": false     // ❌ لا يمكن الحذف
    }
  ]
}
```

**التحقق:**
- ✅ `count` يجب أن يساوي عدد جمل User A + User B
- ✅ جمل User A: `isOwner: true`
- ✅ جمل User B: `isOwner: false`

#### اختبار 2: User A يجلب جمله فقط
```http
GET http://localhost:3000/api/sentences?view=my
Authorization: Bearer {USER_A_TOKEN}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 3,
  "sentences": [
    // فقط جمل User A (كلها isOwner: true)
  ]
}
```

#### اختبار 3: User A يجلب جمل الآخرين فقط
```http
GET http://localhost:3000/api/sentences?view=others
Authorization: Bearer {USER_A_TOKEN}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 3,
  "sentences": [
    // فقط جمل User B (كلها isOwner: false)
  ]
}
```

---

### السيناريو 4️⃣: اختبار التعديل (Update)

#### ✅ اختبار نجاح: User A يعدل جملته
```http
PUT http://localhost:3000/api/sentences/{SENTENCE_A_ID}
Authorization: Bearer {USER_A_TOKEN}
Content-Type: application/json

{
  "arabic": "أنا أحمد المحدث"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "✅ تم تعديل الجملة بنجاح",
  "sentence": {
    "_id": "507f1f77bcf86cd799439012",
    "german": "Ich bin Ahmed",
    "arabic": "أنا أحمد المحدث",  // ✅ تم التحديث
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

**Status Code:** `200 OK`

#### ❌ اختبار فشل: User A يحاول تعديل جملة User B
```http
PUT http://localhost:3000/api/sentences/{SENTENCE_B_ID}
Authorization: Bearer {USER_A_TOKEN}
Content-Type: application/json

{
  "arabic": "محاولة تعديل جملة سارة"
}
```

**النتيجة المتوقعة:**
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

**Status Code:** `403 Forbidden`

**التحقق:**
- ❌ التعديل **لم ينجح**
- ❌ Status Code: `403`
- ❌ الرسالة: تمنع التعديل

---

### السيناريو 5️⃣: اختبار الحذف (Delete)

#### ✅ اختبار نجاح: User B يحذف جملته
```http
DELETE http://localhost:3000/api/sentences/{SENTENCE_B_ID}
Authorization: Bearer {USER_B_TOKEN}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "🗑️ تم حذف الجملة بنجاح"
}
```

**Status Code:** `200 OK`

**التحقق:**
- ✅ الجملة محذوفة من قاعدة البيانات
- ✅ لا تظهر في `GET /api/sentences`

#### ❌ اختبار فشل: User B يحاول حذف جملة User A
```http
DELETE http://localhost:3000/api/sentences/{SENTENCE_A_ID}
Authorization: Bearer {USER_B_TOKEN}
```

**النتيجة المتوقعة:**
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

**Status Code:** `403 Forbidden`

**التحقق:**
- ❌ الحذف **لم ينجح**
- ✅ الجملة **لا تزال موجودة**
- ❌ Status Code: `403`

---

### السيناريو 6️⃣: اختبار المراجعة (Review)

#### ✅ اختبار نجاح: User A يراجع جملته
```http
POST http://localhost:3000/api/sentences/{SENTENCE_A_ID}/review
Authorization: Bearer {USER_A_TOKEN}
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
    "_id": "507f1f77bcf86cd799439012",
    "german": "Ich bin Ahmed",
    "arabic": "أنا أحمد المحدث",
    "reviewLevel": "learning",  // ✅ تغير المستوى
    "interval": 1,              // ✅ تحديث الفاصل الزمني
    "reviewCount": 1            // ✅ زاد العداد
  },
  "changes": {
    "intervalChange": "0 → 1 أيام",
    "levelChange": "learning",
    "nextReviewDate": "23/01/2026"
  }
}
```

**Status Code:** `200 OK`

#### ❌ اختبار فشل: User A يحاول مراجعة جملة User B
```http
POST http://localhost:3000/api/sentences/{SENTENCE_B_ID}/review
Authorization: Bearer {USER_A_TOKEN}
Content-Type: application/json

{
  "quality": 3
}
```

**النتيجة المتوقعة:**
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

**Status Code:** `403 Forbidden`

---

## 📊 جدول ملخص الاختبارات

| # | العملية | المستخدم | الجملة | النتيجة المتوقعة | Status Code |
|---|---------|----------|--------|------------------|-------------|
| 1 | GET /sentences | User A | All | ✅ نجاح (جمله + جمل الآخرين) | 200 |
| 2 | GET /sentences?view=my | User A | My | ✅ نجاح (جمله فقط) | 200 |
| 3 | GET /sentences?view=others | User A | Others | ✅ نجاح (جمل الآخرين فقط) | 200 |
| 4 | PUT /sentences/:id | User A | His own | ✅ نجاح | 200 |
| 5 | PUT /sentences/:id | User A | User B's | ❌ فشل | 403 |
| 6 | DELETE /sentences/:id | User B | His own | ✅ نجاح | 200 |
| 7 | DELETE /sentences/:id | User B | User A's | ❌ فشل | 403 |
| 8 | POST /sentences/:id/review | User A | His own | ✅ نجاح | 200 |
| 9 | POST /sentences/:id/review | User A | User B's | ❌ فشل | 403 |

---

## 🎯 Checklist النهائي

### ✅ يجب أن تنجح:
- [x] User A يجلب كل الجمل (جمله + جمل User B)
- [x] User A يجلب جمله فقط (`?view=my`)
- [x] User A يجلب جمل الآخرين فقط (`?view=others`)
- [x] User A يعدل جملته الخاصة
- [x] User B يحذف جملته الخاصة
- [x] User A يراجع جملته الخاصة

### ❌ يجب أن تفشل:
- [x] User A يحاول تعديل جملة User B (403)
- [x] User B يحاول حذف جملة User A (403)
- [x] User A يحاول مراجعة جملة User B (403)

### 📋 التحقق من Response:
- [x] جميع الجمل تحتوي على `isOwner`, `canEdit`, `canDelete`
- [x] `isOwner: true` لجمل المستخدم نفسه
- [x] `isOwner: false` لجمل المستخدمين الآخرين
- [x] رسائل الخطأ واضحة ومفيدة

---

## 🚨 مشاكل شائعة وحلولها

### المشكلة 1: Token منتهي الصلاحية
```json
{
  "success": false,
  "message": "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى"
}
```
**الحل:** سجل دخول جديد واحصل على Token جديد

### المشكلة 2: الحساب غير مفعّل
```json
{
  "success": false,
  "message": "يرجى تفعيل حسابك أولاً"
}
```
**الحل:** فعّل الحساب عبر الإيميل

### المشكلة 3: Token غير موجود
```json
{
  "success": false,
  "message": "غير مصرح. يرجى تسجيل الدخول"
}
```
**الحل:** تأكد من إضافة `Authorization: Bearer {TOKEN}` في Header

---

## 📝 ملاحظات إضافية

1. **استخدم Environment في Postman:**
   ```
   USER_A_TOKEN: {{userAToken}}
   USER_B_TOKEN: {{userBToken}}
   SENTENCE_A_ID: {{sentenceAId}}
   ```

2. **احفظ الـ Collection للمشاركة:**
   - File → Export
   - شارك مع الفريق

3. **استخدم Tests في Postman:**
   ```javascript
   // للتحقق من Status Code
   pm.test("Status is 200", function () {
       pm.response.to.have.status(200);
   });
   
   // للتحقق من Response
   pm.test("Response has isOwner field", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData.sentences[0]).to.have.property('isOwner');
   });
   ```

---

**نجح الاختبار! 🎉**

إذا نجحت جميع الاختبارات، فإن النظام يعمل بشكل صحيح.
