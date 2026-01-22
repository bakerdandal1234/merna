# 📧 دليل إعداد Brevo (Sendinblue) - سهل جداً!

## لماذا Brevo؟

- ✅ **300 email/day مجاناً** (أكثر من SendGrid!)
- ✅ سهل التسجيل (لا يحتاج domain)
- ✅ يعمل على Render بدون مشاكل
- ✅ SMTP بسيط

---

## الخطوة 1: إنشاء حساب (دقيقتين)

### 1. اذهب للموقع

```
https://app.brevo.com/account/register
```

### 2. املأ البيانات

```
✅ Email: أي إيميل (مثلاً bakerdandal4@gmail.com)
✅ Password: باسورد قوي
✅ اختر: "I'm a developer"
```

### 3. Verify Email

```
→ افتح إيميلك
→ اضغط "Verify my account"
→ تم! ✅
```

---

## الخطوة 2: الحصول على SMTP Key (دقيقة واحدة)

### 1. اذهب لـ SMTP Settings

```
Dashboard
→ Settings (أعلى اليمين)
→ SMTP & API
```

### 2. إنشاء SMTP Key

```
→ SMTP Keys (في القائمة)
→ Generate a new SMTP key
→ اسم الـ Key: "Merna Production"
→ Create
```

### 3. انسخ المعلومات

ستظهر لك:

```
SMTP Server: smtp-relay.brevo.com
Port: 587
Login: your-email@gmail.com
Password: xsmtpsib-xxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ انسخ الـ Password (SMTP Key) فوراً!**

---

## الخطوة 3: تحديث .env

افتح `backend/.env`:

```env
# Brevo SMTP
BREVO_SMTP_USER=bakerdandal4@gmail.com
BREVO_SMTP_KEY=xsmtpsib-paste-your-key-here
EMAIL_FROM_NAME=Merna App
```

---

## الخطوة 4: اختبار

```bash
cd backend
npm run dev
```

سجّل مستخدم جديد، يجب أن ترى:

```
📧 Attempting to send via Brevo (Sendinblue)...
✅ Email sent successfully via Brevo
📬 To: user@example.com
```

---

## على Render

أضف في Environment Variables:

```
BREVO_SMTP_USER=bakerdandal4@gmail.com
BREVO_SMTP_KEY=xsmtpsib-your-key
EMAIL_FROM_NAME=Merna App
NODE_ENV=production
```

---

## التحقق من نجاح الإرسال

### 1. Brevo Dashboard

```
Statistics → Email
→ شاهد الإيميلات المرسلة
```

### 2. Render Logs

```
✅ Email sent successfully via Brevo
```

---

## مقارنة سريعة

| الميزة | Brevo | SendGrid |
|--------|-------|----------|
| Free emails | **300/day** | 100/day |
| سهولة التسجيل | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| يحتاج Domain | ❌ لا | ✅ نعم (للأفضل) |
| SMTP Port | 587 | 465/587 |

---

## Troubleshooting

### مشكلة: Invalid credentials

```
❌ Error: Invalid login or password
```

**الحل**:
1. تأكد من نسخ SMTP Key بالكامل
2. تأكد من Login = الإيميل الذي سجلت به
3. جرّب إنشاء SMTP Key جديد

### مشكلة: لا يصل الإيميل

**الحل**:
1. تحقق من Brevo Dashboard → Statistics
2. تحقق من Spam folder
3. تأكد من الإيميل صحيح

---

## ✅ الخلاصة

```
1. سجّل في Brevo
2. احصل على SMTP Key
3. حدّث .env
4. جرّب!
```

**أسهل من SendGrid بكثير! 🎉**
