import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDueSentences, getLevelDetails, getMotivationalMessage } from '../../../utils/srsUtils';
import './FlashcardNew.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://merna-ugyu.onrender.com/api';

export default function FlashcardView({ sentences, onUpdate, showOnlyDue = true }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(false);
  const [animation, setAnimation] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [correctStreak, setCorrectStreak] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const cardRef = useRef(null);

  // تصفية الجمل
  const filteredSentences = React.useMemo(() => {
    let filtered = sentences;
    
    if (showOnlyDue) {
      filtered = getDueSentences(filtered);
    }
    
    return filtered;
  }, [sentences, showOnlyDue]);

  useEffect(() => {
    setCurrentCardIndex(0);
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
    setCorrectStreak(0);
  }, [sentences]);

  useEffect(() => {
    if (currentCardIndex >= filteredSentences.length && filteredSentences.length > 0) {
      setCurrentCardIndex(0);
    }
  }, [filteredSentences.length, currentCardIndex]);

  const currentCard = filteredSentences[currentCardIndex];

  const nextCard = useCallback(() => {
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
    setCurrentCardIndex(prev => 
      prev < filteredSentences.length - 1 ? prev + 1 : 0
    );
  }, [filteredSentences.length]);

  const prevCard = useCallback(() => {
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
    setCurrentCardIndex(prev => 
      prev > 0 ? prev - 1 : filteredSentences.length - 1
    );
  }, [filteredSentences.length]);

  // دالة المراجعة الرئيسية مع نظام SM-2
  const handleReview = useCallback(async (quality) => {
    if (!currentCard || isReviewing) return;

    setIsReviewing(true);

    // تحديد نوع الأنيميشن
    if (quality >= 2) {
      setAnimation('correct-animation');
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setShowCelebration(true);
      
      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      setAnimation('shake-animation');
      setCorrectStreak(0);
    }

    // رسالة تحفيزية
    const message = getMotivationalMessage(quality, quality >= 2 ? correctStreak + 1 : 0);
    setMotivationMessage(message);
    setShowMotivation(true);
    setTimeout(() => setShowMotivation(false), 3000);

    try {
      // استدعاء API الجديد
      const response = await fetch(`${API_URL}/sentences/${currentCard._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality })
      });

      if (!response.ok) throw new Error('فشل في تحديث البطاقة');

      const data = await response.json();
      
      // تحديث البيانات
      if (onUpdate) {
        onUpdate();
      }

      // الانتقال للبطاقة التالية
      setTimeout(() => {
        setAnimation('');
        nextCard();
        setIsReviewing(false);
      }, 1000);

    } catch (error) {
      console.error('خطأ في المراجعة:', error);
      setAnimation('');
      setIsReviewing(false);
    }
  }, [currentCard, correctStreak, nextCard, onUpdate, isReviewing]);

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
    setShowArabic(!showArabic);
  }, [isFlipped, showArabic]);

  const handleKeyPress = useCallback((e) => {
    if (isReviewing) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'ArrowLeft') {
      prevCard();
    } else if (e.key === 'ArrowRight') {
      nextCard();
    } else if (showArabic) {
      // اختصارات لوحة المفاتيح
      if (e.key === '0') handleReview(0);
      else if (e.key === '1') handleReview(1);
      else if (e.key === '2') handleReview(2);
      else if (e.key === '3') handleReview(3);
    }
  }, [isReviewing, showArabic, handleFlip, handleReview, nextCard, prevCard]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!currentCard) {
    return (
      <div className="flashcard-container">
        <div className="flashcard-empty">
          <div className="empty-icon">🎉</div>
          <h2>أحسنت! لا توجد بطاقات للمراجعة الآن</h2>
          <p>عد لاحقاً أو أضف جمل جديدة</p>
        </div>
      </div>
    );
  }

  const levelDetails = getLevelDetails(currentCard.interval || 0);
  const stats = currentCard.stats || {};

  return (
    <div className="flashcard-container">
      {/* شريط التقدم */}
      <div className="flashcard-progress">
        <div className="progress-info">
          <span>{currentCardIndex + 1} / {filteredSentences.length}</span>
          {correctStreak > 0 && (
            <span className="streak-indicator">
              🔥 {correctStreak}
            </span>
          )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentCardIndex + 1) / filteredSentences.length) * 100}%` }}
          />
        </div>
      </div>

      {/* البطاقة */}
      <div 
        ref={cardRef}
        className={`flashcard ${animation} ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-inner">
          {/* الوجه الأمامي */}
          <div className="flashcard-front">
            <div className="level-badge" style={{ backgroundColor: levelDetails.color }}>
              <span className="badge-emoji">{levelDetails.emoji}</span>
              <span className="badge-text">{levelDetails.text}</span>
            </div>
            
            <div className="card-content">
              <p className="german-text">{currentCard.german}</p>
              
              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-label">المراجعات</span>
                  <span className="stat-value">{currentCard.reviewCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">الدقة</span>
                  <span className="stat-value">
                    {currentCard.reviewCount > 0 
                      ? `${Math.round((currentCard.correctCount / currentCard.reviewCount) * 100)}%`
                      : '-'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">الفاصل</span>
                  <span className="stat-value">{currentCard.interval || 0} يوم</span>
                </div>
              </div>
            </div>
            
            <div className="flip-hint">
              <span>اضغط للكشف</span>
              <span className="hint-icon">👆</span>
            </div>
          </div>

          {/* الوجه الخلفي */}
          <div className="flashcard-back">
            <div className="level-badge" style={{ backgroundColor: levelDetails.color }}>
              <span className="badge-emoji">{levelDetails.emoji}</span>
              <span className="badge-text">{levelDetails.text}</span>
            </div>
            
            <div className="card-content">
              <p className="german-text">{currentCard.german}</p>
              <div className="divider"></div>
              <p className="arabic-text">{currentCard.arabic}</p>
            </div>
          </div>
        </div>
      </div>

      {/* الأزرار - 4 مستويات */}
      {showArabic && !isReviewing && (
        <div className="review-buttons">
          <button 
            className="review-btn btn-wrong"
            onClick={(e) => {
              e.stopPropagation();
              handleReview(0);
            }}
          >
            <span className="btn-emoji">❌</span>
            <span className="btn-text">Again</span>
            <span className="btn-shortcut">0</span>
          </button>
          
          <button 
            className="review-btn btn-hard"
            onClick={(e) => {
              e.stopPropagation();
              handleReview(1);
            }}
          >
            <span className="btn-emoji">😅</span>
            <span className="btn-text">Hard</span>
            <span className="btn-shortcut">1</span>
          </button>
          
          <button 
            className="review-btn btn-good"
            onClick={(e) => {
              e.stopPropagation();
              handleReview(2);
            }}
          >
            <span className="btn-emoji">👍</span>
            <span className="btn-text">Good</span>
            <span className="btn-shortcut">2</span>
          </button>
          
          <button 
            className="review-btn btn-excellent"
            onClick={(e) => {
              e.stopPropagation();
              handleReview(3);
            }}
          >
            <span className="btn-emoji">⭐</span>
            <span className="btn-text">Excellent</span>
            <span className="btn-shortcut">3</span>
          </button>
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="navigation-buttons">
        <button className="nav-btn" onClick={prevCard}>
          ← السابق
        </button>
        <button className="nav-btn" onClick={nextCard}>
          التالي →
        </button>
      </div>

      {/* رسالة تحفيزية */}
      {showMotivation && (
        <div className="motivation-overlay">
          <div className="motivation-message">
            {motivationMessage}
          </div>
        </div>
      )}

      {/* احتفال */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-emoji">🎉</div>
        </div>
      )}
    </div>
  );
}
