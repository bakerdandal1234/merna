# 🔍 شرح تفصيلي لدوال الإحصائيات

## 📚 نظرة عامة

نظام الإحصائيات يعتمد على **8 دوال رئيسية** في `utils/srs.js` - كل دالة لها دور محدد.

---

## 1️⃣ calculateStats() - حساب الإحصائيات الأساسية

### 📋 الكود:
```javascript
export const calculateStats = (sentences) => {
  const total = sentences.length;
  const levelCounts = { new: 0, hard: 0, good: 0, excellent: 0, mastered: 0 };
  
  sentences.forEach(s => {
    const level = s.reviewLevel || 'new';
    levelCounts[level]++;
  });
  
  const masteryPercentage = total > 0 
    ? ((levelCounts.excellent + levelCounts.mastered) / total * 100).toFixed(1)
    : 0;
  
  const due = getDueSentences(sentences).length;
  
  return {
    total,
    ...levelCounts,
    masteryPercentage,
    due,
    completed: levelCounts.mastered,
    inProgress: total - levelCounts.new - levelCounts.mastered
  };
};
```

### 🎯 الغرض:
حساب **جميع الأرقام الأساسية** التي تحتاجها صفحة الإحصائيات في مكان واحد.

### 📊 المدخلات:
- `sentences`: Array - مصفوفة جميع الجمل

### 📤 المخرجات:
```javascript
{
  total: 50,              // إجمالي الجمل
  new: 10,                // جمل جديدة
  hard: 8,                // صعب
  good: 15,               // جيد
  excellent: 12,          // ممتاز
  mastered: 5,            // مُتقن
  masteryPercentage: "34.0",  // نسبة الإتقان
  due: 7,                 // جمل مستحقة اليوم
  completed: 5,           // مُكتمل
  inProgress: 35          // قيد التقدم
}
```

### 🔍 لماذا نحتاجها؟
- ✅ **مركزية البيانات**: كل الأرقام في مكان واحد
- ✅ **أداء أفضل**: حساب واحد بدلاً من 10 حسابات منفصلة
- ✅ **سهولة الاستخدام**: استدعاء واحد يعطيك كل شيء

---

## 2️⃣ getDueSentences() - الجمل المستحقة

### 📋 الكود:
```javascript
export const getDueSentences = (sentences) => {
  const now = new Date();
  
  return sentences.filter(sentence => {
    if (!sentence.nextReview) return true;  // جمل جديدة
    
    const nextReview = new Date(sentence.nextReview);
    return nextReview <= now;  // موعد المراجعة حان
  }).sort((a, b) => {
    if (!a.nextReview) return -1;
    if (!b.nextReview) return 1;
    return new Date(a.nextReview) - new Date(b.nextReview);
  });
};
```

### 🎯 الغرض:
تحديد **أي الجمل يجب مراجعتها اليوم**.

### 📊 المنطق:
```
الجملة مستحقة إذا:
1. nextReview === null  (جملة جديدة)
   أو
2. nextReview <= الآن   (وقت المراجعة حان)

ترتيب النتائج:
- الجمل الجديدة أولاً
- ثم الأقدم (الأكثر تأخراً)
```

### 📤 مثال:
```javascript
// مدخلات
sentences = [
  { german: "A", nextReview: null },                    // جديدة
  { german: "B", nextReview: "2026-01-15" },          // متأخرة
  { german: "C", nextReview: "2026-01-20" },          // اليوم
  { german: "D", nextReview: "2026-01-25" }           // مستقبلية
]

// مخرجات (اليوم 20 يناير)
dueSentences = [
  { german: "A", ... },  // جديدة (أولوية)
  { german: "B", ... },  // متأخرة 5 أيام
  { german: "C", ... }   // اليوم
]
// D لا تظهر (موعدها لم يحن)
```

### 🔍 لماذا نحتاجها؟
- ✅ **تحديد الواجب**: ماذا يجب أن أراجع الآن؟
- ✅ **تحديد الأولويات**: الجديدة والمتأخرة أولاً
- ✅ **منع الإرهاق**: لا نعرض كل الجمل، فقط المستحقة

---

## 3️⃣ calculateNextReview() - موعد المراجعة التالي

