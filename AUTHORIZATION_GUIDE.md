# 🔐 نظام التحكم بالصلاحيات (Authorization System)

## 📋 جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [الملفات المعدلة](#الملفات-المعدلة)
3. [كيف يعمل النظام](#كيف-يعمل-النظام)
4. [أمثلة استخدام API](#أمثلة-استخدام-api)
5. [جدول الصلاحيات](#جدول-الصلاحيات)
6. [الاختبار](#الاختبار)

---

## 📖 نظرة عامة

تم تحديث نظام الصلاحيات ليحقق الآتي:

### ✅ المستخدم يستطيع:
- **إضافة (Create)** جمل جديدة لحسابه
- **قراءة (Read)** جميع الجمل (جمله + جمل المستخدمين الآخرين)
- **تعديل (Update)** الجمل التي أضافها فقط
- **حذف (Delete)** الجمل التي أضافها فقط
- **مراجعة (Review)** الجمل التي أضافها فقط

### ❌ المستخدم لا يستطيع:
- تعديل أو حذف جمل المستخدمين الآخرين
- مراجعة جمل المستخدمين الآخرين

---

## 📁 الملفات المعدلة

### 1. **middleware/checkOwnership.js** (ملف جديد)
```
backend/
  └── middleware/
      ├── auth.js (موجود مسبقاً)
      ├── rateLimiter.js (موجود مسبقاً)
      └── checkOwnership.js ⭐ (جديد)
```

**الوظيفة:**
- التحقق من أن المستخدم يملك الجملة قبل السماح بالتعديل/الحذف/المراجعة
- يُستخدم قبل عمليات UPDATE, DELETE, REVIEW

### 2. **server.js** (تم تحديثه)
```
backend/
  ├── server.js ✏️ (محدّث)
  └── server_updated.js ⭐ (نسخة جديدة للمقارنة)
```

**التحديثات:**
- إضافة `checkSentenceOwnership` middleware
- تحديث Routes لتطبيق الصلاحيات
- إضافة query parameter `?view=` لفلترة الجمل

---

## 🔧 كيف يعمل النظام

### 1️⃣ **نظام المصادقة (Authentication)**
```
User → Login → JWT Token → Stored in localStorage
```

عند كل طلب:
```javascript
// في Frontend
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 2️⃣ **Middleware Flow**

#### أ) للعمليات العامة (Read, Create):
```
Request → protect middleware → Controller → Response
```

**protect middleware** تتحقق من:
- وجود Token صحيح
- المستخدم موجود في قاعدة البيانات
- الحساب مفعّل (isVerified)
- تحفظ بيانات المستخدم في `req.user`

#### ب) للعمليات الحساسة (Update, Delete, Review):
```
Request → protect middleware → checkSentenceOwnership → Controller → Response
```

**checkSentenceOwnership middleware** تتحقق من:
- الجملة موجودة في قاعدة البيانات
- `sentence.userId` يساوي `req.user.id`
- إذا لم يكن المستخدم هو المالك → ترجع خطأ 403 Forbidden

---

## 🌐 أمثلة استخدام API

### 1. **جلب جميع الجمل (للمستخدم وللآخرين)**

#### أ) جلب جميع الجمل:
```http
GET /api/sentences
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 150,
  "sentences": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "german": "Guten Morgen",
      "arabic": "صباح الخير",
      "userId": "507f1f77bcf86cd799439012",
      "isOwner": true,      // ✅ جملة المستخدم
      "canEdit": true,       // ✅ يمكن التعديل
      "canDelete": true,     // ✅ يمكن الحذف
      "stats": { ... }
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "german": "Wie geht es dir?",
      "arabic": "كيف حالك؟",
      "userId": "507f1f77bcf86cd799439014",
      "isOwner": false,     // ❌ جملة مستخدم آخر
      "canEdit": false,      // ❌ لا يمكن التعديل
      "canDelete": false,    // ❌ لا يمكن الحذف
      "stats": { ... }
    }
  ]
}
```

#### ب) جلب جمل المستخدم فقط:
```http
GET /api/sentences?view=my
Authorization: Bearer YOUR_TOKEN
```

#### ج) جلب جمل المستخدمين الآخرين فقط:
```http
GET /api/sentences?view=others
Authorization: Bearer YOUR_TOKEN
```

---

### 2. **إضافة جملة جديدة**

```http
POST /api/sentences
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "german": "Ich lerne Deutsch",
  "arabic": "أنا أتعلم الألمانية"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "✅ تم إضافة الجملة بنجاح",
  "sentence": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439012",
    "german": "Ich lerne Deutsch",
    "arabic": "أنا أتعلم الألمانية",
    "reviewLevel": "new",
    "stats": { ... }
  }
}
```

---

### 3. **تعديل جملة (للمالك فقط)**

#### أ) تعديل جملة تملكها:
```http
PUT /api/sentences/507f1f77bcf86cd799439015
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "arabic": "أنا أتعلم اللغة الألمانية"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "✅ تم تعديل الجملة بنجاح",
  "sentence": { ... }
}
```

#### ب) محاولة تعديل جملة لمستخدم آخر:
```http
PUT /api/sentences/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_TOKEN
```

**Response (Error):**
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```
**Status Code:** `403 Forbidden`

