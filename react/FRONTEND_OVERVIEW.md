# 📚 نظرة عامة على المشروع - Frontend

## 🎯 الوصف
تطبيق لتعلم اللغة الألمانية مع نظام Spaced Repetition System (SRS) باستخدام خوارزمية SM-2. يتيح للمستخدمين إضافة جمل ألمانية مع ترجمتها العربية، ومراجعتها بشكل ذكي بناءً على أدائهم.

---

## 🏗️ البنية الأساسية للمشروع

```
react/src/
├── components/              # المكونات الرئيسية
│   ├── Auth/               # مكونات المصادقة
│   │   ├── AuthPage.jsx    # صفحة المصادقة الرئيسية
│   │   ├── Login.jsx       # تسجيل الدخول
│   │   ├── Register.jsx    # إنشاء حساب
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── VerifyEmail.jsx
│   │   └── ProtectedRoute.jsx  # حماية الصفحات
│   │
│   ├── GermanLearningApp/  # التطبيق الرئيسي
│   │   ├── AddSentenceForm.jsx      # إضافة جملة جديدة
│   │   ├── FilterButtons.jsx        # أزرار التصفية
│   │   ├── SentenceItem.jsx         # عرض جملة واحدة
│   │   ├── SentencesList.jsx        # قائمة الجمل
│   │   └── Flashcard/              # نظام البطاقات
│   │       ├── FlashcardViewNew.jsx  # عرض البطاقات (محدّث)
│   │       ├── CelebrationEffects.jsx
│   │       └── MotivationalMessages.jsx
│   │
│   ├── Statistics/         # الإحصائيات
│   │   ├── StatsMinimal.jsx  # إحصائيات مبسطة (محدّث)
│   │   └── StatsDashboard.jsx
│   │
│   ├── Header.jsx          # الهيدر
│   └── Ger.jsx            # المكون الرئيسي (محدّث)
│
├── services/               # خدمات API
│   ├── api.js             # Axios instance + interceptors
│   └── sentencesApi.js    # 🆕 دوال API للجمل
│
├── context/
│   └── AuthContext.jsx    # إدارة حالة المصادقة
│
├── utils/                 # دوال مساعدة
│   ├── apiHelper.js       # معالجة أخطاء API (محدّث)
│   ├── srsUtils.js        # 🆕 خوارزمية SM-2 (متطابق مع Backend)
│   ├── srs.js            # ⚠️ قديم (deprecated)
│   └── api.js            # ⚠️ قديم (deprecated)
│
├── App.jsx                # المسارات الرئيسية
└── main.jsx              # نقطة الدخول
```

---

## 🔑 المكونات الرئيسية

### 1️⃣ **المصادقة (Authentication)**

#### `AuthContext.jsx`
- **الدور**: إدارة حالة المصادقة عبر التطبيق
- **الوظائف**:
  - `register(userData)` - تسجيل مستخدم جديد
  - `login(credentials)` - تسجيل الدخول
  - `logout()` - تسجيل الخروج
  - `verifyEmail(token)` - تفعيل الحساب
  - `forgotPassword(email)` - نسيت كلمة المرور
  - `resetPassword(token, password)` - إعادة تعيين كلمة المرور
  - `checkAuth()` - التحقق من الجلسة عند تحميل التطبيق

#### `ProtectedRoute.jsx`
- **الدور**: حماية المسارات التي تحتاج مصادقة
- **الآلية**: إعادة توجيه المستخدم غير المسجل لصفحة Login

---

### 2️⃣ **التطبيق الرئيسي (Ger.jsx)**

#### الوظائف الأساسية:
```javascript
// جلب الجمل من Backend
fetchSentences() // استخدام getMySentences() من sentencesApi

// إضافة جملة جديدة
addSentence() // استخدام createSentence()

// تعديل جملة
updateSentenceHandler(id, updates) // استخدام updateSentence()

// حذف جملة
deleteSentenceHandler(id) // استخدام deleteSentence()
```

#### الحالة (State):
- `sentences` - قائمة الجمل
- `flashcardMode` - وضع البطاقات
- `loading` - حالة التحميل
- `error` - رسائل الأخطاء
- `editingId` - الجملة قيد التعديل

