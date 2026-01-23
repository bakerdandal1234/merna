# 🔄 Code Diff - التعديلات على server.js

## التعديل 1: Route المراجعة

### ❌ قبل التعديل:

```javascript
// POST - مراجعة الجملة بنظام SM-2
app.post('/api/sentences/:id/review', protect, checkSentenceOwnership(Sentence), async (req, res) => {
  try {
    const { quality } = req.body;
    
    if (quality < 0 || quality > 3) {
      return res.status(400).json({
        success: false,
        message: 'التقييم يجب أن يكون بين 0 و 3'
      });
    }

    // استخدام req.sentence من middleware
    const sentence = req.sentence;
    const intervalBefore = sentence.interval;
    const newState = updateCardState(sentence, quality);

    sentence.interval = newState.interval;
    sentence.easeFactor = newState.easeFactor;
    sentence.repetitions = newState.repetitions;
    sentence.nextReview = newState.nextReview;
    sentence.reviewLevel = newState.reviewLevel;
    sentence.lastReviewed = new Date();
    sentence.reviewCount += 1;
    
    if (quality >= 2) {
      sentence.correctCount += 1;
    } else {
      sentence.wrongCount += 1;
    }

    sentence.reviewHistory.push({
      date: new Date(),
      quality: quality,
      intervalBefore: intervalBefore,
      intervalAfter: newState.interval
    });

    await sentence.save();

    const stats = calculateSentenceStats(sentence);
    
    res.json({
      success: true,
      message: '✅ تم تحديث البطاقة بنجاح',
      sentence: { ...sentence.toObject(), stats },
      changes: {
        intervalChange: `${intervalBefore} → ${newState.interval} أيام`,
        levelChange: newState.reviewLevel,
        nextReviewDate: newState.nextReview.toLocaleDateString('ar-EG')
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في المراجعة',
      error: error.message
    });
  }
});
```

### ✅ بعد التعديل:

```javascript
// POST - مراجعة الجملة بنظام SM-2
// ✅ تم إزالة checkSentenceOwnership للسماح لجميع المستخدمين بمراجعة أي جملة
app.post('/api/sentences/:id/review', protect, async (req, res) => {
  try {
    const { quality } = req.body;
    
    if (quality < 0 || quality > 3) {
      return res.status(400).json({
        success: false,
        message: 'التقييم يجب أن يكون بين 0 و 3'
      });
    }

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

    const intervalBefore = sentence.interval;
    const newState = updateCardState(sentence, quality);

    sentence.interval = newState.interval;
    sentence.easeFactor = newState.easeFactor;
    sentence.repetitions = newState.repetitions;
    sentence.nextReview = newState.nextReview;
    sentence.reviewLevel = newState.reviewLevel;
    sentence.lastReviewed = new Date();
    sentence.reviewCount += 1;
    
    if (quality >= 2) {
      sentence.correctCount += 1;
    } else {
      sentence.wrongCount += 1;
    }

    sentence.reviewHistory.push({
      date: new Date(),
      quality: quality,
      intervalBefore: intervalBefore,
      intervalAfter: newState.interval
    });

    await sentence.save();

    const stats = calculateSentenceStats(sentence);
    const isOwner = sentence.userId && req.user._id && sentence.userId.toString() === req.user._id.toString();
    
    res.json({
      success: true,
      message: '✅ تم تحديث البطاقة بنجاح',
      sentence: { ...sentence.toObject(), stats, isOwner },
      changes: {
        intervalChange: `${intervalBefore} → ${newState.interval} أيام`,
        levelChange: newState.reviewLevel,
        nextReviewDate: newState.nextReview.toLocaleDateString('ar-EG')
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في المراجعة',
      error: error.message
    });
  }
});
```

### 🔍 الفروقات الرئيسية:

