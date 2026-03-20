import React, { useEffect, useState } from 'react';
import './MotivationalMessages.css';

// Motivational quotes in German
const motivationalQuotes = [
  { ar: 'Nicht aufgeben! Jeder Fehler ist eine Lernchance.', emoji: '💪', color: '#3b82f6' },
  { ar: 'Große Leistungen entstehen nach vielen Rückschlägen.', emoji: '🌟', color: '#8b5cf6' },
  { ar: 'Wiederholung ist der Schlüssel zur Meisterschaft.', emoji: '🔄', color: '#10b981' },
  { ar: 'Jeder Versuch bringt Sie dem Ziel näher.', emoji: '🎯', color: '#f59e0b' },
  { ar: 'Sie verlieren nicht – Sie lernen!', emoji: '📚', color: '#ec4899' },
  { ar: 'Fehler sind der Beginn des Erfolgs.', emoji: '🌱', color: '#14b8a6' },
  { ar: 'Versuchen Sie es erneut – Sie sind stärker als Sie denken.', emoji: '🦁', color: '#f97316' },
  { ar: 'Ein Fehler ist ein Schritt in Richtung Exzellenz.', emoji: '✨', color: '#6366f1' },
  { ar: 'Keine Sorge – Sie werden es bald beherrschen.', emoji: '🚀', color: '#0ea5e9' },
  { ar: 'Jeder Experte war einmal ein Anfänger.', emoji: '👑', color: '#a855f7' },
  { ar: 'Weitermachen! Sie kommen voran, auch wenn Sie es nicht spüren.', emoji: '⚡', color: '#eab308' },
  { ar: 'Geduld und Übung sind das Geheimnis des Erfolgs.', emoji: '🎓', color: '#22c55e' }
];

const quickEncouragement = [
  { text: 'Nochmal versuchen!', emoji: '🔄' },
  { text: 'Kein Problem!', emoji: '😊' },
  { text: 'Weitermachen!', emoji: '💪' },
  { text: 'Aus Fehlern lernen!', emoji: '📝' },
  { text: 'Sie verbessern sich!', emoji: '📈' },
];

const practicalTips = [
  'Schreiben Sie den Satz 3-mal auf',
  'Hören Sie die Aussprache mehrmals',
  'Wiederholen Sie diesen Satz morgen',
  'Verknüpfen Sie den Satz mit einem Erlebnis',
  'Teilen Sie den Satz in kleine Teile auf',
];

export function MotivationalMessage({ show, onComplete, type = 'full' }) {
  const [message, setMessage] = useState(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    if (show) {
      const randomMessage = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setMessage(randomMessage);

      if (Math.random() > 0.5) {
        const randomTip = practicalTips[Math.floor(Math.random() * practicalTips.length)];
        setTip(randomTip);
      }

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
      <div className="motivational-card" style={{ '--accent-color': message.color }}>
        <div className="motivational-emoji">{message.emoji}</div>
        <div className="motivational-text">{message.ar}</div>
        {tip && (
          <div className="motivational-tip">
            <span className="tip-icon">💡</span>
            <span className="tip-text">{tip}</span>
          </div>
        )}
        <div className="motivational-progress">
          <div className="progress-bar"></div>
        </div>
      </div>

      <div className="motivational-particles">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{ '--delay': `${i * 0.15}s`, '--x': `${Math.random() * 100}%` }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickEncouragement({ show, onComplete }) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (show) {
      const randomMsg = quickEncouragement[Math.floor(Math.random() * quickEncouragement.length)];
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

export function GentleShake({ show, children }) {
  return (
    <div className={show ? 'gentle-shake-animation' : ''}>
      {children}
    </div>
  );
}

export default MotivationalMessage;
