# 🚀 MERN Authentication Starter Template

قالب احترافي وجاهز للاستخدام للمصادقة في مشاريع MERN Stack

## ✨ المميزات

### 🔐 نظام مصادقة كامل
- ✅ تسجيل المستخدمين الجدد
- ✅ تسجيل الدخول
- ✅ تسجيل الخروج
- ✅ التحقق من البريد الإلكتروني
- ✅ نسيت كلمة المرور
- ✅ إعادة تعيين كلمة المرور
- ✅ JWT Access & Refresh Tokens
- ✅ حماية المسارات (Protected Routes)

### 🛡️ الأمان والحماية
- ✅ تشفير كلمات المرور باستخدام bcrypt
- ✅ Helmet.js للحماية من الهجمات الشائعة
- ✅ CORS مهيأ بشكل آمن
- ✅ Rate Limiting لمنع الهجمات
- ✅ Input Validation باستخدام express-validator
- ✅ قفل الحساب بعد محاولات فاشلة متعددة
- ✅ Cookie HttpOnly لتخزين Refresh Token

### 📧 نظام البريد الإلكتروني
- ✅ إرسال رسائل التحقق
- ✅ إرسال روابط إعادة تعيين كلمة المرور
- ✅ دعم Nodemailer و SendGrid

### 📱 Frontend حديث
- ✅ React 19
- ✅ React Router Dom v6
- ✅ Context API لإدارة الحالة
- ✅ تصميم جذاب ومتجاوب
- ✅ تجربة مستخدم سلسة

## 🗂️ هيكل المشروع

```
merna/
├── backend/
│   ├── config/
│   │   ├── config.js          # الإعدادات العامة
│   │   ├── constants.js       # الثوابت
│   │   └── database.js        # اتصال قاعدة البيانات
│   ├── controllers/
│   │   └── authController.js  # التحكم بالمصادقة
│   ├── middleware/
│   │   ├── auth.js            # التحقق من JWT
│   │   ├── errorHandler.js    # معالجة الأخطاء
│   │   └── rateLimiter.js     # تحديد المعدل
│   ├── models/
│   │   └── User.js            # نموذج المستخدم
│   ├── routes/
│   │   └── authRoutes.js      # مسارات المصادقة
│   ├── services/
│   │   └── emailService.js    # خدمة البريد
│   ├── utils/
│   │   ├── generateToken.js   # توليد JWT
│   │   ├── logger.js          # السجلات
│   │   ├── sendEmail.js       # إرسال البريد
│   │   └── validation.js      # التحقق من البيانات
│   ├── .env.example           # مثال لملف البيئة
│   ├── package.json
│   └── server.js              # نقطة البداية
│
└── react/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/          # صفحات المصادقة
    │   │   │   ├── Login.jsx
    │   │   │   ├── Register.jsx
    │   │   │   ├── ForgotPassword.jsx
    │   │   │   ├── ResetPassword.jsx
    │   │   │   ├── VerifyEmail.jsx
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── Dashboard.jsx  # لوحة التحكم
    │   ├── context/
    │   │   └── AuthContext.jsx # سياق المصادقة
    │   ├── services/
    │   │   └── api.js         # Axios instance
    │   ├── App.jsx            # المكون الرئيسي
    │   └── main.jsx           # نقطة الدخول
    ├── package.json
    └── vite.config.js
```

## 🚀 البدء السريع

### المتطلبات الأساسية
- Node.js (v18 أو أحدث)
- MongoDB
- حساب بريد إلكتروني (Gmail أو SendGrid)

### 1️⃣ تثبيت Backend

```bash
cd backend
npm install
```

### 2️⃣ إعداد ملف البيئة

انسخ `.env.example` إلى `.env` وقم بتعبئة البيانات:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/mern-auth

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email (اختر واحد)
# Option 1: Gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Option 2: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### 3️⃣ تشغيل Backend

```bash
# Development
npm run dev

# Production
npm start
```

### 4️⃣ تثبيت Frontend

```bash
cd react
npm install
```

### 5️⃣ تشغيل Frontend

```bash
npm run dev
```

السيرفر سيعمل على `http://localhost:5173`

## 🔧 API Endpoints

