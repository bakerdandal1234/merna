# 🎓 Merna - German Learning App مع Authentication

نظام تعلم اللغة الألمانية مع SM-2 Algorithm + نظام Authentication احترافي كامل!

---

## 📋 المميزات

### 🔐 Authentication System
- ✅ **Register** - تسجيل مستخدم جديد مع password hashing
- ✅ **Email Verification** - تفعيل الحساب عبر الإيميل
- ✅ **Login** - JWT Access + Refresh Tokens
- ✅ **Auto Refresh** - تجديد تلقائي للـ tokens
- ✅ **Logout** - تسجيل خروج آمن
- ✅ **Forgot Password** - إعادة تعيين عبر الإيميل
- ✅ **Reset Password** - تغيير الباسورد بأمان
- ✅ **Protected Routes** - حماية الصفحات
- ✅ **Rate Limiting** - حماية من Brute Force
- ✅ **HttpOnly Cookies** - حماية من XSS

### 🧠 SM-2 Spaced Repetition
- ✅ نظام مراجعة ذكي للجمل
- ✅ حساب الفاصل الزمني للمراجعة
- ✅ مستويات تقدم (New → Mastered)
- ✅ إحصائيات شاملة

---

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية

- Node.js (v16+)
- MongoDB (محلي أو Atlas)
- Gmail Account (لإرسال Emails)

---

### 1️⃣ Backend Setup

```bash
cd backend

# تثبيت Dependencies
npm install

# إعداد Environment Variables
# عدّل ملف .env:
# - أضف MongoDB URI
# - أضف Gmail credentials للـ Email
# - غيّر JWT secrets
```

#### إعداد Gmail للـ Emails

1. اذهب لـ [Google Account Settings](https://myaccount.google.com)
2. Security → 2-Step Verification (فعّلها)
3. App Passwords → Create new
4. اختر "Mail" و "Other"
5. انسخ الباسورد المُنشأ
6. ضعه في `.env` → `EMAIL_PASSWORD`

#### تشغيل Backend

```bash
# Development mode
npm run dev

# Production mode
npm start
```

يجب أن ترى:
```
✅ MongoDB Connected
🚀 Server Running on Port 3000
🔐 Authentication: Enabled
```

---

### 2️⃣ Frontend Setup

```bash
cd ../react

# تثبيت Dependencies
npm install

# تشغيل Development Server
npm run dev
```

يجب أن يفتح على: `http://localhost:5173`

---

## 🎯 الاستخدام

### 1. تسجيل حساب جديد

1. افتح `http://localhost:5173/register`
2. املأ البيانات (اسم، إيميل، باسورد قوي)
3. اضغط "تسجيل"
4. **مهم**: تحقق من صندوق الوارد للإيميل

### 2. تفعيل الحساب

1. افتح إيميل "تفعيل حساب Merna"
2. اضغط "تفعيل الحساب"
3. يجب أن ترى رسالة نجاح

### 3. تسجيل الدخول

1. ارجع لـ `http://localhost:5173/login`
2. أدخل الإيميل والباسورد
3. اضغط "دخول"
4. **تلقائياً**: ستُنقل للتطبيق الرئيسي!

### 4. استخدام التطبيق

الآن يمكنك:
- ✅ إضافة جمل ألمانية
- ✅ مراجعتها بنظام SM-2
- ✅ متابعة تقدمك
- ✅ كل المعلومات خاصة بك فقط!

---

## 🔒 الأمان

النظام يستخدم:

1. **bcrypt** - لتشفير الباسوردات (12 rounds)
2. **JWT** - Access Token (15 دقيقة) + Refresh Token (7 أيام)
3. **HttpOnly Cookies** - لحفظ Refresh Token بأمان
4. **Rate Limiting** - 5 محاولات كل 15 دقيقة
5. **Email Verification** - منع الحسابات المزيفة
6. **Password Strength** - حرف كبير + صغير + رقم + رمز
7. **CORS** - السماح للـ Frontend فقط
8. **Helmet** - حماية HTTP headers

---

## 📝 ملاحظات مهمة

### Gmail App Password

⚠️ **لا تستخدم باسورد Gmail العادي!**

- يجب إنشاء **App Password** كما شرحنا أعلاه
- Gmail العادي لن يعمل لأسباب أمنية

### Environment Variables

تأكد من تحديث `.env` في Backend:

```env
# CRITICAL - غيّر هذه القيم!
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
JWT_ACCESS_SECRET=your-super-secret-key-1
JWT_REFRESH_SECRET=your-super-secret-key-2
```

### MongoDB

إذا لم يكن لديك MongoDB محلي:
1. أنشئ حساب مجاني على [MongoDB Atlas](https://cloud.mongodb.com)
2. احصل على Connection String
3. ضعه في `MONGODB_URI`

---

## 🧪 اختبار النظام

### اختبار بـ cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد",
    "email": "ahmed@test.com",
    "password": "Test@1234"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@test.com",
    "password": "Test@1234"
  }'
```

---

## 🐛 Troubleshooting

### المشكلة: الإيميلات لا تُرسل

**الحلول**:
1. تحقق من App Password (16 حرف)
2. تأكد من 2FA مفعّل في Google
3. تحقق من `EMAIL_USER` و `EMAIL_PASSWORD` في `.env`

### المشكلة: MongoDB Connection Failed

**الحلول**:
1. تأكد من MongoDB يعمل: `mongod`
2. تحقق من Connection String في `.env`
3. إذا Atlas: تأكد من IP مسموح

### المشكلة: CORS Error

**الحل**:
- تأكد من `FRONTEND_URL` في Backend `.env` = `http://localhost:5173`

---

## 📂 هيكل المشروع

```
merna/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js               # JWT protection
│   │   └── rateLimiter.js        # Rate limiting
│   ├── models/
│   │   └── User.js               # User schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── ...
│   ├── utils/
│   │   ├── generateToken.js      # JWT helpers
│   │   └── sendEmail.js          # Email service
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main entry
│   └── package.json
│
└── react/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   ├── Register.jsx
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── Ger.jsx           # Main app
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state
    │   ├── services/
    │   │   └── api.js            # Axios config
    │   └── App.jsx
    └── package.json
```

---

## 🎓 تعلمت في هذا المشروع

- ✅ JWT Authentication الكامل
- ✅ Refresh Token Rotation
- ✅ Email Verification
- ✅ Password Reset Flow
- ✅ HttpOnly Cookies Security
- ✅ Rate Limiting
- ✅ React Context API
- ✅ Axios Interceptors
- ✅ Protected Routes
- ✅ SM-2 Algorithm

---

## 🚀 Next Steps

- [ ] Two-Factor Authentication (2FA)
- [ ] OAuth (Google/Facebook Login)
- [ ] Admin Dashboard
- [ ] Email Templates أفضل
- [ ] Testing (Jest/Cypress)

---

## 📧 الدعم

إذا واجهت مشاكل:
1. تحقق من Console للأخطاء
2. راجع Network Tab في DevTools
3. تأكد من Environment Variables

---

**بالتوفيق في التعلم! 🎉**