---

### 3️⃣ **نظام البطاقات (FlashcardViewNew.jsx)**

#### التحديثات الرئيسية:
✅ **إزالة الاعتماد على `/progress/:id`** - كان endpoint غير موجود
✅ **جلب الجمل المستحقة مباشرة** - استخدام `getDueSentences()` من API
✅ **مراجعة البطاقات** - استخدام `reviewSentence(id, quality)`

#### تدفق العمل:
```
1. جلب الجمل المستحقة من Backend (GET /sentences/due)
2. عرض البطاقة الحالية
3. المستخدم يقلب البطاقة ويراجعها (0-3)
4. إرسال التقييم للـ Backend (POST /sentences/:id/review)
5. Backend يحسب الحالة الجديدة بـ SM-2
6. حذف البطاقة من القائمة المحلية
7. الانتقال للبطاقة التالية
```

#### مستويات التقييم:
- **0 (Again)**: نسيت تماماً - إعادة تعلم
- **1 (Hard)**: صعب - مراجعة قريبة
- **2 (Good)**: جيد - مراجعة عادية
- **3 (Excellent)**: ممتاز - مراجعة بعيدة

---

### 4️⃣ **الإحصائيات (StatsMinimal.jsx)**

#### التحديثات:
✅ **جلب البيانات من Backend** - استخدام `getStats()` من API
✅ **عرض إحصائيات دقيقة**:
- `due` - الجمل المستحقة للمراجعة اليوم
- `total` - إجمالي الجمل
- `masteryPercentage` - نسبة الإتقان
- `streak` - الأيام المتتالية (من localStorage مؤقتاً)

---

## 🔗 خدمات API

### `services/api.js` (Axios Instance)

#### الميزات:
✅ **Access Token في Header**
✅ **Refresh Token تلقائياً** عند انتهاء صلاحية Access Token
✅ **Error Handling** مع إعادة المحاولة
✅ **CORS Support** مع `withCredentials: true`

#### Interceptors:
```javascript
// Request Interceptor
- إضافة Access Token للـ headers

// Response Interceptor
- معالجة 401 (Unauthorized)
- محاولة تجديد Access Token
- إعادة إرسال الطلب الفاشل
- إعادة توجيه للـ Login عند الفشل
```

---

### `services/sentencesApi.js` (🆕 جديد)

#### الدوال المتاحة:

```javascript
// جلب جميع الجمل مع pagination
getSentences(params)
// params: { page, limit, level, favorite, due, sort }

// جلب جمل المستخدم فقط
getMySentences(params)

// جلب الجمل المستحقة للمراجعة
getDueSentences(limit = 20)

// إضافة جملة جديدة
createSentence(german, arabic)

// مراجعة جملة بنظام SM-2
reviewSentence(id, quality)
// quality: 0-3

// تعديل جملة
updateSentence(id, updates)

// حذف جملة
deleteSentence(id)

// إعادة تعيين جميع الجمل
resetSentences()

// جلب الإحصائيات
getStats()
```

---

## 🧠 نظام SM-2 (Spaced Repetition)

### `utils/srsUtils.js` (🆕 محدّث)

#### الثوابت (متطابقة مع Backend):
```javascript
SM2_CONSTANTS = {
  DEFAULT_INTERVAL: 0,
  DEFAULT_EASE_FACTOR: 2.5,
  DEFAULT_REPETITIONS: 0,
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 3.0,
  MAX_INTERVAL_DAYS: 365,
  MIN_INTERVAL_DAYS: 1,
  IMMEDIATE_REVIEW_MINUTES: 10
}
```

#### مستويات المراجعة:
```javascript
REVIEW_LEVELS = {
  NEW: { threshold: 0, emoji: '🆕', color: '#6366f1' },
  LEARNING: { threshold: 1, emoji: '📚', color: '#8b5cf6' },
  HARD: { threshold: 4, emoji: '😅', color: '#f59e0b' },
  GOOD: { threshold: 10, emoji: '👍', color: '#10b981' },
  EXCELLENT: { threshold: 30, emoji: '⭐', color: '#3b82f6' },
  MASTERED: { threshold: 365, emoji: '🏆', color: '#ef4444' }
}
```

