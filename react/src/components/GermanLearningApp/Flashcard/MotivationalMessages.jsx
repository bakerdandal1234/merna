import React, { useEffect, useState } from 'react';
import './MotivationalMessages.css';

// 💪 رسائل تحفيزية متنوعة
const motivationalQuotes = [
  {
    ar: 'لا تستسلم! كل خطأ هو فرصة للتعلم',
    emoji: '💪',
    color: '#3b82f6'
  },
  {
    ar: 'العظماء فشلوا مرات عديدة قبل النجاح',
    emoji: '🌟',
    color: '#8b5cf6'
  },
  {
    ar: 'التكرار هو أساس الإتقان',
    emoji: '🔄',
    color: '#10b981'
  },
  {
    ar: 'كل محاولة تقربك من الهدف',
    emoji: '🎯',
    color: '#f59e0b'
  },
  {
    ar: 'لم تخسر، أنت تتعلم!',
    emoji: '📚',
    color: '#ec4899'
  },
  {
    ar: 'الفشل هو النجاح في طور التكوين',
    emoji: '🌱',
    color: '#14b8a6'
  },
  {
    ar: 'حاول مرة أخرى، أنت أقوى مما تظن',
    emoji: '🦁',
    color: '#f97316'
  },
  {
    ar: 'الخطأ خطوة نحو التميز',
    emoji: '✨',
    color: '#6366f1'
  },
  {
    ar: 'لا تقلق، سوف تتقنها قريباً',
    emoji: '🚀',
    color: '#0ea5e9'
  },
  {
    ar: 'كل خبير كان مبتدئاً يوماً ما',
    emoji: '👑',
    color: '#a855f7'
  },
  {
    ar: 'استمر! أنت تتقدم حتى لو لم تشعر بذلك',
    emoji: '⚡',
    color: '#eab308'
  },
  {
    ar: 'الصبر والممارسة سر النجاح',
    emoji: '🎓',
    color: '#22c55e'
  }
];

// 🎨 رسائل قصيرة ومباشرة
const quickEncouragement = [
  { text: 'حاول مرة أخرى!', emoji: '🔄' },
  { text: 'لا بأس!', emoji: '😊' },
  { text: 'استمر!', emoji: '💪' },
  { text: 'تعلم من الخطأ!', emoji: '📝' },
  { text: 'أنت تتحسن!', emoji: '📈' },
];

// 💡 نصائح عملية
const practicalTips = [
  'جرّب كتابة الجملة 3 مرات',
  'استمع للنطق عدة مرات',
  'راجع هذه الجملة غداً',
  'اربط الجملة بموقف من حياتك',
  'قسّم الجملة لأجزاء صغيرة',
];

// Component رئيسي للرسائل التحفيزية
export function MotivationalMessage({ show, onComplete, type = 'full' }) {
  const [message, setMessage] = useState(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    if (show) {
      // اختيار رسالة عشوائية
      const randomMessage = motivationalQuotes[
        Math.floor(Math.random() * motivationalQuotes.length)
      ];
      setMessage(randomMessage);

      // إضافة نصيحة عملية أحياناً (50% احتمال)
      if (Math.random() > 0.5) {
        const randomTip = practicalTips[
          Math.floor(Math.random() * practicalTips.length)
        ];
        setTip(randomTip);
      }

      // إخفاء الرسالة بعد 3 ثواني
      const timer = setTimeout(() => {
        setMessage(null);
        setTip(null);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!message) return null;

  return (
    <div className="motivational-overlay">
      <div 
        className="motivational-card"
        style={{ '--accent-color': message.color }}
      >
        {/* Emoji كبير */}
        <div className="motivational-emoji">
          {message.emoji}
        </div>

        {/* الرسالة التحفيزية */}
        <div className="motivational-text">
          {message.ar}
        </div>

        {/* نصيحة عملية (اختياري) */}
        {tip && (
          <div className="motivational-tip">
            <span className="tip-icon">💡</span>
            <span className="tip-text">{tip}</span>
          </div>
        )}

        {/* خط تقدم الوقت */}
        <div className="motivational-progress">
          <div className="progress-bar"></div>
        </div>
      </div>

      {/* تأثيرات الخلفية */}
      <div className="motivational-particles">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{ 
              '--delay': `${i * 0.15}s`,
              '--x': `${Math.random() * 100}%`,
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
}

// Component بسيط للرسائل السريعة
export function QuickEncouragement({ show, onComplete }) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (show) {
      const randomMsg = quickEncouragement[
        Math.floor(Math.random() * quickEncouragement.length)
      ];
      setMessage(randomMsg);

      const timer = setTimeout(() => {
        setMessage(null);
        if (onComplete) onComplete();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!message) return null;

  return (
    <div className="quick-encouragement">
      <span className="quick-emoji">{message.emoji}</span>
      <span className="quick-text">{message.text}</span>
    </div>
  );
}

// Component مع اهتزاز لطيف
export function GentleShake({ show, children }) {
  return (
    <div className={show ? 'gentle-shake-animation' : ''}>
      {children}
    </div>
  );
}

export default MotivationalMessage;
