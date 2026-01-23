# 📚 German Sentences API - Authorization System

## 🎯 نظرة عامة

نظام إدارة جمل ألمانية مع ترجمتها للعربية، مبني باستخدام Express و MongoDB، مع نظام SM-2 لتكرار المراجعة.

---

## ✅ المشكلة التي تم حلها

### ❌ المشكلة السابقة:
- المستخدم كان يرى **فقط** الجمل التي أضافها هو
- لا يستطيع رؤية جمل المستخدمين الآخرين

### ✅ الحل الحالي:
- المستخدم يرى **جميع الجمل** (جمله + جمل المستخدمين الآخرين)
- المستخدم يستطيع **تعديل وحذف** جمله فقط
- جمل المستخدمين الآخرين **View Only** (للمشاهدة فقط)

---

## 🔐 نظام الصلاحيات

| العملية | Route | Method | يحتاج Auth | يحتاج Ownership | الوصف |
|---------|-------|--------|-----------|----------------|-------|
| جلب جميع الجمل | `/api/sentences` | GET | ✅ | ❌ | جميع المستخدمين يرون جميع الجمل |
| جلب جملي فقط | `/api/sentences/my-sentences` | GET | ✅ | ✅ | المستخدم يرى جمله فقط |
| إضافة جملة | `/api/sentences` | POST | ✅ | - | المستخدم يضيف جملة جديدة |
| تعديل جملة | `/api/sentences/:id` | PUT | ✅ | ✅ | المستخدم يعدل جملته فقط |
| حذف جملة | `/api/sentences/:id` | DELETE | ✅ | ✅ | المستخدم يحذف جملته فقط |
| مراجعة جملة | `/api/sentences/:id/review` | POST | ✅ | ✅ | المستخدم يراجع جملته فقط |

**Legend:**
- ✅ **Auth**: يحتاج تسجيل دخول (JWT Token)
- ✅ **Ownership**: يحتاج أن يكون مالك الجملة

---

## 📁 هيكل المشروع

```
backend/
├── config/           # إعدادات قاعدة البيانات
├── controllers/      # المنطق الأساسي للـ routes
├── middleware/
│   ├── auth.js                  # التحقق من JWT
│   ├── checkOwnership.js        # التحقق من ملكية الجملة
│   └── rateLimiter.js           # تحديد عدد الطلبات
├── models/           # نماذج MongoDB
├── routes/           # تعريف الـ routes
├── utils/            # وظائف مساعدة
├── server.js         # الملف الرئيسي ✨
├── srsController.js  # نظام SM-2 للمراجعة
│
└── 📚 التوثيق:
    ├── SOLUTION_SUMMARY.md      # ملخص الحل (ابدأ من هنا!)
    ├── AUTHORIZATION_FIX.md     # شرح تفصيلي
    ├── API_EXAMPLES.md          # أمثلة عملية
    └── QUICK_REFERENCE.md       # مرجع سريع
```

---

## 🚀 التشغيل السريع

### 1. تثبيت المكتبات:
```bash
cd backend
npm install
```

### 2. إعداد ملف `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/german-sentences
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
PORT=3000
```

### 3. تشغيل السيرفر:
```bash
npm start
```

**النتيجة:**
```
  ╔════════════════════════════════════════╗
  ║   🚀 Server Running on Port 3000      ║
  ║   🌍 Environment: development          ║
  ║   🔐 Authentication: Enabled           ║
  ║   🛡️  Authorization: Active            ║
  ║   🧠 SM-2 Algorithm: Active            ║
  ║   🔗 API: http://localhost:3000/api    ║
  ╚════════════════════════════════════════╝
```

---

## 📖 التوثيق

### 📚 اقرأ الملفات بالترتيب:

1. **`SOLUTION_SUMMARY.md`** - ابدأ من هنا! 🌟
   - ملخص شامل للحل
   - أمثلة React كاملة
   - CSS جاهز للاستخدام

2. **`AUTHORIZATION_FIX.md`** - للفهم العميق
   - شرح المشكلة بالتفصيل
   - كيف تم الحل
   - لماذا هذا الحل صحيح

3. **`API_EXAMPLES.md`** - للاستخدام العملي
   - أمثلة cURL/Postman
   - أمثلة JavaScript/React
   - أمثلة الاستجابات

4. **`QUICK_REFERENCE.md`** - للمراجعة السريعة
   - جداول ملخصة
   - أوامر سريعة
   - نصائح مفيدة

---

## 🧪 اختبار الـ API

### استخدام Postman:

#### 1. تسجيل الدخول:
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**احفظ الـ token من الاستجابة!**

#### 2. جلب جميع الجمل:
```http
GET http://localhost:3000/api/sentences
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 3. إضافة جملة جديدة:
```http
POST http://localhost:3000/api/sentences
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "german": "Guten Morgen",
  "arabic": "صباح الخير"
}
```

#### 4. تعديل جملتك:
```http
PUT http://localhost:3000/api/sentences/SENTENCE_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "german": "Guten Abend",
  "arabic": "مساء الخير"
}
```

#### 5. محاولة تعديل جملة مستخدم آخر (سيفشل):
```http
PUT http://localhost:3000/api/sentences/OTHER_USER_SENTENCE_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "german": "Hacked!"
}
```

**النتيجة:** `403 Forbidden` ✅

---

## 💻 استخدام في Frontend

### مثال سريع:

```javascript
// جلب جميع الجمل
const response = await fetch('http://localhost:3000/api/sentences', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.sentences);

// كل جملة تحتوي على isOwner
data.sentences.forEach(sentence => {
  if (sentence.isOwner) {
    // جملتي - يمكن التعديل/الحذف
    console.log('جملتي:', sentence.german);
  } else {
    // جملة مستخدم آخر - View Only
    console.log('جملة من مستخدم آخر:', sentence.german);
  }
});
```

