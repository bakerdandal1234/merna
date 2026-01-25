// ============================================
// اختبار نظام SM-2 المحسّن
// ============================================
const { updateCardState } = require('./srsController');

console.log('🧪 اختبار نظام SM-2 المحسّن\n');
console.log('='  .repeat(60));

// بطاقة تجريبية
const testCard = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0
};

// ============================================
// اختبار 1: Again (Quality 0)
// ============================================
console.log('\n🔴 اختبار 1: Again (Quality 0)');
console.log('-'.repeat(60));

const againResult = updateCardState({ ...testCard }, 0);
console.log('النتيجة:');
console.log(`  - interval: ${againResult.interval} (متوقع: 0 = 10 دقائق)`);
console.log(`  - easeFactor: ${againResult.easeFactor.toFixed(2)} (متوقع: 2.30)`);
console.log(`  - repetitions: ${againResult.repetitions} (متوقع: 0)`);
console.log(`  - reviewLevel: ${againResult.reviewLevel} (متوقع: new)`);
console.log(`  - nextReview: ${againResult.nextReview.toLocaleString('ar-EG')}`);

const minutesDiff = Math.round((againResult.nextReview - new Date()) / 1000 / 60);
console.log(`  - الفرق: ${minutesDiff} دقيقة (متوقع: ~10 دقائق)`);

if (againResult.interval === 0 && againResult.repetitions === 0) {
  console.log('✅ PASS: Again يعمل بشكل صحيح');
} else {
  console.log('❌ FAIL: Again لا يعمل بشكل صحيح');
}

// ============================================
// اختبار 2: Hard (Quality 1)
// ============================================
console.log('\n🟡 اختبار 2: Hard (Quality 1)');
console.log('-'.repeat(60));

const hardResult = updateCardState({ ...testCard }, 1);
console.log('النتيجة:');
console.log(`  - interval: ${hardResult.interval} (متوقع: 1 يوم)`);
console.log(`  - easeFactor: ${hardResult.easeFactor.toFixed(2)} (متوقع: 2.35)`);
console.log(`  - repetitions: ${hardResult.repetitions} (متوقع: 0)`);
console.log(`  - reviewLevel: ${hardResult.reviewLevel} (متوقع: learning)`);
console.log(`  - nextReview: ${hardResult.nextReview.toLocaleDateString('ar-EG')}`);

if (hardResult.interval === 1 && hardResult.repetitions === 0) {
  console.log('✅ PASS: Hard يعمل بشكل صحيح');
} else {
  console.log('❌ FAIL: Hard لا يعمل بشكل صحيح');
}

// ============================================
// اختبار 3: Good (Quality 2) - 3 مراجعات
// ============================================
console.log('\n🟢 اختبار 3: Good (Quality 2) - سلسلة مراجعات');
console.log('-'.repeat(60));

let goodCard = { ...testCard };

// المراجعة الأولى
console.log('\n📝 المراجعة الأولى (Good):');
const good1 = updateCardState(goodCard, 2);
console.log(`  - interval: ${good1.interval} (متوقع: 1 يوم)`);
console.log(`  - easeFactor: ${good1.easeFactor.toFixed(2)} (متوقع: 2.50)`);
console.log(`  - repetitions: ${good1.repetitions} (متوقع: 1)`);

// المراجعة الثانية
console.log('\n📝 المراجعة الثانية (Good):');
goodCard = { interval: good1.interval, easeFactor: good1.easeFactor, repetitions: good1.repetitions };
const good2 = updateCardState(goodCard, 2);
console.log(`  - interval: ${good2.interval} (متوقع: 3 أيام)`);
console.log(`  - easeFactor: ${good2.easeFactor.toFixed(2)} (متوقع: 2.50)`);
console.log(`  - repetitions: ${good2.repetitions} (متوقع: 2)`);

// المراجعة الثالثة
console.log('\n📝 المراجعة الثالثة (Good):');
goodCard = { interval: good2.interval, easeFactor: good2.easeFactor, repetitions: good2.repetitions };
const good3 = updateCardState(goodCard, 2);
console.log(`  - interval: ${good3.interval} (متوقع: ~8 أيام)`);
console.log(`  - easeFactor: ${good3.easeFactor.toFixed(2)} (متوقع: 2.50)`);
console.log(`  - repetitions: ${good3.repetitions} (متوقع: 3)`);

if (good1.interval === 1 && good2.interval === 3 && good3.interval >= 7) {
  console.log('\n✅ PASS: Good progression صحيحة');
} else {
  console.log('\n❌ FAIL: Good progression خاطئة');
}

// ============================================
// اختبار 4: Excellent (Quality 3) - 3 مراجعات
// ============================================
console.log('\n🔵 اختبار 4: Excellent (Quality 3) - سلسلة مراجعات');
console.log('-'.repeat(60));

