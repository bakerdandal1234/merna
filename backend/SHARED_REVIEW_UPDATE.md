# 📝 توثيق تعديلات نظام Flashcards - صلاحيات المراجعة المشتركة

## 📋 نظرة عامة

تم تعديل نظام الـ flashcards ليسمح لجميع المستخدمين بمراجعة جميع الجمل المخزنة في قاعدة البيانات، مع الحفاظ على صلاحيات الإضافة والتعديل والحذف للمالك فقط.

---

## 🔄 التعديلات الرئيسية

### 1️⃣ **Route: POST `/api/sentences/:id/review`**

#### ❌ قبل التعديل:
```javascript
app.post('/api/sentences/:id/review', protect, checkSentenceOwnership(Sentence), async (req, res) => {
  // كان المستخدم يستطيع فقط مراجعة جمله الخاصة
  const sentence = req.sentence; // من middleware
  // ...
});
```

#### ✅ بعد التعديل:
```javascript
app.post('/api/sentences/:id/review', protect, async (req, res) => {
  // الآن أي مستخدم يستطيع مراجعة أي جملة
  
  // التحقق من صحة الـ ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'معرّف الجملة غير صالح'
    });
  }

  // البحث عن الجملة (بدون تحقق من الملكية)
  const sentence = await Sentence.findById(req.params.id);
  
  if (!sentence) {
    return res.status(404).json({
      success: false,
      message: 'الجملة غير موجودة'
    });
  }
  
  // باقي الكود...
  const isOwner = sentence.userId.toString() === req.user._id.toString();
  // ...
});
```

**التغييرات:**
- ✅ إزالة `checkSentenceOwnership` middleware
- ✅ إضافة التحقق اليدوي من صحة الـ ID
- ✅ جلب الجملة مباشرة من قاعدة البيانات
- ✅ إضافة حقل `isOwner` في الاستجابة للواجهة الأمامية

---

### 2️⃣ **Route: GET `/api/sentences/due`**

#### ❌ قبل التعديل:
```javascript
app.get('/api/sentences/due', protect, async (req, res) => {
  const dueSentences = await Sentence.find({
    userId: req.user._id,  // ❌ جلب جمل المستخدم فقط
    nextReview: { $lte: now }
  }).sort({ nextReview: 1 });
  // ...
});
```

#### ✅ بعد التعديل:
```javascript
app.get('/api/sentences/due', protect, async (req, res) => {
  // جلب جميع الجمل المستحقة للمراجعة (من جميع المستخدمين)
  const dueSentences = await Sentence.find({
    nextReview: { $lte: now }  // ✅ بدون تصفية userId
  }).sort({ nextReview: 1 });
  
  const sentencesWithStats = dueSentences.map(s => {
    const stats = calculateSentenceStats(s);
    // إضافة معلومة isOwner لكل جملة
    const isOwner = s.userId.toString() === req.user._id.toString();
    return { ...s.toObject(), stats, isOwner };
  });
  // ...
});
```

**التغييرات:**
- ✅ إزالة `userId: req.user._id` من استعلام قاعدة البيانات
- ✅ إضافة حقل `isOwner` لكل جملة في الاستجابة
- ✅ الآن يجلب جميع الجمل المستحقة من كل المستخدمين

---

## 🔒 الصلاحيات المحفوظة

### Routes التي لم تتغير (للمالك فقط):

#### 1. **POST `/api/sentences`** - إضافة جملة جديدة
```javascript
app.post('/api/sentences', protect, async (req, res) => {
  // يتطلب تسجيل دخول
  // يضيف الجملة تحت userId الخاص بالمستخدم الحالي
});
```

#### 2. **PUT `/api/sentences/:id`** - تعديل الجملة
```javascript
app.put('/api/sentences/:id', protect, checkSentenceOwnership(Sentence), async (req, res) => {
  // ✅ لا يزال يتحقق من الملكية
  // فقط المالك يستطيع تعديل جمله
});
```

#### 3. **DELETE `/api/sentences/:id`** - حذف الجملة
```javascript
app.delete('/api/sentences/:id', protect, checkSentenceOwnership(Sentence), async (req, res) => {
  // ✅ لا يزال يتحقق من الملكية
  // فقط المالك يستطيع حذف جمله
});
```

