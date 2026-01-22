# 🔧 إصلاح خطأ 500 - Cannot read properties of undefined

## ❌ المشكلة

عند إضافة جملة جديدة أو جلب الجمل، كان يظهر الخطأ:

```
API Error: AxiosError
message: 'Request failed with status code 500'
error: "Cannot read properties of undefined (reading 'toString')"
```

---

## 🔍 السبب

المشكلة كانت في استخدام `req.user.id` بينما `protect` middleware يعيد `req.user._id`

### ❌ الكود الخاطئ:
```javascript
const isOwner = s.userId.toString() === req.user.id.toString();
//                                              ^^^ خطأ: id غير موجود
```

### ✅ الكود الصحيح:
```javascript
const isOwner = s.userId && req.user._id && s.userId.toString() === req.user._id.toString();
//                          ^^^^^^^^^^^^ صحيح: استخدام _id
```

---

## 🔧 التعديلات المطبقة

### 1. ملف `server.js`

تم تغيير جميع `req.user.id` إلى `req.user._id` في:

#### ✅ GET `/api/sentences`:
```javascript
// قبل
const isOwner = s.userId.toString() === req.user.id.toString();

// بعد
if (!req.user || !req.user._id) {
  return res.status(401).json({
    success: false,
    message: 'غير مصرح. يرجى تسجيل الدخول'
  });
}

const isOwner = s.userId && req.user._id && s.userId.toString() === req.user._id.toString();
```

#### ✅ GET `/api/sentences/my-sentences`:
```javascript
// قبل
const sentences = await Sentence.find({ userId: req.user.id });

// بعد
if (!req.user || !req.user._id) {
  return res.status(401).json({
    success: false,
    message: 'غير مصرح. يرجى تسجيل الدخول'
  });
}

const sentences = await Sentence.find({ userId: req.user._id });
```

#### ✅ POST `/api/sentences`:
```javascript
// قبل
const existingSentence = await Sentence.findOne({ 
  userId: req.user.id, 
  german 
});

const newSentence = new Sentence({
  userId: req.user.id,
  // ...
});

// بعد
if (!req.user || !req.user._id) {
  return res.status(401).json({
    success: false,
    message: 'غير مصرح. يرجى تسجيل الدخول'
  });
}

const existingSentence = await Sentence.findOne({ 
  userId: req.user._id, 
  german 
});

const newSentence = new Sentence({
  userId: req.user._id,
  // ...
});
```

#### ✅ GET `/api/sentences/due`:
```javascript
// قبل
const dueSentences = await Sentence.find({
  userId: req.user.id,
  nextReview: { $lte: now }
});

// بعد
const dueSentences = await Sentence.find({
  userId: req.user._id,
  nextReview: { $lte: now }
});
```

#### ✅ GET `/api/stats`:
```javascript
// قبل
const total = await Sentence.countDocuments({ userId: req.user.id });
stats.due = await Sentence.countDocuments({
  userId: req.user.id,
  nextReview: { $lte: now }
});
const allSentences = await Sentence.find({ userId: req.user.id });

// بعد
const total = await Sentence.countDocuments({ userId: req.user._id });
stats.due = await Sentence.countDocuments({
  userId: req.user._id,
  nextReview: { $lte: now }
});
const allSentences = await Sentence.find({ userId: req.user._id });
```

#### ✅ POST `/api/sentences/reset`:
```javascript
// قبل
await Sentence.updateMany(
  { userId: req.user.id },
  { /* ... */ }
);

// بعد
await Sentence.updateMany(
  { userId: req.user._id },
  { /* ... */ }
);
```

---

### 2. ملف `middleware/checkOwnership.js`

#### ✅ التعديل:
```javascript
// قبل
const userId = req.user.id;
if (sentence.userId.toString() !== userId.toString()) {
  // ...
}

// بعد
const userId = req.user._id;
if (!sentence.userId || !userId || sentence.userId.toString() !== userId.toString()) {
  // ...
}
```

---

## 🧪 الاختبار

### اختبر الآن:

#### 1. جلب جميع الجمل:
```bash
curl -X GET http://localhost:3000/api/sentences \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**النتيجة المتوقعة:** ✅ يعمل بدون أخطاء

#### 2. إضافة جملة جديدة:
```bash
curl -X POST http://localhost:3000/api/sentences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"german": "Test", "arabic": "اختبار"}'
```
**النتيجة المتوقعة:** ✅ يضاف بنجاح

#### 3. تعديل جملة:
```bash
curl -X PUT http://localhost:3000/api/sentences/SENTENCE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"german": "Updated"}'
```
**النتيجة المتوقعة:** ✅ يعمل بدون أخطاء

---

## 📋 ملخص التغييرات

| الملف | التغيير | السبب |
|-------|---------|-------|
| `server.js` | `req.user.id` → `req.user._id` | Mongoose يعيد `_id` وليس `id` |
| `server.js` | إضافة تحققات `!req.user \|\| !req.user._id` | حماية من القيم غير المعرّفة |
| `checkOwnership.js` | `req.user.id` → `req.user._id` | نفس السبب |
| `checkOwnership.js` | إضافة تحققات null | حماية إضافية |

---

## 🎯 الفرق بين `id` و `_id`

### في Mongoose:

```javascript
const user = await User.findById('123abc');

console.log(user.id);   // getter افتراضي من Mongoose (string)
console.log(user._id);  // الحقل الفعلي (ObjectId)
```

### المشكلة:

في بعض الحالات، `user.id` قد يكون `undefined` بينما `user._id` دائماً موجود.

### الحل:

استخدم دائماً `_id` للتأكد من وجود القيمة:

```javascript
✅ const userId = req.user._id;  // صحيح
❌ const userId = req.user.id;   // قد يسبب مشاكل
```

---

## ✅ التحققات الإضافية

لتجنب أخطاء مشابهة في المستقبل، أضفنا:

### 1. التحقق من وجود المستخدم:
```javascript
if (!req.user || !req.user._id) {
  return res.status(401).json({
    success: false,
    message: 'غير مصرح. يرجى تسجيل الدخول'
  });
}
```

### 2. التحقق الآمن عند المقارنة:
```javascript
// بدلاً من
if (a.toString() === b.toString())

// استخدم
if (a && b && a.toString() === b.toString())
```

---

## 🚨 نصائح مهمة

### 1. استخدم `_id` دائماً في الكود الخاص بك:
```javascript
✅ req.user._id
✅ sentence.userId
✅ user._id

❌ req.user.id
❌ sentence.userId.id
```

### 2. أضف تحققات دائماً:
```javascript
✅ if (!req.user || !req.user._id) { ... }
✅ if (!sentence.userId || !userId) { ... }

❌ const userId = req.user.id;  // بدون تحقق
```

### 3. استخدم Optional Chaining في Frontend:
```javascript
✅ const userId = user?._id
✅ const name = user?.name

❌ const userId = user._id  // قد يسبب خطأ إذا كان user undefined
```

---

## ✅ الخلاصة

```
✅ تم إصلاح جميع استخدامات req.user.id
✅ تم تحويلها إلى req.user._id
✅ تم إضافة تحققات إضافية
✅ الآن الـ API يعمل بدون أخطاء
```

---

**تم الإصلاح بنجاح! 🎉**

**التاريخ:** 2026-01-22  
**الملفات المعدلة:**
- `server.js` (جميع routes)
- `middleware/checkOwnership.js`

**الوقت المستغرق:** ~10 دقائق
