import React, { useEffect, useState } from 'react';
import './CelebrationEffectsMinimal.css';

// رسائل تحفيزية قصيرة
const quickMessages = [
  '✨', '⭐', '🌟', '💫', '✅', '🎯', '👏', '🔥'
];

const motivationalMessages = [
  { ar: 'رائع!', en: 'Great!' },
  { ar: 'ممتاز!', en: 'Excellent!' },
  { ar: 'أحسنت!', en: 'Well Done!' },
  { ar: 'مذهل!', en: 'Amazing!' },
];

// تأثير بسيط - نجمة واحدة تنفجر
export function SimpleStar({ show, onComplete }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="simple-star-container">
      <div className="simple-star">⭐</div>
      <div className="star-particles">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="star-particle" style={{ '--angle': `${i * 60}deg` }}>
            ✨
          </div>
        ))}
      </div>
    </div>
  );
}

// رسالة سريعة - emoji فقط
export function QuickEmoji({ show, onComplete }) {
  const [emoji, setEmoji] = useState('✨');

  useEffect(() => {
    if (show) {
      setEmoji(quickMessages[Math.floor(Math.random() * quickMessages.length)]);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="quick-emoji">
      {emoji}
    </div>
  );
}

// كونفيتي بسيط (فقط للكومبو 3+)
export function MiniConfetti({ show, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      // فقط 15 قطعة - خفيف وسريع
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: 30 + Math.random() * 40, // من المنتصف فقط
        delay: Math.random() * 0.2,
        color: ['#f59f08', '#10b981', '#2196f3'][Math.floor(Math.random() * 3)],
      }));
      
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="mini-confetti-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="mini-confetti"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            backgroundColor: particle.color,
          }}
        />
      ))}
    </div>
  );
}

// رسالة تحفيزية صغيرة (فقط للكومبو 3+)
export function MiniMessage({ show, streak, onComplete }) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (show && streak >= 3) {
      const randomMessage = motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];
      setMessage(randomMessage);

      const timer = setTimeout(() => {
        setMessage(null);
        if (onComplete) onComplete();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [show, streak, onComplete]);

  if (!message) return null;

  return (
    <div className="mini-message">
      <div className="mini-message-ar">{message.ar}</div>
    </div>
  );
}

// احتفال كبير (فقط للكومبو 10+)
export function BigCelebration({ show, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        color: ['#f59f08', '#10b981', '#2196f3', '#ec4899', '#8b5cf6'][
          Math.floor(Math.random() * 5)
        ],
      }));
      
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <>
      <div className="big-celebration-bg" />
      <div className="big-celebration-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="big-confetti"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>
      <div className="big-celebration-message">
        <div className="big-emoji">👑</div>
        <div className="big-text-ar">أسطورة!</div>
        <div className="big-text-en">LEGENDARY!</div>
      </div>
    </>
  );
}

// المكون الرئيسي - ذكي وخفيف
export function SmartCelebration({ show, streak = 1, onComplete }) {
  const [effects, setEffects] = useState({
    star: false,
    emoji: false,
    confetti: false,
    message: false,
    big: false,
  });

  useEffect(() => {
    if (show) {
      if (streak >= 10) {
        // احتفال كبير فقط
        setEffects({ star: false, emoji: false, confetti: false, message: false, big: true });
      } else if (streak >= 3) {
        // احتفال متوسط
        setEffects({ star: true, emoji: false, confetti: true, message: true, big: false });
      } else {
        // احتفال بسيط
        setEffects({ star: true, emoji: true, confetti: false, message: false, big: false });
      }

      const timer = setTimeout(() => {
        setEffects({ star: false, emoji: false, confetti: false, message: false, big: false });
        if (onComplete) onComplete();
      }, streak >= 10 ? 2000 : streak >= 3 ? 1500 : 800);

      return () => clearTimeout(timer);
    }
  }, [show, streak, onComplete]);

  return (
    <>
      {effects.star && <SimpleStar show={effects.star} />}
      {effects.emoji && <QuickEmoji show={effects.emoji} />}
      {effects.confetti && <MiniConfetti show={effects.confetti} />}
      {effects.message && <MiniMessage show={effects.message} streak={streak} />}
      {effects.big && <BigCelebration show={effects.big} />}
    </>
  );
}

export default SmartCelebration;