### 📋 الكود:
```javascript
export const calculateNextReview = (reviewLevel, correctStreak = 0, lastReviewed = new Date()) => {
  let days = INTERVALS[reviewLevel] || INTERVALS.new;
  
  // مكافأة الـ streak
  if (correctStreak >= 5) {
    days = days * 2;      // ضعف المدة
  } else if (correctStreak >= 3) {
    days = days * 1.5;    // زيادة 50%
  }
  
  const nextDate = new Date(lastReviewed);
  nextDate.setTime(nextDate.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return nextDate;
};
```

### 🎯 الغرض:
حساب **متى يجب مراجعة هذه الجملة مرة أخرى**.

### 📊 الفترات الزمنية:
```javascript
const INTERVALS = {
  new: 0.007,      // ~10 دقائق
  failed: 1,       // يوم واحد
  hard: 3,         // 3 أيام
  good: 7,         // أسبوع
  excellent: 15,   // أسبوعين
  mastered: 30     // شهر
};
```

### 🎁 مكافأة الـ Streak:
```
streak >= 5  → days × 2    (ضعف المدة!)
streak >= 3  → days × 1.5  (زيادة 50%)
streak < 3   → days × 1    (عادي)
```

### 📤 مثال:
```javascript
// مثال 1: جملة ممتازة، بدون streak
calculateNextReview('excellent', 0, new Date('2026-01-20'))
// النتيجة: 2026-02-04 (بعد 15 يوم)

// مثال 2: جملة ممتازة، streak = 5
calculateNextReview('excellent', 5, new Date('2026-01-20'))
// النتيجة: 2026-02-19 (بعد 30 يوم = 15 × 2)
```

### 🔍 لماذا نحتاجها؟
- ✅ **SRS الأساسي**: هذا هو قلب النظام!
- ✅ **تحفيز الاستمرارية**: streak عالي = راحة أطول
- ✅ **كفاءة**: لا تراجع إلا عند الحاجة

---

## 4️⃣ calculateNewLevel() - تحديد المستوى الجديد

### 📋 الكود:
```javascript
export const calculateNewLevel = (knewIt, currentLevel, consecutiveCorrect = 0) => {
  if (!knewIt) {
    return 'new';  // أخطأ → رجوع للبداية
  }
  
  const progression = {
    'new': consecutiveCorrect >= 2 ? 'hard' : 'new',
    'hard': consecutiveCorrect >= 2 ? 'good' : 'hard',
    'good': consecutiveCorrect >= 3 ? 'excellent' : 'good',
    'excellent': consecutiveCorrect >= 3 ? 'mastered' : 'excellent',
    'mastered': 'mastered'
  };
  
  return progression[currentLevel] || 'new';
};
```

### 🎯 الغرض:
تحديد **المستوى التالي** بعد المراجعة.

### 📊 شجرة القرار:
```
أخطأ؟
  ├─ نعم → new (رجوع للبداية)
  └─ لا → تحقق من consecutiveCorrect

new:
  ├─ إجابتين صحيحتين → hard
  └─ أقل → new

hard:
  ├─ إجابتين صحيحتين → good
  └─ أقل → hard

good:
  ├─ 3 إجابات صحيحة → excellent
  └─ أقل → good

excellent:
  ├─ 3 إجابات صحيحة → mastered
  └─ أقل → excellent

mastered:
  └─ دائماً mastered
```

### 📤 مثال:
```javascript
// سيناريو 1: جملة جديدة، إجابة صحيحة لأول مرة
calculateNewLevel(true, 'new', 1)
// النتيجة: 'new' (تحتاج إجابتين)

// سيناريو 2: جملة جديدة، إجابتين صحيحتين
calculateNewLevel(true, 'new', 2)
// النتيجة: 'hard' (ترقية!)

// سيناريو 3: جملة ممتازة، لكن أخطأ
calculateNewLevel(false, 'excellent', 0)
// النتيجة: 'new' (رجوع للبداية)
```

### 🔍 لماذا نحتاجها؟
- ✅ **التقدم المنطقي**: لا ترقية سريعة بدون إتقان
- ✅ **المرونة**: العودة للبداية عند الخطأ
- ✅ **التحفيز**: رؤية التقدم يحفز الاستمرار

---

## 5️⃣ predictMastery() - توقع الإتقان