### Authentication

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد |
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/logout` | تسجيل الخروج |
| GET | `/api/auth/me` | الحصول على بيانات المستخدم الحالي |
| POST | `/api/auth/refresh-token` | تجديد Access Token |
| POST | `/api/auth/verify-email/:token` | التحقق من البريد الإلكتروني |
| POST | `/api/auth/forgot-password` | طلب إعادة تعيين كلمة المرور |
| POST | `/api/auth/reset-password/:token` | إعادة تعيين كلمة المرور |

## 📝 كيفية الاستخدام

### مثال على التسجيل

```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
```

### مثال على تسجيل الدخول

```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  credentials: 'include', // مهم لإرسال cookies
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'ahmed@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
// data.accessToken سيتم استخدامه في headers
// Refresh token سيكون في httpOnly cookie
```

## 🔒 الأمان

### ميزات الأمان المطبقة:

1. **تشفير كلمات المرور**: bcrypt مع 12 rounds
2. **JWT Tokens**: 
   - Access Token: مدة قصيرة (15 دقيقة)
   - Refresh Token: مدة طويلة (7 أيام) في httpOnly cookie
3. **Rate Limiting**: حد أقصى للطلبات لمنع الهجمات
4. **Input Validation**: التحقق من جميع المدخلات
5. **CORS**: مصادر محددة فقط
6. **Helmet.js**: حماية من الهجمات الشائعة
7. **قفل الحساب**: بعد 5 محاولات فاشلة لمدة 15 دقيقة

## 📧 إعداد البريد الإلكتروني

### خيار 1: Gmail

1. قم بتفعيل 2FA على حسابك
2. أنشئ App Password من [هنا](https://myaccount.google.com/apppasswords)
3. ضع البيانات في `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### خيار 2: SendGrid

1. سجل حساب على [SendGrid](https://sendgrid.com/)
2. احصل على API Key
3. ضع البيانات في `.env`:

```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## 🎨 التخصيص

### تغيير ألوان التصميم

عدل ملف `AuthPage.css` في `react/src/components/Auth/`:

```css
/* تدرج الخلفية الرئيسي */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* لون الأزرار */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### إضافة حقول جديدة للمستخدم

1. عدل `backend/models/User.js`
2. أضف الحقول الجديدة
3. عدل `backend/controllers/authController.js`
4. عدل Frontend forms

## 🧹 تنظيف الملفات القديمة

بعد إعادة الهيكلة، احذف الملفات التالية:

### Backend

```bash
# احذف Controllers غير الضرورية
rm backend/controllers/sentenceController.js
rm backend/controllers/notificationController.js

# احذف Models غير الضرورية
rm backend/models/Sentence.js
rm backend/models/PushSubscription.js

# احذف Routes غير الضرورية
rm backend/routes/sentenceRoutes.js
rm backend/routes/notificationRoutes.js

# احذف Services غير الضرورية
rm backend/services/notificationService.js

# احذف Middleware غير الضرورية
rm backend/middleware/checkOwnership.js

# احذف Utils غير الضرورية
rm backend/utils/cronJobs.js
rm backend/utils/generateVapidKeys.js

# احذف ملفات اختبار
rm backend/srsController.js
rm backend/test-srs.js
rm backend/migrate.js
rm backend/TESTING_IMPROVEMENTS.md
```

### Frontend

```bash
# احذف Components غير الضرورية
rm -rf react/src/components/GermanLearningApp
rm -rf react/src/components/Notifications
rm -rf react/src/components/Statistics
rm react/src/components/Ger.jsx
rm react/src/components/Header.jsx

# احذف Services غير الضرورية
rm react/src/services/sentencesApi.js
rm react/src/services/notificationsApi.js

# احذف ملفات التوثيق القديمة
rm react/FRONTEND_OVERVIEW.md
```

## 🔄 تحديث Dependencies

تأكد من تحديث جميع الحزم:

```bash
# Backend
cd backend
npm update

# Frontend
cd react
npm update
```

## 🚀 النشر (Deployment)

### Backend (Render / Railway / Heroku)

1. أنشئ حساب على المنصة المختارة
2. اربط مستودع Git
3. أضف المتغيرات البيئية
4. انشر!

### Frontend (Netlify / Vercel)

1. قم ببناء المشروع:
```bash
cd react
npm run build
```

2. ارفع مجلد `dist` أو اربط Git repository

### MongoDB (MongoDB Atlas)

1. أنشئ cluster مجاني
2. احصل على connection string
3. ضعه في `MONGODB_URI`

## 📚 التقنيات المستخدمة

### Backend
- Express.js - إطار عمل الويب
- MongoDB & Mongoose - قاعدة البيانات
- JWT - المصادقة
- bcrypt - تشفير كلمات المرور
- Nodemailer/SendGrid - البريد الإلكتروني
- Helmet - الأمان
- express-validator - التحقق من البيانات

### Frontend
- React 19
- React Router Dom v6
- Axios - HTTP client
- Vite - Build tool

## 🤝 المساهمة

المساهمات مرحب بها! افتح issue أو pull request.

## 📄 الترخيص

MIT License - استخدمه بحرية في مشاريعك!

## 👤 المطور

تم تطويره بواسطة Claude & Anthropic

## 🆘 الدعم

إذا واجهت أي مشاكل:
1. تحقق من ملف `.env`
2. تأكد من تشغيل MongoDB
3. تحقق من السجلات (logs)
4. افتح issue على GitHub

---

<div align="center">
  <strong>صُنع بـ ❤️ باستخدام MERN Stack</strong>
</div>
