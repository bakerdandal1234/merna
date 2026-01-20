import React, { useEffect, useState } from 'react';
import './CelebrationEffects.css';

// رسائل تحفيزية عشوائية
const motivationalMessages = [
  { ar: 'رائع! 🌟', en: 'Amazing!' },
  { ar: 'ممتاز! ⭐', en: 'Excellent!' },
  { ar: 'أحسنت! 👏', en: 'Well Done!' },
  { ar: 'مذهل! ✨', en: 'Fantastic!' },
  { ar: 'عبقري! 🧠', en: 'Brilliant!' },
  { ar: 'رهيب! 🔥', en: 'Awesome!' },
  { ar: 'متألق! 💫', en: 'Stellar!' },
  { ar: 'إنت نجم! ⭐', en: 'You\'re a Star!' },
];

// تأثير الكونفيتي
export function ConfettiEffect({ show, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      // إنشاء 50 قطعة كونفيتي
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.5 + Math.random() * 1,
        color: ['#f59f08', '#10b981', '#2196f3', '#ec4899', '#8b5cf6', '#fbbf24'][
          Math.floor(Math.random() * 6)
        ],
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8,
      }));
      
      setParticles(newParticles);

      // مسح الكونفيتي بعد انتهاء الأنيميشن
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="confetti-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti-piece"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
}

// رسالة تحفيزية منبثقة
export function MotivationalMessage({ show, onComplete }) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (show) {
      const randomMessage = motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];
      setMessage(randomMessage);

      const timer = setTimeout(() => {
        setMessage(null);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!message) return null;

  return (
    <div className="motivational-message">
      <div className="message-content">
        <div className="message-ar">{message.ar}</div>
        <div className="message-en">{message.en}</div>
      </div>
    </div>
  );
}

// نجوم متطايرة
export function FloatingStars({ show, onComplete }) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (show) {
      const newStars = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (i * 360) / 12,
        delay: i * 0.05,
      }));
      
      setStars(newStars);

      const timer = setTimeout(() => {
        setStars([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show || stars.length === 0) return null;

  return (
    <div className="floating-stars-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="floating-star"
          style={{
            '--angle': `${star.angle}deg`,
            animationDelay: `${star.delay}s`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
}

// عداد الإنجازات المنبثق
export function AchievementPopup({ show, streak, onComplete }) {
  useEffect(() => {
    if (show && streak > 0) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, streak, onComplete]);

  if (!show || streak === 0) return null;

  // رسائل خاصة للكومبو
  const getComboMessage = () => {
    if (streak >= 10) return { text: 'أسطورة! 👑', emoji: '⚡️', color: '#ec4899' };
    if (streak >= 5) return { text: 'إنت نار! 🔥', emoji: '🔥', color: '#f59f08' };
    if (streak >= 3) return { text: 'كومبو رائع! ✨', emoji: '✨', color: '#10b981' };
    return { text: 'استمر! 💪', emoji: '💪', color: '#2196f3' };
  };

  const combo = getComboMessage();

  return (
    <div className="achievement-popup" style={{ '--combo-color': combo.color }}>
      <div className="achievement-content">
        <div className="combo-emoji">{combo.emoji}</div>
        <div className="combo-text">{combo.text}</div>
        <div className="combo-counter">
          <span className="combo-number">{streak}</span>
          <span className="combo-label">متتالية</span>
        </div>
      </div>
    </div>
  );
}

// تأثير الموجة اللونية
export function ColorWave({ show, onComplete }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return <div className="color-wave" />;
}

// مكون شامل لكل التأثيرات
export function CelebrationEffects({ show, streak = 1, onComplete }) {
  const [effects, setEffects] = useState({
    confetti: false,
    message: false,
    stars: false,
    achievement: false,
    wave: false,
  });

  useEffect(() => {
    if (show) {
      // بدء التأثيرات بالتتابع
      setEffects({
        confetti: true,
        message: true,
        stars: true,
        achievement: streak >= 3,
        wave: true,
      });

      // إنهاء كل التأثيرات
      const timer = setTimeout(() => {
        setEffects({
          confetti: false,
          message: false,
          stars: false,
          achievement: false,
          wave: false,
        });
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show, streak, onComplete]);

  return (
    <>
      <ColorWave show={effects.wave} />
      <ConfettiEffect show={effects.confetti} />
      <FloatingStars show={effects.stars} />
      <MotivationalMessage show={effects.message} />
      <AchievementPopup show={effects.achievement} streak={streak} />
    </>
  );
}

export default CelebrationEffects;