### 📋 الكود:
```javascript
export const predictMastery = (sentences, dailyReviews = 15) => {
  const stats = calculateStats(sentences);
  const remaining = stats.total - stats.mastered;
  
  // متوسط 5 مراجعات لإتقان جملة واحدة
  const reviewsNeeded = remaining * 5;
  const daysNeeded = Math.ceil(reviewsNeeded / dailyReviews);
  
  return {
    daysNeeded,
    weeksNeeded: Math.ceil(daysNeeded / 7),
    monthsNeeded: Math.ceil(daysNeeded / 30),
    estimatedDate: new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000)
  };
};
```

### 🎯 الغرض:
الإجابة على السؤال: **"متى سأتقن كل الجمل؟"**

### 📊 الحساب:
```
1. الجمل المتبقية = الإجمالي - المُتقن
2. المراجعات المطلوبة = المتبقية × 5
   (افتراض: تحتاج 5 مراجعات لإتقان جملة)
3. الأيام = المراجعات المطلوبة ÷ 15
   (افتراض: 15 مراجعة يومياً)
```

### 📤 مثال:
```javascript
// 50 جملة، 5 مُتقن
predictMastery(sentences, 15)

/* الحساب:
   المتبقية: 50 - 5 = 45
   المراجعات: 45 × 5 = 225
   الأيام: 225 ÷ 15 = 15 يوم
*/

// النتيجة:
{
  daysNeeded: 15,
  weeksNeeded: 3,        // 15 ÷ 7
  monthsNeeded: 1,       // 15 ÷ 30
  estimatedDate: "2026-02-04"
}
```

### 🔍 لماذا نحتاجها؟
- ✅ **وضوح الهدف**: "بعد أسبوعين تنتهي!"
- ✅ **التحفيز**: رؤية نهاية واضحة
- ✅ **التخطيط**: ترتيب الوقت

---

## 6️⃣ getSmartSuggestions() - الاقتراحات الذكية

### 📋 الكود:
```javascript
export const getSmartSuggestions = (stats) => {
  const suggestions = [];
  
  if (stats.due === 0) {
    suggestions.push({
      type: 'success',
      icon: '🎉',
      message: 'رائع! لا توجد مراجعات اليوم',
      action: 'تعلم جمل جديدة'
    });
  } else if (stats.due > 20) {
    suggestions.push({
      type: 'warning',
      icon: '⚠️',
      message: `لديك ${stats.due} جملة للمراجعة!`,
      action: 'ابدأ المراجعة الآن'
    });
  } else {
    suggestions.push({
      type: 'info',
      icon: '📚',
      message: `${stats.due} جمل تنتظر المراجعة`,
      action: 'راجع الآن'
    });
  }
  
  if (stats.masteryPercentage < 30) {
    suggestions.push({
      type: 'tip',
      icon: '💡',
      message: 'ركّز على المراجعة اليومية',
      action: null
    });
  }
  
  if (stats.new > stats.total * 0.5) {
    suggestions.push({
      type: 'tip',
      icon: '🎯',
      message: 'لديك جمل جديدة كثيرة، راجعها تدريجياً',
      action: null
    });
  }
  
  return suggestions;
};
```

### 🎯 الغرض:
تقديم **نصائح ديناميكية** حسب وضع المستخدم.

### 📊 القواعد:

#### قاعدة 1: المراجعات اليومية
```
due = 0    → "🎉 رائع!" (success)
due > 20   → "⚠️ الكثير!" (warning)
0 < due <= 20 → "📚 عادي" (info)
```

#### قاعدة 2: نسبة الإتقان
```
masteryPercentage < 30% → "💡 ركّز على المراجعة"
```

#### قاعدة 3: الجمل الجديدة
```
new > 50% من الإجمالي → "🎯 راجع تدريجياً"
```

### 📤 مثال:
```javascript
// الحالة: 25 جملة للمراجعة، إتقان 20%
getSmartSuggestions({
  due: 25,
  masteryPercentage: 20,
  new: 10,
  total: 50
})

// النتيجة:
[
  { 
    type: 'warning',
    icon: '⚠️',
    message: 'لديك 25 جملة للمراجعة!',
    action: 'ابدأ المراجعة الآن'
  },
  {
    type: 'tip',
    icon: '💡',
    message: 'ركّز على المراجعة اليومية'
  }
]
```

### 🔍 لماذا نحتاجها؟
- ✅ **إرشاد شخصي**: كل مستخدم يرى ما يناسبه
- ✅ **توفير الوقت**: لا تفكر ماذا تفعل
- ✅ **تحسين الأداء**: نصائح مبنية على بيانات