#### دوال رئيسية:
```javascript
// حساب الحالة الجديدة (نفس منطق Backend)
calculateNextState(sentence, quality)

// حساب الفترة القادمة
calculateNextInterval(currentInterval, currentEaseFactor, quality)

// تحديد مستوى المراجعة
getLevelDetails(interval)

// تصفية الجمل المستحقة
getDueSentences(sentences)

// تنسيق الفترة الزمنية
formatInterval(days) // "يوم واحد", "3 أيام", "شهر"

// تنسيق التاريخ
formatDate(date) // "اليوم", "غداً", "بعد 3 أيام"

// رسائل تحفيزية
getMotivationalMessage(quality, streak)
```

---

## 🔄 تدفق البيانات (Data Flow)

### 1️⃣ **تسجيل الدخول**
```
Login.jsx 
  → AuthContext.login()
  → POST /api/auth/login
  → تخزين Access Token في memory
  → تخزين Refresh Token في HTTP-only cookie
  → حفظ بيانات User في Context
  → إعادة توجيه لـ "/"
```

### 2️⃣ **جلب الجمل**
```
Ger.jsx (useEffect)
  → sentencesApi.getMySentences()
  → GET /api/sentences/my-sentences
  → معالجة Pagination
  → حفظ في State: sentences
```

### 3️⃣ **إضافة جملة**
```
AddSentenceForm
  → Ger.jsx.addSentence()
  → sentencesApi.createSentence(german, arabic)
  → POST /api/sentences
  → Backend: validation, duplicate check
  → إضافة للقائمة المحلية
```

### 4️⃣ **مراجعة البطاقة**
```
FlashcardView
  → جلب الجمل المستحقة (GET /sentences/due)
  → عرض البطاقة
  → المستخدم يقيّم (0-3)
  → sentencesApi.reviewSentence(id, quality)
  → POST /api/sentences/:id/review
  → Backend: SM-2 calculation
  → Backend: تحديث interval, easeFactor, nextReview
  → إزالة من القائمة المحلية
  → الانتقال للبطاقة التالية
```

### 5️⃣ **تحديث/حذف جملة**
```
SentenceItem
  → Ger.jsx.updateSentenceHandler() / deleteSentenceHandler()
  → sentencesApi.updateSentence() / deleteSentence()
  → PUT/DELETE /api/sentences/:id
  → Backend: checkOwnership middleware
  → تحديث/حذف من القائمة المحلية
```

---

## 🔐 المصادقة والأمان

### Token Management
- **Access Token**: مخزن في memory (متغير JavaScript)
  - مدة الصلاحية: 15 دقيقة
  - يُرسل في Authorization header

- **Refresh Token**: مخزن في HTTP-only cookie
  - مدة الصلاحية: 7 أيام
  - يُستخدم لتجديد Access Token تلقائياً

### Protected Routes
```javascript
<Route path="/" element={
  <ProtectedRoute>
    <GermanLearningApp />
  </ProtectedRoute>
} />
```

### Authorization
- **checkOwnership middleware** في Backend:
  - المستخدم يمكنه فقط تعديل/حذف جمله
  - لكن يمكنه مراجعة أي جملة (ينشئ نسخة خاصة)

---

## 📡 API Endpoints المستخدمة

### Authentication
```
POST   /api/auth/register          - تسجيل مستخدم جديد
GET    /api/auth/verify-email/:token - تفعيل الحساب
POST   /api/auth/login             - تسجيل الدخول
POST   /api/auth/refresh-token     - تجديد Access Token
POST   /api/auth/logout            - تسجيل الخروج
GET    /api/auth/me                - بيانات المستخدم الحالي
POST   /api/auth/forgot-password   - نسيت كلمة المرور
PUT    /api/auth/reset-password/:token - إعادة تعيين كلمة المرور
```

### Sentences
```
GET    /api/sentences              - جميع الجمل (مع pagination)
GET    /api/sentences/my-sentences - جمل المستخدم فقط
GET    /api/sentences/due          - الجمل المستحقة للمراجعة
POST   /api/sentences              - إضافة جملة جديدة
POST   /api/sentences/:id/review   - مراجعة جملة (SM-2)
PUT    /api/sentences/:id          - تعديل جملة (owner only)
DELETE /api/sentences/:id          - حذف جملة (owner only)
POST   /api/sentences/reset        - إعادة تعيين جميع الجمل
```

