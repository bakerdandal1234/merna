# ⚡ مرجع سريع - نظام الصلاحيات

## 📌 الملخص في 30 ثانية

```
✅ المستخدم يرى: جمله + جمل الآخرين
✅ المستخدم يعدل/يحذف/يراجع: جمله فقط
❌ المستخدم لا يستطيع: تعديل/حذف/مراجعة جمل الآخرين
```

---

## 🔧 التطبيق السريع

```bash
# 1. نسخة احتياطية
cp backend/server.js backend/server_backup.js

# 2. استبدال الكود
cp backend/server_updated.js backend/server.js

# 3. التحقق من Middleware
ls backend/middleware/checkOwnership.js

# 4. إعادة التشغيل
cd backend && npm start
```

---

## 📡 API السريع

### جلب الجمل:
```http
GET /api/sentences              # كل الجمل
GET /api/sentences?view=my      # جملي فقط
GET /api/sentences?view=others  # جمل الآخرين فقط
```

### إضافة جملة:
```http
POST /api/sentences
Body: { "german": "...", "arabic": "..." }
```

### تعديل جملة (محمي):
```http
PUT /api/sentences/:id
Body: { "arabic": "..." }
```

### حذف جملة (محمي):
```http
DELETE /api/sentences/:id
```

### مراجعة جملة (محمي):
```http
POST /api/sentences/:id/review
Body: { "quality": 0-3 }
```

---

## 📊 Response Format

```json
{
  "_id": "...",
  "german": "Guten Tag",
  "arabic": "مساء الخير",
  "userId": "...",
  
  "isOwner": true,     // ⭐ جديد
  "canEdit": true,      // ⭐ جديد
  "canDelete": true,    // ⭐ جديد
  
  "stats": { ... }
}
```

---

## 🎯 Middleware Flow

```
Request
   ↓
protect (تحقق من Token)
   ↓
checkOwnership (تحقق من الملكية) ← فقط للـ UPDATE/DELETE/REVIEW
   ↓
Controller
   ↓
Response
```

---

## ✅ الصلاحيات

| العملية | جملتك | جملة آخر | Code |
|---------|--------|----------|------|
| Read    | ✅     | ✅       | 200  |
| Create  | ✅     | -        | 201  |
| Update  | ✅     | ❌       | 200/403 |
| Delete  | ✅     | ❌       | 200/403 |
| Review  | ✅     | ❌       | 200/403 |

---

## 🧪 اختبار سريع

```bash
# 1. جلب كل الجمل
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/sentences

# 2. تعديل جملتك (✅ نجاح)
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"arabic":"نص جديد"}' \
  http://localhost:3000/api/sentences/YOUR_ID

# 3. تعديل جملة آخر (❌ فشل 403)
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"arabic":"هاك"}' \
  http://localhost:3000/api/sentences/OTHER_ID
```

---

## 💻 Frontend Code

```jsx
// ✅ استخدام الحقول الجاهزة
function SentenceCard({ sentence }) {
  return (
    <div>
      <h3>{sentence.german}</h3>
      <p>{sentence.arabic}</p>
      
      {sentence.canEdit && (
        <button onClick={() => edit(sentence._id)}>
          ✏️ تعديل
        </button>
      )}
      
      {sentence.canDelete && (
        <button onClick={() => del(sentence._id)}>
          🗑️ حذف
        </button>
      )}
      
      {!sentence.isOwner && (
        <span>📖 من مستخدم آخر</span>
      )}
    </div>
  );
}
```

---

## 🔥 Status Codes

```
200 OK           - العملية نجحت
201 Created      - تم الإنشاء بنجاح
400 Bad Request  - بيانات خاطئة
401 Unauthorized - Token غير صحيح
403 Forbidden    - لا تملك الصلاحية
404 Not Found    - الجملة غير موجودة
500 Server Error - خطأ في السيرفر
```

---

## 📚 الملفات

```
backend/
  ├── middleware/
  │   └── checkOwnership.js   ⭐ جديد
  ├── server.js               ✏️ محدّث
  └── server_updated.js       📄 نسخة جديدة

مجلد المشروع/
  ├── AUTHORIZATION_GUIDE.md  (دليل كامل)
  ├── COMPARISON.md           (مقارنة)
  ├── TESTING_GUIDE.md        (اختبار)
  ├── VISUAL_GUIDE.md         (شرح مرئي)
  └── README_AUTHORIZATION.md (readme كامل)
```

---

## 🚨 أخطاء شائعة

### خطأ: Token غير صالح
```json
{"success": false, "message": "غير مصرح"}
```
**الحل:** تحقق من Authorization Header

### خطأ: الحساب غير مفعّل
```json
{"success": false, "message": "يرجى تفعيل حسابك"}
```
**الحل:** فعّل الحساب من الإيميل

### خطأ: 403 Forbidden
```json
{"success": false, "message": "🚫 غير مسموح!"}
```
**الحل:** هذا طبيعي - تحاول تعديل جملة لا تملكها

---

## 📖 أدلة مفصلة

| الملف | الوصف | متى تقرأه |
|-------|-------|-----------|
| `AUTHORIZATION_GUIDE.md` | دليل كامل | للفهم الشامل |
| `COMPARISON.md` | مقارنة القديم/الجديد | لفهم التحسينات |
| `TESTING_GUIDE.md` | سيناريوهات اختبار | قبل الاختبار |
| `VISUAL_GUIDE.md` | شرح مرئي | للفهم المرئي |
| `README_AUTHORIZATION.md` | readme كامل | نظرة شاملة |

---

## ⚡ Tips سريعة

1. **استخدم `isOwner`** بدلاً من مقارنة `userId`
2. **أخفِ الأزرار** بدلاً من تعطيلها
3. **أضف رسائل واضحة** للجمل غير المملوكة
4. **اختبر دائماً** قبل الـ production

---

## 🎯 Checklist

- [ ] نسخة احتياطية ✓
- [ ] Middleware موجود ✓
- [ ] server.js محدّث ✓
- [ ] السيرفر يعمل ✓
- [ ] اختبار Read ✓
- [ ] اختبار Update (نجاح) ✓
- [ ] اختبار Update (فشل) ✓
- [ ] Frontend محدّث ✓

---

**انتهى! ⚡**

هذا كل ما تحتاجه في صفحة واحدة.
