import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SmartCelebration } from './CelebrationEffectsMinimal';
import { MotivationalMessage } from './MotivationalMessages';
import { calculateNextReview, calculateNewLevel, getDueSentences } from '../../../utils/srs';
import './Flashcard.css';
import './CelebrationEffectsMinimal.css';
import './MotivationalMessages.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://merna-ugyu.onrender.com/api';

export default function FlashcardView({ sentences, filterFavorites, onUpdate, showOnlyDue = true }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(false);
  const [animation, setAnimation] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const cardRef = useRef(null);

  const filteredSentences = React.useMemo(() => {
    let filtered = sentences;
    
    // تصفية حسب المفضلة
    if (filterFavorites) {
      filtered = filtered.filter(s => s.favorite);
    }
    
    // تصفية حسب موعد المراجعة (الجمل المستحقة فقط)
    if (showOnlyDue) {
      filtered = getDueSentences(filtered);
    }
    
    return filtered;
  }, [sentences, filterFavorites, showOnlyDue]);

  useEffect(() => {
    setCurrentCardIndex(0);
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
    setCorrectStreak(0);
  }, [filterFavorites, sentences]);

  useEffect(() => {
    if (currentCardIndex >= filteredSentences.length && filteredSentences.length > 0) {
      setCurrentCardIndex(0);
    }
  }, [filteredSentences.length, currentCardIndex]);

  const currentCard = filteredSentences[currentCardIndex];
  const isFirstCard = currentCardIndex === 0;
  const isLastCard = currentCardIndex === filteredSentences.length - 1;

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

  // دالة المراجعة الذكية مع SRS
  const handleAnswer = useCallback(async (knewIt) => {
    if (!currentCard) return; // Guard against race conditions

    if (knewIt) {
      setAnimation('correct-animation');
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setShowCelebration(true);
      
      const newLevel = calculateNewLevel(
        true,
        currentCard.reviewLevel || 'new',
        (currentCard.consecutiveCorrect || 0) + 1
      );
      
      const nextReviewDate = calculateNextReview(
        newLevel,
        (currentCard.consecutiveCorrect || 0) + 1,
        new Date()
      );
      
      try {
        await fetch(`${API_URL}/sentences/${currentCard._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewLevel: newLevel,
            nextReview: nextReviewDate,
            consecutiveCorrect: (currentCard.consecutiveCorrect || 0) + 1,
            knewIt: true
          })
        });
        
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('خطأ في تحديث الجملة:', error);
      }
      
      setTimeout(() => {
        nextCard();
      }, 2500);
      
    } else {
      setAnimation('shake-animation');
      setCorrectStreak(0);
      setShowMotivation(true);
      
      const newLevel = 'new';
      const nextReviewDate = calculateNextReview(newLevel, 0, new Date());
      
      try {
        await fetch(`${API_URL}/sentences/${currentCard._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewLevel: newLevel,
            nextReview: nextReviewDate,
            consecutiveCorrect: 0,
            knewIt: false
          })
        });
        
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('خطأ في تحديث الجملة:', error);
      }
      
      setTimeout(() => {
        setAnimation('');
      }, 500);
    }
  }, [nextCard, correctStreak, currentCard, onUpdate]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (!showArabic && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setShowArabic(true);
        setIsFlipped(true);
      } 
      else if (showArabic) {
        if (e.key === '1') handleAnswer(false);
        if (e.key === '2') handleAnswer(true);
      }
      
      if (e.key === 'ArrowLeft' && !showArabic) prevCard();
      if (e.key === 'ArrowRight' && !showArabic) nextCard();
      if (e.key === 'Escape') {
        setShowArabic(false);
        setIsFlipped(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showArabic, prevCard, nextCard, handleAnswer]);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.focus();
    }
  }, [currentCardIndex, showArabic]);

  // All conditional returns must come after all hooks are called.
  if (filteredSentences.length === 0) {
    return (
      <div className="card empty-state" role="status" aria-live="polite">
        <div className="empty-icon">🎉</div>
        <p className="empty-message">
          {showOnlyDue 
            ? "رائع! لا توجد جمل مستحقة للمراجعة الآن. عد لاحقاً!" 
            : `لا توجد جمل ${filterFavorites ? 'مفضلة' : ''} متاحة للعرض`
          }
        </p>
        {showOnlyDue && (
          <p className="empty-hint">
            💡 الجمل التي أجبت عليها بشكل صحيح ستظهر لك لاحقاً حسب جدول المراجعة الذكي
          </p>
        )}
      </div>
    );
  }

  // Conditional rendering is safe here, after all hooks have been called.
  if (!currentCard) {
    // This state can be reached temporarily during re-renders.
    return <div className="card empty-state">Loading cards...</div>;
  }

  return (
    <>
      <SmartCelebration 
        show={showCelebration} 
        streak={correctStreak}
        onComplete={() => setShowCelebration(false)}
      />

      <MotivationalMessage 
        show={showMotivation}
        onComplete={() => {
          setShowMotivation(false);
          nextCard();
        }}
      />

      <div className="card-container" aria-label={`بطاقة تعليمية ${currentCardIndex + 1} من ${filteredSentences.length}`}>
        {correctStreak >= 3 && !showCelebration && (
          <div className="streak-indicator">
            <span className="streak-emoji">🔥</span>
            <span className="streak-number">{correctStreak}</span>
            <span className="streak-text">متتالية!</span>
          </div>
        )}

        <div className="card-level-badge">
          {getLevelBadge(currentCard.reviewLevel || 'new')}
        </div>

        <div className="card-header">
          <div 
            className="nav-btn prev-btn"
            onClick={prevCard}
            disabled={isFirstCard}
            aria-label={isFirstCard ? "هذه هي البطاقة الأولى" : "البطاقة السابقة"}
          >
            {isFirstCard ? '•••' : '←'}
          </div>
          
          <div className="card-counter" role="status" aria-live="polite">
            <span className="counter-text">
              {currentCardIndex + 1} / {filteredSentences.length}
            </span>
            {showOnlyDue && (
              <span className="counter-due-badge">مستحقة اليوم</span>
            )}
          </div>
          
          <div 
            className="nav-btn next-btn"
            onClick={nextCard}
            disabled={isLastCard}
            aria-label={isLastCard ? "هذه هي البطاقة الأخيرة" : "البطاقة التالية"}
          >
            {isLastCard ? '•••' : '→'}
          </div>
        </div>

        <div 
          ref={cardRef}
          tabIndex="0"
          role="button"
          aria-label={showArabic ? 
            `ظهر البطاقة: ${currentCard.arabic}. استخدم مفاتيح 1 و 2 للاختيار` : 
            `أمام البطاقة: ${currentCard.german}. اضغط لرؤية الترجمة`
          }
          aria-expanded={showArabic}
          className={`flashcard ${animation} ${isFlipped ? 'flipped' : ''}`}
          onClick={() => {
            if (!showArabic) {
              setShowArabic(true);
              setIsFlipped(true);
            }
          }}
          onKeyDown={(e) => {
            if (!showArabic && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setShowArabic(true);
              setIsFlipped(true);
            }
          }}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="language-label">ألماني</div>
              <p className="flashcard-german">{currentCard.german}</p>
              <div className="flip-hint">
                <span className="hint-icon">👆</span>
                <span className="hint-text">اضغط لإظهار الترجمة</span>
              </div>
            </div>
            
            <div className="flashcard-back">
              <div className="language-label">عربي</div>
              <p className="flashcard-german">{currentCard.german}</p>
              <p className="flashcard-arabic" dir="rtl">{currentCard.arabic}</p>
              
              <div className="flashcard-stats">
                {currentCard.reviewCount > 0 && (
                  <span className="stat-badge">
                    📊 {currentCard.reviewCount} مراجعة
                  </span>
                )}
                {currentCard.correctCount > 0 && (
                  <span className="stat-badge success">
                    ✓ {currentCard.correctCount} صحيح
                  </span>
                )}
              </div>
              
              <div className="flashcard-meta">
                {currentCard.favorite && (
                  <span className="favorite-badge" aria-label="جملة مفضلة">★</span>
                )}
              </div>
              
              <div className="flashcard-answer-buttons" role="group" aria-label="تقييم الفهم">
                <button
                  className="flashcard-btn incorrect"
                  onClick={() => handleAnswer(false)}
                  aria-label="لم أعرف الإجابة"
                >
                  <span aria-hidden="true">1</span> لم أعرفها
                </button>
                <button
                  className="flashcard-btn correct"
                  onClick={() => handleAnswer(true)}
                  aria-label="عرفت الإجابة"
                >
                  <span aria-hidden="true">2</span> عرفتها
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button 
            className="quiz-btn-secondary skip-btn"
            onClick={nextCard}
            aria-label="تخطي هذه البطاقة"
          >
            <span aria-hidden="true">⏭️</span> تخطي
          </button>
          
          <div className="accessibility-hint" aria-hidden="true">
            <kbd>←</kbd> السابق &nbsp; <kbd>→</kbd> التالي &nbsp; 
            <kbd>1</kbd>/<kbd>2</kbd> تقييم &nbsp; <kbd>ESC</kbd> إغلاق
          </div>
        </div>
      </div>
    </>
  );
}

function getLevelBadge(level) {
  const badges = {
    new: { emoji: '🆕', text: 'جديد', color: '#ef4444' },
    hard: { emoji: '😅', text: 'صعب', color: '#f97316' },
    good: { emoji: '👍', text: 'جيد', color: '#eab308' },
    excellent: { emoji: '⭐', text: 'ممتاز', color: '#10b981' },
    mastered: { emoji: '🏆', text: 'مُتقن', color: '#6366f1' }
  };
  
  const badge = badges[level] || badges.new;
  
  return (
    <div 
      className="level-badge"
      style={{ backgroundColor: badge.color }}
    >
      <span>{badge.emoji}</span>
      <span>{badge.text}</span>
    </div>
  );
}
