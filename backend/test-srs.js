// ============================================
// 🧪 اختبار نظام SM-2
// ============================================
// هذا Script لاختبار الخوارزمية بشكل مستقل

const { updateCardState } = require('./srsController');

console.log('🧪 بدء اختبار خوارزمية SM-2...\n');

// ============================================
// اختبار 1: جملة جديدة - إجابة ممتازة
// ============================================
console.log('📝 اختبار 1: جملة جديدة → إجابة ممتازة');
const card1 = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0
};

const result1 = updateCardState(card1, 3, new Date());
console.log('النتيجة:', {
  interval: result1.interval,
  easeFactor: result1.easeFactor.toFixed(2),
  repetitions: result1.repetitions,
  reviewLevel: result1.reviewLevel
});
console.log('✅ متوقع: interval=1, easeFactor=2.65, repetitions=1, reviewLevel=learning\n');

// ============================================
// اختبار 2: تكرار ثاني - إجابة ممتازة
// ============================================
console.log('📝 اختبار 2: المرة الثانية → إجابة ممتازة');
const card2 = {
  interval: 1,
  easeFactor: 2.65,
  repetitions: 1
};

const result2 = updateCardState(card2, 3, new Date());
console.log('النتيجة:', {
  interval: result2.interval,
  easeFactor: result2.easeFactor.toFixed(2),
  repetitions: result2.repetitions,
  reviewLevel: result2.reviewLevel
});
console.log('✅ متوقع: interval=3, easeFactor=2.80, repetitions=2, reviewLevel=hard\n');

// ============================================
// اختبار 3: نمو أُسي - إجابة جيدة
// ============================================
console.log('📝 اختبار 3: المرة الثالثة → إجابة جيدة');
const card3 = {
  interval: 3,
  easeFactor: 2.8,
  repetitions: 2
};

const result3 = updateCardState(card3, 2, new Date());
console.log('النتيجة:', {
  interval: result3.interval,
  easeFactor: result3.easeFactor.toFixed(2),
  repetitions: result3.repetitions,
  reviewLevel: result3.reviewLevel
});
console.log('✅ متوقع: interval≈8, easeFactor=2.85, repetitions=3, reviewLevel=good\n');

// ============================================
// اختبار 4: خطأ كامل - إعادة تعيين
// ============================================
console.log('📝 اختبار 4: خطأ كامل → إعادة التعيين');
const card4 = {
  interval: 15,
  easeFactor: 2.9,
  repetitions: 5
};

const result4 = updateCardState(card4, 0, new Date());
console.log('النتيجة:', {
  interval: result4.interval,
  easeFactor: result4.easeFactor.toFixed(2),
  repetitions: result4.repetitions,
  reviewLevel: result4.reviewLevel,
  nextReview: 'بعد 10 دقائق'
});
console.log('✅ متوقع: interval=1, easeFactor=2.70, repetitions=0, reviewLevel=learning\n');

// ============================================
// اختبار 5: صعب - تقليل عامل السهولة
// ============================================
console.log('📝 اختبار 5: إجابة صعبة');
const card5 = {
  interval: 8,
  easeFactor: 2.8,
  repetitions: 3
};

const result5 = updateCardState(card5, 1, new Date());
console.log('النتيجة:', {
  interval: result5.interval,
  easeFactor: result5.easeFactor.toFixed(2),
  repetitions: result5.repetitions,
  reviewLevel: result5.reviewLevel
});
console.log('✅ متوقع: interval=1, easeFactor=2.65, repetitions=0, reviewLevel=learning\n');

// ============================================
// اختبار 6: نمو كبير - بطاقة متقنة
// ============================================
console.log('📝 اختبار 6: بطاقة متقنة → نمو كبير');
const card6 = {
  interval: 30,
  easeFactor: 3.0,
  repetitions: 8
};

const result6 = updateCardState(card6, 3, new Date());
console.log('النتيجة:', {
  interval: result6.interval,
  easeFactor: result6.easeFactor.toFixed(2),
  repetitions: result6.repetitions,
  reviewLevel: result6.reviewLevel
});
console.log('✅ متوقع: interval=90, easeFactor=3.00 (max), repetitions=9, reviewLevel=mastered\n');

// ============================================
// اختبار 7: الحد الأقصى للفاصل (365 يوم)
// ============================================
console.log('📝 اختبار 7: اختبار الحد الأقصى (365 يوم)');
const card7 = {
  interval: 200,
  easeFactor: 3.0,
  repetitions: 15
};

const result7 = updateCardState(card7, 3, new Date());
console.log('النتيجة:', {
  interval: result7.interval,
  easeFactor: result7.easeFactor.toFixed(2),
  repetitions: result7.repetitions,
  reviewLevel: result7.reviewLevel
});
console.log('✅ متوقع: interval=365 (max), easeFactor=3.00, repetitions=16, reviewLevel=mastered\n');

// ============================================
// الخلاصة
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 جميع الاختبارات اكتملت!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n✅ إذا كانت النتائج مطابقة للمتوقع، الخوارزمية تعمل بشكل صحيح!\n');