---

### 4. **حذف جملة (للمالك فقط)**

#### أ) حذف جملة تملكها:
```http
DELETE /api/sentences/507f1f77bcf86cd799439015
Authorization: Bearer YOUR_TOKEN
```

**Response (Success):**
```json
{
  "success": true,
  "message": "🗑️ تم حذف الجملة بنجاح"
}
```

#### ب) محاولة حذف جملة لمستخدم آخر:
```http
DELETE /api/sentences/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_TOKEN
```

**Response (Error):**
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```
**Status Code:** `403 Forbidden`

---

### 5. **مراجعة جملة (للمالك فقط)**

```http
POST /api/sentences/507f1f77bcf86cd799439015/review
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "quality": 3
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "✅ تم تحديث البطاقة بنجاح",
  "sentence": { ... },
  "changes": {
    "intervalChange": "1 → 6 أيام",
    "levelChange": "learning",
    "nextReviewDate": "28/01/2026"
  }
}
```

---

## 📊 جدول الصلاحيات

| العملية | جملة المستخدم | جملة مستخدم آخر | Middleware المستخدم |
|---------|---------------|-----------------|---------------------|
| **GET /api/sentences** | ✅ يمكن القراءة | ✅ يمكن القراءة (عرض فقط) | `protect` |
| **GET /api/sentences/:id** | ✅ يمكن القراءة | ✅ يمكن القراءة (عرض فقط) | `protect` |
| **POST /api/sentences** | ✅ يمكن الإضافة | - | `protect` |
| **PUT /api/sentences/:id** | ✅ يمكن التعديل | ❌ ممنوع (403) | `protect` + `checkOwnership` |
| **DELETE /api/sentences/:id** | ✅ يمكن الحذف | ❌ ممنوع (403) | `protect` + `checkOwnership` |
| **POST /api/sentences/:id/review** | ✅ يمكن المراجعة | ❌ ممنوع (403) | `protect` + `checkOwnership` |

---

## 🧪 الاختبار

### 1. باستخدام Postman/Insomnia:

#### السيناريو 1: جلب كل الجمل
```
1. سجل دخول المستخدم الأول (User A)
2. GET /api/sentences
3. لاحظ: ستظهر جمل User A بـ isOwner: true
4. لاحظ: ستظهر جمل المستخدمين الآخرين بـ isOwner: false
```

#### السيناريو 2: محاولة تعديل جملة لمستخدم آخر
```
1. سجل دخول المستخدم الأول (User A)
2. احصل على ID جملة تخص User B
3. PUT /api/sentences/{ID_OF_USER_B_SENTENCE}
4. النتيجة المتوقعة: 403 Forbidden
5. الرسالة: "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
```

#### السيناريو 3: تعديل جملتك الخاصة
```
1. سجل دخول المستخدم الأول (User A)
2. احصل على ID جملة تخص User A
3. PUT /api/sentences/{ID_OF_USER_A_SENTENCE}
4. النتيجة المتوقعة: 200 OK
5. الرسالة: "✅ تم تعديل الجملة بنجاح"
```

### 2. باستخدام Frontend:

في React/Vue/Angular، استخدم الحقول `isOwner`, `canEdit`, `canDelete`:

```javascript
// مثال React
function SentenceCard({ sentence }) {
  return (
    <div className="sentence-card">
      <h3>{sentence.german}</h3>
      <p>{sentence.arabic}</p>
      
      {/* عرض الأزرار فقط للمالك */}
      {sentence.isOwner && (
        <div className="actions">
          {sentence.canEdit && (
            <button onClick={() => editSentence(sentence._id)}>
              ✏️ تعديل
            </button>
          )}
          
          {sentence.canDelete && (
            <button onClick={() => deleteSentence(sentence._id)}>
              🗑️ حذف
            </button>
          )}
          
          <button onClick={() => reviewSentence(sentence._id)}>
            📝 مراجعة
          </button>
        </div>
      )}
      
      {/* رسالة للجمل غير المملوكة */}
      {!sentence.isOwner && (
        <p className="not-owner-message">
          📖 جملة من مستخدم آخر (للعرض فقط)
        </p>
      )}
    </div>
  );
}
```

---

## 🔐 كيفية التطبيق

### الخطوة 1: استبدال server.js
```bash
# نسخ احتياطية
cp backend/server.js backend/server_backup.js