---

## 7️⃣ calculateStreak() - حساب الـ Streak

### 📋 الكود:
```javascript
export const calculateStreak = (reviewHistory) => {
  if (!reviewHistory || reviewHistory.length === 0) return 0;
  
  let streak = 1;
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 24 * 60 * 60 * 1000;
  
  // التحقق من المراجعة اليوم
  const hasReviewedToday = reviewHistory.some(date => {
    const reviewDate = new Date(date).setHours(0, 0, 0, 0);
    return reviewDate === today;
  });
  
  if (!hasReviewedToday) {
    const hasReviewedYesterday = reviewHistory.some(date => {
      const reviewDate = new Date(date).setHours(0, 0, 0, 0);
      return reviewDate === yesterday;
    });
    
    if (!hasReviewedYesterday) return 0;
  }
  
  // حساب الأيام المتتالية
  const sortedDates = reviewHistory
    .map(d => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const diff = (sortedDates[i] - sortedDates[i + 1]) / (24 * 60 * 60 * 1000);
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }
  
  return streak;
};
```

### 🎯 الغرض:
حساب **عدد الأيام المتتالية** للمراجعة.

### 📊 المنطق:
```
1. تحقق من المراجعة اليوم
   - نعم → ابدأ العد
   - لا → تحقق من الأمس
     - نعم → ابدأ العد
     - لا → streak = 0

2. رتّب تواريخ المراجعة (الأحدث أولاً)

3. عُد الأيام المتتالية:
   - الفرق = 1 يوم → استمر العد
   - الفرق > 1 يوم → توقف
```

### 📤 مثال:
```javascript
// تاريخ اليوم: 2026-01-20
reviewHistory = [
  "2026-01-20",  // اليوم
  "2026-01-19",  // أمس
  "2026-01-18",  // قبل يومين
  "2026-01-16",  // قبل 4 أيام (فجوة!)
  "2026-01-15"
]

calculateStreak(reviewHistory)
// النتيجة: 3 (اليوم + أمس + قبل يومين)
// التوقف عند 16 يناير (فجوة يوم)
```

### 🔍 لماذا نحتاجها؟
- ✅ **التحفيز**: "لا تكسر السلسلة!"
- ✅ **المكافأة**: streak عالي = فترات أطول
- ✅ **الالتزام**: يشجع المراجعة اليومية

---

## 📊 الخلاصة: الدوال ودورها

| الدالة | الدور | الأهمية |
|--------|-------|---------|
| `calculateStats()` | الأرقام الأساسية | ⭐⭐⭐⭐⭐ |
| `getDueSentences()` | الواجب اليومي | ⭐⭐⭐⭐⭐ |
| `calculateNextReview()` | SRS الأساسي | ⭐⭐⭐⭐⭐ |
| `calculateNewLevel()` | التقدم | ⭐⭐⭐⭐⭐ |
| `predictMastery()` | التخطيط | ⭐⭐⭐⭐ |
| `getSmartSuggestions()` | الإرشاد | ⭐⭐⭐⭐ |
| `calculateStreak()` | التحفيز | ⭐⭐⭐ |

---

## 🎯 التكامل: كيف تعمل معاً؟

```
1. المستخدم يفتح صفحة الإحصائيات
   ↓
2. calculateStats() → تحسب كل الأرقام
   ↓
3. getDueSentences() → تحدد الواجب
   ↓
4. predictMastery() → تتوقع المستقبل
   ↓
5. getSmartSuggestions() → تقدم نصائح
   ↓
6. العرض: الصفحة تعرض كل شيء بشكل جميل!
```

---

## 💡 نصائح للتطوير

### إذا أردت تحسين الدقة:
```javascript
// بدلاً من:
const reviewsNeeded = remaining * 5;

// استخدم بيانات حقيقية:
const avgReviewsPerSentence = calculateAverageReviews(sentences);
const reviewsNeeded = remaining * avgReviewsPerSentence;
```

### إذا أردت Streak أفضل:
```javascript
// احفظ في localStorage
localStorage.setItem('streak', streak);
localStorage.setItem('lastReviewDate', today);
```

### إذا أردت اقتراحات أذكى:
```javascript
// استخدم Machine Learning
const suggestion = predictBestAction(userHistory, currentStats);
```

---

**كل دالة لها دور محدد، ومعاً تكوّن نظام إحصائيات قوي!** 🚀