#### 4. **POST `/api/sentences/reset`** - إعادة تعيين جمل المستخدم
```javascript
app.post('/api/sentences/reset', protect, async (req, res) => {
  await Sentence.updateMany(
    { userId: req.user._id }, // ✅ فقط جمل المستخدم الحالي
    { /* reset fields */ }
  );
});
```

---

## 📊 Routes القراءة (Read-only)

### Routes التي تجلب جميع الجمل:

#### 1. **GET `/api/sentences`** - جلب جميع الجمل
```javascript
app.get('/api/sentences', protect, async (req, res) => {
  // كان بالفعل يجلب جميع الجمل ✅
  const sentences = await Sentence.find({}).sort({ createdAt: -1 });
  
  const sentencesWithStats = sentences.map(s => {
    const isOwner = s.userId.toString() === req.user._id.toString();
    return { ...s.toObject(), stats, isOwner };
  });
});
```

#### 2. **GET `/api/sentences/my-sentences`** - جلب جمل المستخدم فقط (اختياري)
```javascript
app.get('/api/sentences/my-sentences', protect, async (req, res) => {
  // endpoint إضافي في حال أراد المستخدم فلترة جمله الخاصة
  const sentences = await Sentence.find({ userId: req.user._id });
});
```

---

## 🔍 حقل `isOwner` الجديد

تم إضافة حقل `isOwner` في كل استجابة تحتوي على جمل، لمساعدة الـ Frontend في تحديد الصلاحيات:

```javascript
const isOwner = sentence.userId && req.user._id && 
                sentence.userId.toString() === req.user._id.toString();

return {
  ...sentence.toObject(),
  stats: calculateSentenceStats(sentence),
  isOwner: isOwner  // ✅ true إذا كان المستخدم الحالي هو المالك
};
```

**استخدام `isOwner` في الواجهة الأمامية:**
```javascript
// مثال في React
{sentences.map(sentence => (
  <div key={sentence._id}>
    <p>{sentence.german}</p>
    
    {/* أزرار المراجعة - متاحة للجميع */}
    <button onClick={() => reviewSentence(sentence._id, quality)}>
      مراجعة
    </button>
    
    {/* أزرار التعديل/الحذف - للمالك فقط */}
    {sentence.isOwner && (
      <>
        <button onClick={() => editSentence(sentence._id)}>تعديل</button>
        <button onClick={() => deleteSentence(sentence._id)}>حذف</button>
      </>
    )}
  </div>
))}
```

---

## 🚀 ملخص التعديلات

| الميزة | قبل التعديل | بعد التعديل |
|--------|-------------|-------------|
| **مراجعة الجمل** | للمالك فقط | لجميع المستخدمين ✅ |
| **الجمل المستحقة** | جمل المستخدم فقط | جميع الجمل المستحقة ✅ |
| **إضافة جملة** | للمستخدم المسجل | لم يتغير ✅ |
| **تعديل جملة** | للمالك فقط | لم يتغير ✅ |
| **حذف جملة** | للمالك فقط | لم يتغير ✅ |
| **حقل isOwner** | غير موجود | تم إضافته ✅ |

---

## 📝 ملاحظات مهمة

### 1. **نموذج البيانات لم يتغير**
```javascript
const sentenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  german: String,
  arabic: String,
  // حقول SM-2
  interval: Number,
  easeFactor: Number,
  repetitions: Number,
  nextReview: Date,
  reviewLevel: String,
  // إحصائيات
  reviewCount: Number,
  correctCount: Number,
  wrongCount: Number,
  reviewHistory: Array
});
```
- ✅ `userId` لا يزال موجوداً ومطلوباً
- ✅ كل جملة لها صاحب محدد
- ✅ فقط صلاحيات القراءة/المراجعة أصبحت مشتركة

### 2. **API Endpoints Summary**