### Statistics
```
GET    /api/sentences/stats        - الإحصائيات الكاملة
```

---

## 🎨 معالجة الأخطاء

### Frontend Error Handling

```javascript
try {
  const response = await sentencesApi.createSentence(german, arabic);
  // Success
} catch (err) {
  // معالجة الأخطاء حسب status code
  if (err.response?.status === 400) {
    // Validation error
  } else if (err.response?.status === 401) {
    // Unauthorized
  } else if (err.response?.status === 403) {
    // Forbidden
  } else if (err.response?.status === 404) {
    // Not found
  } else {
    // Generic error
  }
}
```

### `apiHelper.js` - معالج الأخطاء الموحد
```javascript
const errorInfo = handleApiError(error);
// {
//   status: 400,
//   message: "رسالة الخطأ",
//   errors: { ... },
//   data: { ... }
// }
```

---

## ⚡ التحسينات المطبقة

### ✅ إصلاح المشاكل:
1. **إزالة `/progress/:id` endpoint** - كان غير موجود في Backend
2. **توحيد API calls** - استخدام `sentencesApi.js` فقط
3. **تطابق SM-2 logic** - Frontend يستخدم نفس الثوابت والحسابات
4. **جلب البيانات الحقيقية** - Stats من Backend API
5. **معالجة أخطاء أفضل** - رسائل واضحة حسب status code

### ✅ تحسينات الأداء:
1. **Lazy Loading** - تحميل المكونات عند الحاجة
2. **Memoization** - استخدام `useMemo` و `useCallback`
3. **Pagination** - تحميل الجمل بشكل تدريجي
4. **Debouncing** - تأخير الطلبات المتكررة

### ✅ تحسينات UX:
1. **Loading states** - مؤشرات تحميل واضحة
2. **Error messages** - رسائل خطأ مفهومة بالعربية
3. **Confirmation dialogs** - تأكيد قبل الحذف
4. **Motivational messages** - رسائل تحفيزية بعد المراجعة
5. **Streak counter** - عداد الأيام المتتالية

---

## 🚀 كيفية البدء

### 1. تشغيل Backend
```bash
cd backend
npm install
npm run dev
```

### 2. تشغيل Frontend
```bash
cd react
npm install
npm run dev
```

### 3. المتغيرات البيئية
تأكد من تعيين:
```javascript
// في src/services/api.js
const API_URL = 'http://localhost:3000/api';
```

---

## 📝 ملاحظات مهمة

### ⚠️ Deprecated Files
الملفات التالية **لم تعد مستخدمة**:
- `utils/api.js` ❌ استخدم `services/sentencesApi.js` ✅
- `utils/srs.js` ❌ استخدم `utils/srsUtils.js` ✅

### 🔧 Future Improvements
1. **Pagination UI** - أزرار next/previous للجمل
2. **Search & Filter** - بحث وتصفية متقدم
3. **Statistics Dashboard** - لوحة إحصائيات مفصلة
4. **Export/Import** - تصدير/استيراد الجمل
5. **Audio Support** - نطق الجمل
6. **Dark Mode** - وضع ليلي
7. **PWA** - دعم التطبيق التدريجي
8. **Offline Mode** - العمل بدون إنترنت

---

## 🏆 الميزات الأساسية

✅ **نظام SM-2 الكامل** - خوارزمية ذكية للمراجعة
✅ **مصادقة آمنة** - JWT + Refresh Token
✅ **إحصائيات دقيقة** - من Backend مباشرة
✅ **UI سهل الاستخدام** - بالعربية بالكامل
✅ **معالجة أخطاء متقدمة** - رسائل واضحة ومفهومة
✅ **Performance Optimized** - سرعة وكفاءة عالية

---

## 📞 الدعم
للأسئلة أو المشاكل، يرجى مراجعة:
- Backend API Documentation
- React Developer Tools
- Console Logs

---

**آخر تحديث**: ${new Date().toLocaleDateString('ar-EG')}
**النسخة**: 2.0.0