```diff
- app.post('/api/sentences/:id/review', protect, checkSentenceOwnership(Sentence), async (req, res) => {
+ app.post('/api/sentences/:id/review', protect, async (req, res) => {

+   // التحقق من صحة الـ ID
+   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
+     return res.status(400).json({
+       success: false,
+       message: 'معرّف الجملة غير صالح'
+     });
+   }

-   // استخدام req.sentence من middleware
-   const sentence = req.sentence;
+   // البحث عن الجملة (بدون تحقق من الملكية)
+   const sentence = await Sentence.findById(req.params.id);
+   
+   if (!sentence) {
+     return res.status(404).json({
+       success: false,
+       message: 'الجملة غير موجودة'
+     });
+   }

    const stats = calculateSentenceStats(sentence);
+   const isOwner = sentence.userId && req.user._id && sentence.userId.toString() === req.user._id.toString();
    
    res.json({
      success: true,
      message: '✅ تم تحديث البطاقة بنجاح',
-     sentence: { ...sentence.toObject(), stats },
+     sentence: { ...sentence.toObject(), stats, isOwner },
      changes: {
        intervalChange: `${intervalBefore} → ${newState.interval} أيام`,
        levelChange: newState.reviewLevel,
        nextReviewDate: newState.nextReview.toLocaleDateString('ar-EG')
      }
    });
```

---

## التعديل 2: Route الجمل المستحقة

### ❌ قبل التعديل:

```javascript
// GET - الجمل المستحقة للمراجعة
app.get('/api/sentences/due', protect, async (req, res) => {
  try {
    const now = new Date();
    
    const dueSentences = await Sentence.find({
      userId: req.user._id,
      nextReview: { $lte: now }
    }).sort({ nextReview: 1 });
    
    const sentencesWithStats = dueSentences.map(s => {
      const stats = calculateSentenceStats(s);
      return { ...s.toObject(), stats };
    });
    
    res.json({
      success: true,
      count: sentencesWithStats.length,
      sentences: sentencesWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الجمل المستحقة',
      error: error.message
    });
  }
});
```

### ✅ بعد التعديل:

```javascript
// GET - الجمل المستحقة للمراجعة
// ✅ تم تعديل الاستعلام لجلب جميع الجمل المستحقة من كل المستخدمين
app.get('/api/sentences/due', protect, async (req, res) => {
  try {
    const now = new Date();
    
    // جلب جميع الجمل المستحقة للمراجعة (من جميع المستخدمين)
    const dueSentences = await Sentence.find({
      nextReview: { $lte: now }
    }).sort({ nextReview: 1 });
    
    const sentencesWithStats = dueSentences.map(s => {
      const stats = calculateSentenceStats(s);
      // إضافة معلومة isOwner لكل جملة
      const isOwner = s.userId && req.user._id && s.userId.toString() === req.user._id.toString();
      return { ...s.toObject(), stats, isOwner };
    });
    
    res.json({
      success: true,
      count: sentencesWithStats.length,
      sentences: sentencesWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الجمل المستحقة',
      error: error.message
    });
  }
});
```

### 🔍 الفروقات الرئيسية:

```diff
    const now = new Date();
    
+   // جلب جميع الجمل المستحقة للمراجعة (من جميع المستخدمين)
    const dueSentences = await Sentence.find({
-     userId: req.user._id,
      nextReview: { $lte: now }
    }).sort({ nextReview: 1 });
    
    const sentencesWithStats = dueSentences.map(s => {
      const stats = calculateSentenceStats(s);
+     // إضافة معلومة isOwner لكل جملة
+     const isOwner = s.userId && req.user._id && s.userId.toString() === req.user._id.toString();
-     return { ...s.toObject(), stats };
+     return { ...s.toObject(), stats, isOwner };
    });
```

---

## التعديل 3: رسالة بدء الـ Server

### ❌ قبل التعديل:

