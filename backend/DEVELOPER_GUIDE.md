# 🚀 دليل المطور السريع - نظام الصلاحيات

## 📋 فهرس سريع

1. [الملفات الرئيسية](#الملفات-الرئيسية)
2. [Routes الأساسية](#routes-الأساسية)
3. [Middleware الأمان](#middleware-الأمان)
4. [أمثلة سريعة](#أمثلة-سريعة)
5. [الأخطاء الشائعة](#الأخطاء-الشائعة)

---

## 📁 الملفات الرئيسية

```
backend/
├── server.js                    # ✨ الملف الرئيسي - تم التعديل هنا
├── middleware/
│   ├── auth.js                  # التحقق من JWT
│   └── checkOwnership.js        # التحقق من الملكية
└── 📚 التوثيق/
    ├── README_AUTHORIZATION.md  # اقرأ هذا أولاً!
    ├── SOLUTION_SUMMARY.md      # ملخص شامل
    ├── AUTHORIZATION_FIX.md     # شرح تفصيلي
    ├── API_EXAMPLES.md          # أمثلة عملية
    └── QUICK_REFERENCE.md       # مرجع سريع
```

---

## 🛣️ Routes الأساسية

### 1. قراءة جميع الجمل (Read All)

```javascript
GET /api/sentences
Headers: Authorization: Bearer TOKEN

// الاستجابة
{
  "success": true,
  "count": 5,
  "sentences": [
    {
      "_id": "...",
      "german": "Guten Morgen",
      "arabic": "صباح الخير",
      "isOwner": true,   // ✅ جملتي
      "stats": { ... }
    },
    {
      "_id": "...",
      "german": "Danke",
      "arabic": "شكراً",
      "isOwner": false,  // ❌ جملة مستخدم آخر
      "stats": { ... }
    }
  ]
}
```

**ملاحظة:** `isOwner` يحدد إذا كان المستخدم يملك الجملة أم لا

---

### 2. قراءة جملي فقط (Read My Sentences)

```javascript
GET /api/sentences/my-sentences
Headers: Authorization: Bearer TOKEN

// الاستجابة
{
  "success": true,
  "count": 3,
  "sentences": [
    // فقط الجمل التي أضافها المستخدم
    // جميعها isOwner: true
  ]
}
```

**متى تستخدمه:** عند إضافة فيلتر "جملي فقط" في Frontend

---

### 3. إضافة جملة (Create)

```javascript
POST /api/sentences
Headers: 
  Authorization: Bearer TOKEN
  Content-Type: application/json

Body:
{
  "german": "Ich liebe dich",
  "arabic": "أحبك"
}

// الاستجابة
{
  "success": true,
  "message": "✅ تم إضافة الجملة بنجاح",
  "sentence": { ... }
}
```

---

### 4. تعديل جملة (Update)

```javascript
PUT /api/sentences/:id
Headers: 
  Authorization: Bearer TOKEN
  Content-Type: application/json

Body:
{
  "german": "Guten Abend",
  "arabic": "مساء الخير",
  "favorite": true
}

// الاستجابة (نجاح)
{
  "success": true,
  "message": "✅ تم تعديل الجملة بنجاح",
  "sentence": { ... }
}

// الاستجابة (فشل - ليست جملتك)
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

**⚠️ مهم:** يمكنك تعديل جملك فقط!

---

### 5. حذف جملة (Delete)

```javascript
DELETE /api/sentences/:id
Headers: Authorization: Bearer TOKEN

// الاستجابة (نجاح)
{
  "success": true,
  "message": "🗑️ تم حذف الجملة بنجاح"
}

// الاستجابة (فشل - ليست جملتك)
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

**⚠️ مهم:** يمكنك حذف جملك فقط!

---

## 🔐 Middleware الأمان

### 1. `protect` - التحقق من JWT

```javascript
const protect = async (req, res, next) => {
  // يتحقق من وجود Token صالح
  // يضيف req.user للاستخدام في Routes
};

// الاستخدام
app.get('/api/sentences', protect, async (req, res) => {
  console.log(req.user.id); // ID المستخدم
});
```

**يستخدم في:** جميع الـ routes المحمية

---

### 2. `checkSentenceOwnership` - التحقق من الملكية

```javascript
const checkSentenceOwnership = (Sentence) => {
  return async (req, res, next) => {
    // يتحقق أن المستخدم يملك الجملة
    // يضيف req.sentence للاستخدام في Route
  };
};

// الاستخدام
app.put('/api/sentences/:id', 
  protect,                           // أولاً: تحقق من JWT
  checkSentenceOwnership(Sentence),  // ثانياً: تحقق من الملكية
  async (req, res) => {
    const sentence = req.sentence;   // الجملة من middleware
    // ...
  }
);
```

**يستخدم في:**
- PUT `/api/sentences/:id` (تعديل)
- DELETE `/api/sentences/:id` (حذف)
- POST `/api/sentences/:id/review` (مراجعة)

---

## 💡 أمثلة سريعة

### Frontend - React Hook للجمل

```javascript
import { useState, useEffect } from 'react';

function useSentences(filter = 'all') {
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSentences();
  }, [filter]);

  const fetchSentences = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'all' 
        ? '/api/sentences' 
        : '/api/sentences/my-sentences';

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      setSentences(data.sentences);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSentence = async (id, updates) => {
    try {
      const response = await fetch(`http://localhost:3000/api/sentences/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      
      if (data.success) {
        fetchSentences(); // إعادة تحميل القائمة
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  const deleteSentence = async (id) => {
    if (!confirm('هل تريد حذف هذه الجملة؟')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/sentences/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchSentences();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  return { 
    sentences, 
    loading, 
    error, 
    updateSentence, 
    deleteSentence,
    refresh: fetchSentences 
  };
}

// الاستخدام
function SentencesPage() {
  const { sentences, loading, updateSentence, deleteSentence } = useSentences('all');

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      {sentences.map(sentence => (
        <SentenceCard 
          key={sentence._id}
          sentence={sentence}
          onUpdate={updateSentence}
          onDelete={deleteSentence}
        />
      ))}
    </div>
  );
}
```

---

### Frontend - مكون بطاقة الجملة

```javascript
function SentenceCard({ sentence, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [german, setGerman] = useState(sentence.german);
  const [arabic, setArabic] = useState(sentence.arabic);

  const handleSave = () => {
    if (!sentence.isOwner) {
      alert('🚫 لا يمكنك تعديل هذه الجملة');
      return;
    }
    onUpdate(sentence._id, { german, arabic });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!sentence.isOwner) {
      alert('🚫 لا يمكنك حذف هذه الجملة');
      return;
    }
    onDelete(sentence._id);
  };

  return (
    <div className={sentence.isOwner ? 'my-card' : 'other-card'}>
      {/* Badge */}
      {sentence.isOwner ? (
        <span className="badge">✅ جملتي</span>
      ) : (
        <span className="badge">👀 View Only</span>
      )}

      {/* Content */}
      {isEditing ? (
        <div>
          <input value={german} onChange={(e) => setGerman(e.target.value)} />
          <input value={arabic} onChange={(e) => setArabic(e.target.value)} />
          <button onClick={handleSave}>💾 حفظ</button>
          <button onClick={() => setIsEditing(false)}>❌ إلغاء</button>
        </div>
      ) : (
        <div>
          <p className="german">{sentence.german}</p>
          <p className="arabic">{sentence.arabic}</p>
          
          {/* Buttons - Only for Owner */}
          {sentence.isOwner && (
            <div>
              <button onClick={() => setIsEditing(true)}>✏️ تعديل</button>
              <button onClick={handleDelete}>🗑️ حذف</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ الأخطاء الشائعة

### ❌ خطأ 1: عدم إرسال Token

```javascript
// خطأ
fetch('/api/sentences');

// صحيح ✅
fetch('/api/sentences', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### ❌ خطأ 2: محاولة تعديل جملة مستخدم آخر

```javascript
// هذا سيفشل إذا لم تكن الجملة ملكك
await fetch(`/api/sentences/${otherUserSentenceId}`, {
  method: 'PUT',
  // ...
});

// الحل: تحقق من isOwner أولاً
if (sentence.isOwner) {
  await fetch(`/api/sentences/${sentence._id}`, {
    method: 'PUT',
    // ...
  });
} else {
  alert('لا يمكنك تعديل هذه الجملة');
}
```

---

### ❌ خطأ 3: عدم معالجة الأخطاء

```javascript
// خطأ
const response = await fetch('/api/sentences');
const data = await response.json();

// صحيح ✅
try {
  const response = await fetch('/api/sentences');
  const data = await response.json();
  
  if (data.success) {
    // نجح
  } else {
    // فشل
    alert(data.message);
  }
} catch (error) {
  alert('حدث خطأ في الاتصال');
}
```

---

## 📊 جدول المقارنة السريع

| الميزة | قبل | بعد |
|--------|-----|-----|
| **يرى جميع الجمل** | ❌ | ✅ |
| **حقل isOwner** | ❌ | ✅ |
| **يعدل جمله فقط** | ✅ | ✅ |
| **يحذف جمله فقط** | ✅ | ✅ |
| **الأمان في Backend** | ✅ | ✅ |

---

## 🎯 نقاط مهمة

### ✅ تذكّر دائماً:

1. **`isOwner` للعرض فقط:**
   - استخدمه في Frontend لإظهار/إخفاء الأزرار
   - الأمان الحقيقي في Backend

2. **Middleware ترتيبه مهم:**
   ```javascript
   app.put('/api/sentences/:id',
     protect,                           // أولاً: تحقق من التسجيل
     checkSentenceOwnership(Sentence),  // ثانياً: تحقق من الملكية
     async (req, res) => { ... }        // ثالثاً: نفذ العملية
   );
   ```

3. **استخدم الـ Routes الصحيحة:**
   - `/api/sentences` → جميع الجمل
   - `/api/sentences/my-sentences` → جملي فقط

4. **أرسل Token دائماً:**
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

---

## 🧪 اختبار سريع

### Postman Collection:

```json
{
  "info": {
    "name": "German Sentences API"
  },
  "item": [
    {
      "name": "Get All Sentences",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/sentences",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "Get My Sentences",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/sentences/my-sentences",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "Create Sentence",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/sentences",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"german\": \"Guten Morgen\",\n  \"arabic\": \"صباح الخير\"\n}"
        }
      }
    },
    {
      "name": "Update Sentence",
      "request": {
        "method": "PUT",
        "url": "http://localhost:3000/api/sentences/{{sentenceId}}",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"german\": \"Guten Abend\",\n  \"arabic\": \"مساء الخير\"\n}"
        }
      }
    },
    {
      "name": "Delete Sentence",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:3000/api/sentences/{{sentenceId}}",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    }
  ]
}
```

---

## 📚 مراجع إضافية

- **SOLUTION_SUMMARY.md** - ملخص شامل مع أمثلة React
- **AUTHORIZATION_FIX.md** - شرح تفصيلي للحل
- **API_EXAMPLES.md** - أمثلة عملية لكل عملية
- **README_AUTHORIZATION.md** - دليل كامل

---

**✅ الآن أنت جاهز للبدء!**

**نصيحة أخيرة:** ابدأ بقراءة `SOLUTION_SUMMARY.md` للحصول على نظرة شاملة 🚀
