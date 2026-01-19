import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Flashcard.css';

export default function FlashcardView({ sentences, filterFavorites }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(false);
  const [animation, setAnimation] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);

  // Memoize filtered sentences to prevent unnecessary recalculations
  const filteredSentences = React.useMemo(() => 
    filterFavorites 
      ? sentences.filter(s => s.favorite) 
      : sentences,
    [sentences, filterFavorites]
  );

  // Reset state when filtered list changes
  useEffect(() => {
    setCurrentCardIndex(0);
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
  }, [filterFavorites, sentences]);

  // Handle index clamping when list size changes
  useEffect(() => {
    if (currentCardIndex >= filteredSentences.length && filteredSentences.length > 0) {
      setCurrentCardIndex(0);
    }
  }, [filteredSentences.length, currentCardIndex]);

  if (filteredSentences.length === 0) {
    return (
      <div 
        className="card empty-state"
        role="status"
        aria-live="polite"
      >
        <div className="empty-icon">📝</div>
        <p className="empty-message">
          لا توجد جمل {filterFavorites ? 'مفضلة' : ''} متاحة للعرض
        </p>
        {filterFavorites && (
          <button 
            className="reset-filter-btn"
            onClick={() => window.dispatchEvent(new Event('reset-favorites'))}
            aria-label="إزالة عوامل التصفية وإظهار جميع الجمل"
          >
            إظهار جميع الجمل
          </button>
        )}
      </div>
    );
  }

  const currentCard = filteredSentences[currentCardIndex];
  const isFirstCard = currentCardIndex === 0;
  const isLastCard = currentCardIndex === filteredSentences.length - 1;

  // Memoized functions to prevent unnecessary re-renders
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

  const handleAnswer = useCallback((knewIt) => {
    if (knewIt) {
      setAnimation('correct-animation');
      const audio = new Audio('/sounds/correct.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      setTimeout(() => {
        nextCard();
      }, 800);
    } else {
      setAnimation('shake-animation');
      const audio = new Audio('/sounds/incorrect.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      setTimeout(() => {
        setAnimation('');
      }, 500);
    }
  }, [nextCard]);

  // Keyboard navigation
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

  // Focus management
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.focus();
    }
  }, [currentCardIndex, showArabic]);

  return (
    <div 
      className="card-container"
      aria-label={`بطاقة تعليمية ${currentCardIndex + 1} من ${filteredSentences.length}`}
    >
      <div className="card-header">
        <div 
          className="nav-btn prev-btn"
          onClick={prevCard}
          disabled={isFirstCard}
          aria-label={isFirstCard ? "هذه هي البطاقة الأولى" : "البطاقة السابقة"}
          aria-disabled={isFirstCard}
        >
          {isFirstCard ? '•••' : '←'}
        </div>
        
        <div className="card-counter" role="status" aria-live="polite">
          <span className="counter-text">
            {currentCardIndex + 1} / {filteredSentences.length}
          </span>
        </div>
        
        <div 
          className="nav-btn next-btn"
          onClick={nextCard}
          disabled={isLastCard}
          aria-label={isLastCard ? "هذه هي البطاقة الأخيرة" : "البطاقة التالية"}
          aria-disabled={isLastCard}
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
            
            <div className="flashcard-meta">
              {currentCard.favorite && (
                <span className="favorite-badge" aria-label="جملة مفضلة">
                  ★
                </span>
              )}
              {currentCard.difficulty && (
                <span className="difficulty-badge" aria-label={`مستوى الصعوبة: ${currentCard.difficulty}`}>
                  {Array.from({ length: currentCard.difficulty }, (_, i) => '★').join('')}
                </span>
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
  );
}