# استبدال بالملف الجديد
cp backend/server_updated.js backend/server.js
```

### الخطوة 2: التأكد من الـ Middleware
```bash
# التأكد من وجود الملف
ls backend/middleware/checkOwnership.js
```

### الخطوة 3: إعادة تشغيل السيرفر
```bash
cd backend
npm start
```

### الخطوة 4: اختبار الصلاحيات
```bash
# استخدم Postman أو curl للاختبار
curl -X GET http://localhost:3000/api/sentences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 الخلاصة

### ما تم تحديثه:
1. ✅ **Middleware جديد**: `checkOwnership.js` للتحقق من الملكية
2. ✅ **Routes محدّثة**: إضافة protection للعمليات الحساسة
3. ✅ **Query Parameter**: `?view=my|all|others` لفلترة الجمل
4. ✅ **Response Fields**: إضافة `isOwner`, `canEdit`, `canDelete`

### النتيجة النهائية:
- 🔒 **الأمان**: كل مستخدم يتحكم بجمله فقط
- 👀 **الشفافية**: يمكن رؤية جمل الآخرين للتعلم
- 🚫 **الحماية**: لا يمكن تعديل/حذف جمل الآخرين
- ✅ **User Experience**: Frontend يعرف الصلاحيات ويخفي الأزرار غير المتاحة

---

## 📞 ملاحظات إضافية

### إذا كنت تريد ميزات إضافية:

#### 1. السماح بـ "التصويت" على جمل الآخرين:
```javascript
// يمكن إضافة endpoint جديد
POST /api/sentences/:id/like
```

#### 2. السماح بـ "التعليقات" على جمل الآخرين:
```javascript
POST /api/sentences/:id/comments
```

#### 3. إضافة نظام "المشاركة" (Sharing):
```javascript
// السماح للمستخدم بمشاركة جملة معينة مع مستخدمين آخرين
POST /api/sentences/:id/share
```

---

**تم بنجاح! 🎉**

الآن مشروعك محمي بالكامل مع نظام صلاحيات واضح ومنظم.