```
📖 القراءة (Read) - متاحة للجميع:
  GET  /api/sentences           ✅ جميع الجمل
  GET  /api/sentences/due       ✅ جميع الجمل المستحقة
  GET  /api/sentences/my-sentences  ✅ جمل المستخدم فقط

✏️ المراجعة (Review) - متاحة للجميع:
  POST /api/sentences/:id/review  ✅ مراجعة أي جملة

➕ الكتابة (Write) - للمالك فقط:
  POST   /api/sentences          🔒 إضافة جملة جديدة
  PUT    /api/sentences/:id      🔒 تعديل جملة (للمالك)
  DELETE /api/sentences/:id      🔒 حذف جملة (للمالك)
  POST   /api/sentences/reset    🔒 إعادة تعيين جمل المستخدم
```

### 3. **مسار الملف المُعدّل**
```
backend/server_updated.js  ← النسخة الجديدة المُعدّلة
backend/server.js          ← النسخة الأصلية (نسخة احتياطية)
```

---

## 🧪 اختبار التعديلات

### 1. **اختبار المراجعة**
```bash
# يمكن لأي مستخدم مراجعة أي جملة
POST /api/sentences/60d5ec49f1b2c72b8c8e4f1a/review
Authorization: Bearer <USER_A_TOKEN>
{
  "quality": 3
}

# يمكن لمستخدم آخر مراجعة نفس الجملة
POST /api/sentences/60d5ec49f1b2c72b8c8e4f1a/review
Authorization: Bearer <USER_B_TOKEN>
{
  "quality": 2
}
```

### 2. **اختبار الجمل المستحقة**
```bash
# جلب جميع الجمل المستحقة (لكل المستخدمين)
GET /api/sentences/due
Authorization: Bearer <USER_TOKEN>

# الاستجابة ستحتوي على isOwner
{
  "success": true,
  "count": 10,
  "sentences": [
    {
      "_id": "...",
      "german": "...",
      "arabic": "...",
      "isOwner": true,  // جملة المستخدم الحالي
      "stats": { ... }
    },
    {
      "_id": "...",
      "german": "...",
      "arabic": "...",
      "isOwner": false, // جملة مستخدم آخر
      "stats": { ... }
    }
  ]
}
```

### 3. **اختبار صلاحيات التعديل**
```bash
# محاولة تعديل جملة مستخدم آخر - يجب أن تفشل ❌
PUT /api/sentences/60d5ec49f1b2c72b8c8e4f1a
Authorization: Bearer <USER_B_TOKEN>
{
  "german": "Modified sentence"
}

# الاستجابة:
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

---

## 🔄 خطوات التطبيق

### الخيار 1: استبدال الملف مباشرة
```bash
# 1. نسخ احتياطية من الملف الأصلي
cp backend/server.js backend/server_backup.js

# 2. استبدال الملف بالنسخة المُعدّلة
cp backend/server_updated.js backend/server.js

# 3. إعادة تشغيل الـ server
npm start
```

### الخيار 2: مراجعة التعديلات يدوياً
1. افتح `server_updated.js` و `server.js` جنباً إلى جنب
2. ابحث عن التعليقات `✅` في الملف المُعدّل
3. انسخ التعديلات المحددة فقط
4. احفظ واعد تشغيل الـ server

---

## ✅ التحقق من نجاح التعديلات

بعد التطبيق، يجب أن ترى في console الـ server:
```
╔════════════════════════════════════════╗
║   🚀 Server Running on Port 3000      ║
║   🌍 Environment: development          ║
║   🔐 Authentication: Enabled           ║
║   🛡️  Authorization: Modified          ║
║   🧠 SM-2 Algorithm: Active            ║
║   🔗 API: http://localhost:3000/api    ║
║   📚 Review Access: All Users          ║
╚════════════════════════════════════════╝
```

---

## 📚 ملخص سريع

**ما تم تغييره:**
- ✅ أي مستخدم يستطيع مراجعة أي جملة
- ✅ جلب الجمل المستحقة يشمل جميع المستخدمين
- ✅ إضافة حقل `isOwner` للتحكم في الواجهة الأمامية

**ما لم يتغير:**
- 🔒 الإضافة والتعديل والحذف لا تزال للمالك فقط
- 🔒 نموذج البيانات لم يتغير
- 🔒 المصادقة (Authentication) لا تزال مطلوبة

---

تاريخ التوثيق: **يناير 2026**