### استخدام isOwner في React:

```javascript
function SentenceCard({ sentence }) {
  return (
    <div className="card">
      <p>{sentence.german}</p>
      <p>{sentence.arabic}</p>
      
      {/* إظهار الأزرار فقط للمالك */}
      {sentence.isOwner && (
        <div>
          <button onClick={() => handleEdit(sentence._id)}>
            ✏️ تعديل
          </button>
          <button onClick={() => handleDelete(sentence._id)}>
            🗑️ حذف
          </button>
        </div>
      )}
      
      {/* للجمل الأخرى */}
      {!sentence.isOwner && (
        <span className="badge">👀 View Only</span>
      )}
    </div>
  );
}
```

---

## 🔒 الأمان

### نظام الحماية ثنائي المستوى:

#### 1. Frontend Security (UI Level):
```javascript
{sentence.isOwner && <button>Edit</button>}
```
- **الهدف:** تحسين تجربة المستخدم
- **ملاحظة:** سهل التجاوز - للعرض فقط!

#### 2. Backend Security (API Level):
```javascript
app.put('/api/sentences/:id', protect, checkSentenceOwnership(Sentence), ...)
```
- **الهدف:** الحماية الحقيقية
- **ملاحظة:** **لا يمكن تجاوزه** ✅

### Middleware الأمان:

#### `protect` - التحقق من JWT:
```javascript
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      message: 'غير مصرح - يرجى تسجيل الدخول'
    });
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
};
```

#### `checkSentenceOwnership` - التحقق من الملكية:
```javascript
const checkSentenceOwnership = (Sentence) => {
  return async (req, res, next) => {
    const sentence = await Sentence.findById(req.params.id);
    
    if (sentence.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: '🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت'
      });
    }
    
    req.sentence = sentence;
    next();
  };
};
```

---

## 📊 مثال على الاستجابة

### GET `/api/sentences`:

```json
{
  "success": true,
  "count": 5,
  "sentences": [
    {
      "_id": "67890abc",
      "german": "Guten Morgen",
      "arabic": "صباح الخير",
      "userId": "user1",
      "isOwner": true,    // ✅ جملتي - يمكن التعديل/الحذف
      "interval": 7,
      "reviewLevel": "good",
      "reviewCount": 5,
      "stats": {
        "accuracy": 80,
        "daysUntilNext": 7,
        "level": {
          "name": "Good",
          "color": "#10B981"
        }
      }
    },
    {
      "_id": "12345xyz",
      "german": "Danke schön",
      "arabic": "شكراً جزيلاً",
      "userId": "user2",
      "isOwner": false,   // ❌ جملة مستخدم آخر - View Only
      "interval": 3,
      "reviewLevel": "learning",
      "reviewCount": 2,
      "stats": {
        "accuracy": 100,
        "daysUntilNext": 3,
        "level": {
          "name": "Learning",
          "color": "#3B82F6"
        }
      }
    }
  ]
}
```

---

## 🎨 ميزات النظام

### ✅ نظام المراجعة (SM-2):
- تكرار ذكي بناءً على الأداء
- 6 مستويات: New, Learning, Hard, Good, Excellent, Mastered
- حساب الفترات الزمنية تلقائياً

### ✅ الإحصائيات:
- إجمالي الجمل
- توزيع المستويات
- نسبة الإتقان
- الدقة الإجمالية
- عدد الجمل المستحقة للمراجعة

### ✅ الأمان:
- JWT Authentication
- Resource-based Authorization
- Rate Limiting
- Input Validation

### ✅ الأداء:
- MongoDB Indexing
- Efficient Queries
- Error Handling
- Logging

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا أستطيع تعديل/حذف جملة
**الحل:**
1. تأكد أنك مسجل دخول
2. تأكد أن الجملة ملكك (`isOwner: true`)
3. تحقق من الـ token صالح

### المشكلة: لا أرى جميع الجمل
**الحل:**
1. تأكد أنك تستخدم `/api/sentences` وليس `/api/sentences/my-sentences`
2. تحقق من وجود جمل في قاعدة البيانات

### المشكلة: Error 403 Forbidden
**الحل:**
- هذا طبيعي! أنت تحاول تعديل/حذف جملة ليست ملكك
- يمكنك فقط تعديل/حذف جملك الخاصة

---

## 📞 الدعم الفني

إذا واجهت أي مشكلة:

1. **راجع التوثيق:**
   - `SOLUTION_SUMMARY.md`
   - `API_EXAMPLES.md`

2. **افحص الـ Console:**
   - تحقق من رسائل الخطأ
   - تحقق من الـ Network Tab

3. **اختبر باستخدام Postman:**
   - تأكد من صحة الـ API

---

## 📈 الخطوات التالية

### تحسينات مستقبلية:

1. **تصنيف الجمل:**
   - إضافة Categories/Tags
   - البحث والفلترة

2. **التعاون:**
   - مشاركة الجمل مع مستخدمين محددين
   - نظام الأصدقاء

3. **الإشعارات:**
   - تذكير بالمراجعة
   - إحصائيات أسبوعية

4. **الألعاب:**
   - نظام النقاط
   - المنافسة بين المستخدمين

---

## ✅ الخلاصة

```
✅ المستخدم يرى جميع الجمل
✅ المستخدم يعدل/يحذف جمله فقط
✅ جمل المستخدمين الآخرين View Only
✅ الأمان محقق في Backend
✅ UX محسّن في Frontend
✅ توثيق شامل
✅ أمثلة عملية
```

---

**تم بنجاح! النظام جاهز للاستخدام 🎉**

**تاريخ آخر تحديث:** 2026-01-22  
**النسخة:** 2.0.0  
**المطور:** Claude AI