let excellentCard = { ...testCard };

// المراجعة الأولى
console.log('\n📝 المراجعة الأولى (Excellent):');
const exc1 = updateCardState(excellentCard, 3);
console.log(`  - interval: ${exc1.interval} (متوقع: 3 أيام)`);
console.log(`  - easeFactor: ${exc1.easeFactor.toFixed(2)} (متوقع: 2.65)`);
console.log(`  - repetitions: ${exc1.repetitions} (متوقع: 1)`);

// المراجعة الثانية
console.log('\n📝 المراجعة الثانية (Excellent):');
excellentCard = { interval: exc1.interval, easeFactor: exc1.easeFactor, repetitions: exc1.repetitions };
const exc2 = updateCardState(excellentCard, 3);
console.log(`  - interval: ${exc2.interval} (متوقع: 7 أيام)`);
console.log(`  - easeFactor: ${exc2.easeFactor.toFixed(2)} (متوقع: 2.80)`);
console.log(`  - repetitions: ${exc2.repetitions} (متوقع: 2)`);

// المراجعة الثالثة
console.log('\n📝 المراجعة الثالثة (Excellent):');
excellentCard = { interval: exc2.interval, easeFactor: exc2.easeFactor, repetitions: exc2.repetitions };
const exc3 = updateCardState(excellentCard, 3);
console.log(`  - interval: ${exc3.interval} (متوقع: ~29 يوم)`);
console.log(`  - easeFactor: ${exc3.easeFactor.toFixed(2)} (متوقع: 2.95)`);
console.log(`  - repetitions: ${exc3.repetitions} (متوقع: 3)`);

if (exc1.interval === 3 && exc2.interval === 7 && exc3.interval >= 25) {
  console.log('\n✅ PASS: Excellent progression صحيحة');
} else {
  console.log('\n❌ FAIL: Excellent progression خاطئة');
}

// ============================================
// اختبار 5: مقارنة Again vs Hard vs Good vs Excellent
// ============================================
console.log('\n📊 اختبار 5: مقارنة الأزرار الأربعة');
console.log('-'.repeat(60));

const baseCard = { interval: 7, easeFactor: 2.5, repetitions: 3 };

const againTest = updateCardState({ ...baseCard }, 0);
const hardTest = updateCardState({ ...baseCard }, 1);
const goodTest = updateCardState({ ...baseCard }, 2);
const excellentTest = updateCardState({ ...baseCard }, 3);

console.log('\nبطاقة حالية: interval=7 أيام, ease=2.5, reps=3\n');

console.log('❌ Again:');
console.log(`  → interval: ${againTest.interval} (10 دقائق)`);
console.log(`  → easeFactor: ${againTest.easeFactor.toFixed(2)}`);
console.log(`  → repetitions: ${againTest.repetitions}`);

console.log('\n😅 Hard:');
console.log(`  → interval: ${hardTest.interval} يوم`);
console.log(`  → easeFactor: ${hardTest.easeFactor.toFixed(2)}`);
console.log(`  → repetitions: ${hardTest.repetitions}`);

console.log('\n👍 Good:');
console.log(`  → interval: ${goodTest.interval} أيام`);
console.log(`  → easeFactor: ${goodTest.easeFactor.toFixed(2)}`);
console.log(`  → repetitions: ${goodTest.repetitions}`);

console.log('\n⭐ Excellent:');
console.log(`  → interval: ${excellentTest.interval} أيام`);
console.log(`  → easeFactor: ${excellentTest.easeFactor.toFixed(2)}`);
console.log(`  → repetitions: ${excellentTest.repetitions}`);

// التحقق من أن الفواصل مختلفة
const allDifferent = 
  againTest.interval !== hardTest.interval &&
  hardTest.interval !== goodTest.interval &&
  goodTest.interval !== excellentTest.interval &&
  excellentTest.interval > goodTest.interval;

if (allDifferent) {
  console.log('\n✅ PASS: جميع الفواصل مختلفة بشكل صحيح');
} else {
  console.log('\n❌ FAIL: بعض الفواصل متشابهة!');
}

// ============================================
// الخلاصة النهائية
// ============================================
console.log('\n' + '='.repeat(60));
console.log('🎉 انتهى الاختبار!');
console.log('='  .repeat(60));
console.log('\n📝 ملخص التوقعات الصحيحة:');
console.log('  - Again: 10 دقائق (interval = 0)');
console.log('  - Hard: 1 يوم');
console.log('  - Good: 1 → 3 → ~8 أيام');
console.log('  - Excellent: 3 → 7 → ~29 يوم');
console.log('\n✨ إذا رأيت جميع PASS فالنظام يعمل بشكل صحيح!\n');