```javascript
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 Server Running on Port ${PORT}      ║
  ║   🌍 Environment: ${process.env.NODE_ENV}          ║
  ║   🔐 Authentication: Enabled           ║
  ║   🛡️  Authorization: Active            ║
  ║   🧠 SM-2 Algorithm: Active            ║
  ║   🔗 API: http://localhost:${PORT}/api    ║
  ╚════════════════════════════════════════╝
  `);
});
```

### ✅ بعد التعديل:

```javascript
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 Server Running on Port ${PORT}      ║
  ║   🌍 Environment: ${process.env.NODE_ENV}          ║
  ║   🔐 Authentication: Enabled           ║
  ║   🛡️  Authorization: Modified          ║
  ║   🧠 SM-2 Algorithm: Active            ║
  ║   🔗 API: http://localhost:${PORT}/api    ║
  ║   📚 Review Access: All Users          ║
  ╚════════════════════════════════════════╝
  `);
});
```

### 🔍 الفروقات:

```diff
  ║   🔐 Authentication: Enabled           ║
- ║   🛡️  Authorization: Active            ║
+ ║   🛡️  Authorization: Modified          ║
  ║   🧠 SM-2 Algorithm: Active            ║
  ║   🔗 API: http://localhost:${PORT}/api    ║
+ ║   📚 Review Access: All Users          ║
```

---

## 📊 ملخص التعديلات

| رقم | الموقع | التعديل | السبب |
|-----|--------|---------|-------|
| 1 | Line ~320 | إزالة `checkSentenceOwnership` من route المراجعة | للسماح لجميع المستخدمين بالمراجعة |
| 2 | Line ~325 | إضافة التحقق من صحة ObjectId | بديل عن middleware |
| 3 | Line ~330 | جلب الجملة مباشرة من DB | بدلاً من `req.sentence` |
| 4 | Line ~365 | إضافة حساب `isOwner` | لتحديد المالك |
| 5 | Line ~370 | إضافة `isOwner` في الاستجابة | للواجهة الأمامية |
| 6 | Line ~385 | إزالة `userId` من الاستعلام | لجلب جميع الجمل المستحقة |
| 7 | Line ~390 | إضافة `isOwner` لكل جملة | لتحديد المالك |
| 8 | Line ~650 | تعديل رسالة بدء Server | لتوضيح التغيير |

---

## 🔧 التطبيق العملي

### خيار 1: نسخ ولصق

1. افتح `server.js`
2. ابحث عن `app.post('/api/sentences/:id/review'`
3. استبدل الدالة بالكود الجديد أعلاه
4. ابحث عن `app.get('/api/sentences/due'`
5. استبدل الدالة بالكود الجديد أعلاه
6. احفظ وأعد التشغيل

### خيار 2: استبدال الملف

```bash
cp server_updated.js server.js
npm start
```

---

## ✅ التحقق من النجاح

بعد التطبيق:

```bash
# 1. افحص console
✅ يجب أن ترى: "📚 Review Access: All Users"

# 2. اختبر API
POST /api/sentences/[ANY_SENTENCE_ID]/review
Authorization: Bearer ANY_USER_TOKEN

✅ يجب أن ينجح حتى لو لم تكن مالك الجملة

# 3. اختبر الجمل المستحقة
GET /api/sentences/due
Authorization: Bearer YOUR_TOKEN

✅ يجب أن ترى جمل جميع المستخدمين
✅ كل جملة يجب أن تحتوي على isOwner: true/false
```

---

## 📝 ملاحظات مهمة

### ما لم يتغير:

```javascript
// ✅ هذه Routes لم تتغير - لا تزال للمالك فقط

app.put('/api/sentences/:id', protect, checkSentenceOwnership(Sentence), ...)
// ↑ لا يزال يستخدم checkSentenceOwnership

app.delete('/api/sentences/:id', protect, checkSentenceOwnership(Sentence), ...)
// ↑ لا يزال يستخدم checkSentenceOwnership
```

### الفرق الأساسي:

```
المراجعة (Review)  → متاحة للجميع     ✅
التعديل (Update)   → للمالك فقط       🔒
الحذف (Delete)     → للمالك فقط       🔒
```

---

يناير 2026 - Code Diff 🔄
