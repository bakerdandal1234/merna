# 🧪 أمثلة عملية لاستخدام الـ API

## 📋 جدول المحتويات
1. [جلب جميع الجمل](#1-جلب-جميع-الجمل)
2. [جلب جملي فقط](#2-جلب-جملي-فقط)
3. [إضافة جملة جديدة](#3-إضافة-جملة-جديدة)
4. [تعديل جملتي](#4-تعديل-جملتي)
5. [محاولة تعديل جملة مستخدم آخر](#5-محاولة-تعديل-جملة-مستخدم-آخر)
6. [حذف جملتي](#6-حذف-جملتي)
7. [محاولة حذف جملة مستخدم آخر](#7-محاولة-حذف-جملة-مستخدم-آخر)

---

## 1. جلب جميع الجمل

### Request:
```http
GET http://localhost:3000/api/sentences
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response:
```json
{
  "success": true,
  "count": 5,
  "sentences": [
    {
      "_id": "67890abc",
      "german": "Guten Morgen",
      "arabic": "صباح الخير",
      "userId": "60d5ec49f1b2c8b5e8c12345",
      "isOwner": true,  // ✅ جملتي - يمكن التعديل/الحذف
      "interval": 7,
      "easeFactor": 2.6,
      "repetitions": 3,
      "nextReview": "2026-01-29T10:00:00.000Z",
      "reviewLevel": "good",
      "reviewCount": 5,
      "correctCount": 4,
      "wrongCount": 1,
      "favorite": false,
      "createdAt": "2026-01-15T08:30:00.000Z",
      "stats": {
        "accuracy": 80,
        "daysUntilNext": 7,
        "level": {
          "name": "Good",
          "color": "#10B981",
          "description": "جيد - تراجع كل 7 أيام"
        }
      }
    },
    {
      "_id": "12345xyz",
      "german": "Danke schön",
      "arabic": "شكراً جزيلاً",
      "userId": "60d5ec49f1b2c8b5e8c67890",
      "isOwner": false,  // ❌ جملة مستخدم آخر - View Only
      "interval": 3,
      "easeFactor": 2.5,
      "repetitions": 2,
      "nextReview": "2026-01-25T10:00:00.000Z",
      "reviewLevel": "learning",
      "reviewCount": 2,
      "correctCount": 2,
      "wrongCount": 0,
      "favorite": true,
      "createdAt": "2026-01-20T10:00:00.000Z",
      "stats": {
        "accuracy": 100,
        "daysUntilNext": 3,
        "level": {
          "name": "Learning",
          "color": "#3B82F6",
          "description": "تعلم - تراجع كل 3 أيام"
        }
      }
    }
  ]
}
```

### استخدام في JavaScript:
```javascript
async function getAllSentences() {
  const response = await fetch('http://localhost:3000/api/sentences', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  // تصفية الجمل حسب الملكية
  const mySentences = data.sentences.filter(s => s.isOwner);
  const othersSentences = data.sentences.filter(s => !s.isOwner);
  
  console.log('جملي:', mySentences.length);
  console.log('جمل الآخرين:', othersSentences.length);
}
```

---

## 2. جلب جملي فقط

### Request:
```http
GET http://localhost:3000/api/sentences/my-sentences
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response:
```json
{
  "success": true,
  "count": 3,
  "sentences": [
    {
      "_id": "67890abc",
      "german": "Guten Morgen",
      "arabic": "صباح الخير",
      "userId": "60d5ec49f1b2c8b5e8c12345",
      "isOwner": true,
      "stats": { ... }
    }
  ]
}
```

### استخدام في React:
```javascript
function MySentencesPage() {
  const [sentences, setSentences] = useState([]);
  
  useEffect(() => {
    async function fetchMySentences() {
      const response = await fetch('http://localhost:3000/api/sentences/my-sentences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      setSentences(data.sentences);
    }
    
    fetchMySentences();
  }, []);
  
  return (
    <div>
      <h2>جملي ({sentences.length})</h2>
      {sentences.map(s => (
        <SentenceCard key={s._id} sentence={s} />
      ))}
    </div>
  );
}
```

---

## 3. إضافة جملة جديدة

### Request:
```http
POST http://localhost:3000/api/sentences
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "german": "Ich liebe dich",
  "arabic": "أحبك"
}
```

### Response (نجاح):
```json
{
  "success": true,
  "message": "✅ تم إضافة الجملة بنجاح",
  "sentence": {
    "_id": "new123abc",
    "german": "Ich liebe dich",
    "arabic": "أحبك",
    "userId": "60d5ec49f1b2c8b5e8c12345",
    "interval": 0,
    "easeFactor": 2.5,
    "repetitions": 0,
    "reviewLevel": "new",
    "nextReview": "2026-01-22T12:00:00.000Z",
    "reviewCount": 0,
    "correctCount": 0,
    "wrongCount": 0,
    "favorite": false,
    "createdAt": "2026-01-22T12:00:00.000Z",
    "stats": {
      "accuracy": 0,
      "daysUntilNext": 0,
      "level": {
        "name": "New",
        "color": "#6B7280",
        "description": "جديد - لم يتم المراجعة بعد"
      }
    }
  }
}
```

### Response (جملة مكررة):
```json
{
  "success": false,
  "message": "الجملة موجودة مسبقًا",
  "exists": true
}
```

### استخدام في React:
```javascript
async function addSentence(german, arabic) {
  try {
    const response = await fetch('http://localhost:3000/api/sentences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ german, arabic })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('✅ تم إضافة الجملة بنجاح');
      // تحديث القائمة
    } else if (data.exists) {
      alert('❌ الجملة موجودة مسبقًا');
    }
  } catch (error) {
    alert('❌ حدث خطأ');
  }
}
```

---

## 4. تعديل جملتي

### Request:
```http
PUT http://localhost:3000/api/sentences/67890abc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "german": "Guten Abend",
  "arabic": "مساء الخير",
  "favorite": true
}
```

### Response (نجاح):
```json
{
  "success": true,
  "message": "✅ تم تعديل الجملة بنجاح",
  "sentence": {
    "_id": "67890abc",
    "german": "Guten Abend",
    "arabic": "مساء الخير",
    "userId": "60d5ec49f1b2c8b5e8c12345",
    "favorite": true,
    "stats": { ... }
  }
}
```

### استخدام في React:
```javascript
async function updateSentence(id, updates) {
  const response = await fetch(`http://localhost:3000/api/sentences/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('✅ تم التعديل بنجاح');
  }
}

// مثال: تفعيل/إلغاء المفضلة
function toggleFavorite(sentence) {
  if (sentence.isOwner) {
    updateSentence(sentence._id, { favorite: !sentence.favorite });
  } else {
    alert('❌ لا يمكنك تعديل جمل الآخرين');
  }
}
```

---

## 5. محاولة تعديل جملة مستخدم آخر

### Request:
```http
PUT http://localhost:3000/api/sentences/12345xyz
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "german": "Hacked!",
  "arabic": "تم الاختراق!"
}
```

### Response (فشل - ممنوع):
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

### استخدام في React:
```javascript
function SentenceCard({ sentence }) {
  const handleEdit = () => {
    if (!sentence.isOwner) {
      alert('🚫 لا يمكنك تعديل جمل المستخدمين الآخرين');
      return;
    }
    
    // افتح نافذة التعديل
    openEditModal(sentence);
  };
  
  return (
    <div className="card">
      <p>{sentence.german}</p>
      <p>{sentence.arabic}</p>
      
      {/* إظهار الزر فقط للمالك */}
      {sentence.isOwner && (
        <button onClick={handleEdit}>تعديل</button>
      )}
      
      {!sentence.isOwner && (
        <span className="badge">جملة من مستخدم آخر</span>
      )}
    </div>
  );
}
```

---

## 6. حذف جملتي

### Request:
```http
DELETE http://localhost:3000/api/sentences/67890abc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (نجاح):
```json
{
  "success": true,
  "message": "🗑️ تم حذف الجملة بنجاح"
}
```

### استخدام في React:
```javascript
async function deleteSentence(id, isOwner) {
  if (!isOwner) {
    alert('🚫 لا يمكنك حذف جمل الآخرين');
    return;
  }
  
  if (!confirm('هل تريد حذف هذه الجملة؟')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/api/sentences/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('✅ تم الحذف بنجاح');
      // إزالة من القائمة
    }
  } catch (error) {
    alert('❌ حدث خطأ');
  }
}
```

---

## 7. محاولة حذف جملة مستخدم آخر

### Request:
```http
DELETE http://localhost:3000/api/sentences/12345xyz
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (فشل - ممنوع):
```json
{
  "success": false,
  "message": "🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت"
}
```

---

## 🎨 مثال كامل: مكون SentenceCard في React

```javascript
import React, { useState } from 'react';

function SentenceCard({ sentence, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [german, setGerman] = useState(sentence.german);
  const [arabic, setArabic] = useState(sentence.arabic);

  const handleSave = async () => {
    if (!sentence.isOwner) {
      alert('🚫 لا يمكنك تعديل هذه الجملة');
      return;
    }

    await onUpdate(sentence._id, { german, arabic });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!sentence.isOwner) {
      alert('🚫 لا يمكنك حذف هذه الجملة');
      return;
    }

    if (confirm('هل تريد حذف هذه الجملة؟')) {
      await onDelete(sentence._id);
    }
  };

  const toggleFavorite = async () => {
    if (!sentence.isOwner) {
      alert('🚫 لا يمكنك تعديل هذه الجملة');
      return;
    }

    await onUpdate(sentence._id, { favorite: !sentence.favorite });
  };

  return (
    <div className={`sentence-card ${sentence.isOwner ? 'my-sentence' : 'other-sentence'}`}>
      
      {/* Header */}
      <div className="card-header">
        {sentence.isOwner ? (
          <span className="badge badge-primary">جملتي</span>
        ) : (
          <span className="badge badge-secondary">جملة من مستخدم آخر</span>
        )}
        
        <div className="level-badge" style={{ backgroundColor: sentence.stats.level.color }}>
          {sentence.stats.level.name}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="edit-mode">
          <input 
            value={german} 
            onChange={(e) => setGerman(e.target.value)}
            placeholder="الجملة الألمانية"
          />
          <input 
            value={arabic} 
            onChange={(e) => setArabic(e.target.value)}
            placeholder="الترجمة العربية"
          />
          <div className="actions">
            <button onClick={handleSave}>حفظ</button>
            <button onClick={() => setIsEditing(false)}>إلغاء</button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <p className="german">{sentence.german}</p>
          <p className="arabic">{sentence.arabic}</p>
          
          {/* Stats */}
          <div className="stats">
            <span>الدقة: {sentence.stats.accuracy}%</span>
            <span>المراجعات: {sentence.reviewCount}</span>
            <span>المراجعة القادمة: بعد {sentence.stats.daysUntilNext} يوم</span>
          </div>

          {/* Actions - Only for Owner */}
          {sentence.isOwner && (
            <div className="actions">
              <button onClick={() => setIsEditing(true)}>
                ✏️ تعديل
              </button>
              <button onClick={handleDelete}>
                🗑️ حذف
              </button>
              <button onClick={toggleFavorite}>
                {sentence.favorite ? '⭐' : '☆'} مفضلة
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SentenceCard;
```

---

## 🧪 اختبار باستخدام Postman

### 1. تسجيل الدخول أولاً:
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

احفظ الـ `token` من الاستجابة.

### 2. استخدم الـ token في كل الطلبات:
- في Postman: `Authorization` > `Bearer Token` > الصق الـ token

### 3. جرب جميع العمليات:
- ✅ GET `/api/sentences` - يجب أن ترى جميع الجمل
- ✅ PUT `/api/sentences/YOUR_ID` - يجب أن ينجح
- ❌ PUT `/api/sentences/OTHER_ID` - يجب أن يفشل (403)
- ✅ DELETE `/api/sentences/YOUR_ID` - يجب أن ينجح
- ❌ DELETE `/api/sentences/OTHER_ID` - يجب أن يفشل (403)

---

## 📊 جدول ملخص العمليات

| العملية | Route | Method | يحتاج Auth | يحتاج Ownership | النتيجة |
|---------|-------|--------|-----------|----------------|---------|
| جلب جميع الجمل | `/api/sentences` | GET | ✅ | ❌ | جميع الجمل مع `isOwner` |
| جلب جملي | `/api/sentences/my-sentences` | GET | ✅ | ✅ | جملي فقط |
| إضافة جملة | `/api/sentences` | POST | ✅ | - | إضافة ناجحة |
| تعديل جملتي | `/api/sentences/:id` | PUT | ✅ | ✅ | تعديل ناجح |
| تعديل جملة آخر | `/api/sentences/:id` | PUT | ✅ | ❌ | 403 Forbidden |
| حذف جملتي | `/api/sentences/:id` | DELETE | ✅ | ✅ | حذف ناجح |
| حذف جملة آخر | `/api/sentences/:id` | DELETE | ✅ | ❌ | 403 Forbidden |
| مراجعة جملتي | `/api/sentences/:id/review` | POST | ✅ | ✅ | مراجعة ناجحة |
| مراجعة جملة آخر | `/api/sentences/:id/review` | POST | ✅ | ❌ | 403 Forbidden |

---

## ✅ الخلاصة

- **القراءة (Read)**: جميع المستخدمين يرون جميع الجمل
- **الكتابة (Write)**: فقط المالك يستطيع التعديل/الحذف
- **الأمان**: محقق في Backend بـ Middleware
- **UX**: `isOwner` يساعد Frontend في التحكم بالواجهة

**ملاحظة:** الأمان الحقيقي في Backend، Frontend فقط للعرض! 🔐
