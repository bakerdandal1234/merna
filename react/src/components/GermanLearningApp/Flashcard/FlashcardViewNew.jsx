import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getLevelDetails, 
  getMotivationalMessage, 
  calculateNextInterval, 
  formatInterval, 
  formatDate, 
  calculateNextReviewDate 
} from '../../../utils/srsUtils';
import { reviewSentence, getDueSentences } from '../../../services/sentencesApi';
import './FlashcardNew.css';

export default function FlashcardView({ onUpdate, showOnlyDue = true }) {
  const [dueSentences, setDueSentences] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(false);
  const [animation, setAnimation] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [correctStreak, setCorrectStreak] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [completedSession, setCompletedSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

  // جلب الجمل المستحقة من Backend
  useEffect(() => {
    fetchDueSentences();
  }, []);

  const fetchDueSentences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDueSentences(50); // جلب 50 جملة
      
      if (response.success) {
        setDueSentences(response.data || []);
        
        if (response.data.length === 0) {
          setCompletedSession(true);
        }
      }
    } catch (err) {
      console.error('خطأ في جلب الجمل المستحقة:', err);
      setError('فشل تحميل الجمل المستحقة');
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين عند التحديث
  useEffect(() => {
    if (onUpdate) {
      // يمكن إضافة logic للتحديث هنا
    }
  }, [onUpdate]);

  // التحقق من إكمال الجلسة
  useEffect(() => {
    if (currentCardIndex >= dueSentences.length && dueSentences.length > 0) {
      setCompletedSession(true);
    } else {
      setCompletedSession(false);
    }
  }, [dueSentences.length, currentCardIndex]);

  const currentCard = dueSentences[currentCardIndex];

  const nextCard = useCallback(() => {
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
    
    if (currentCardIndex < dueSentences.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCompletedSession(true);
    }
  }, [currentCardIndex, dueSentences.length]);

  const prevCard = useCallback(() => {
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
    
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  }, [currentCardIndex]);

  // دالة المراجعة الرئيسية
  const handleReview = useCallback(async (quality) => {
    if (!currentCard || isReviewing) return;

    setIsReviewing(true);

    // تحديد نوع الأنيميشن
    if (quality >= 2) {
      setAnimation('correct-animation');
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setShowCelebration(true);
      
      // حفظ الـ streak في localStorage
      const lastReviewDate = localStorage.getItem('lastReviewDate');
      const today = new Date().toDateString();
      
      if (lastReviewDate === today) {
        // نفس اليوم - زيادة الـ streak
        const currentStreak = parseInt(localStorage.getItem('reviewStreak') || '0');
        localStorage.setItem('reviewStreak', (currentStreak + 1).toString());
      } else {
        // يوم جديد - بداية streak جديد
        localStorage.setItem('reviewStreak', '1');
        localStorage.setItem('lastReviewDate', today);
      }
      
      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      setAnimation('shake-animation');
      setCorrectStreak(0);
    }

    try {
      const response = await reviewSentence(currentCard._id, quality);

      if (response.success) {
        console.log('✅ تمت المراجعة:', response.message);
        
        // عرض معلومات التغييرات
        if (response.changes) {
          const { nextReviewDate, intervalChange } = response.changes;
          const motivMsg = getMotivationalMessage(quality, quality >= 2 ? correctStreak + 1 : 0);
          
          let fullMessage = motivMsg;
          if (nextReviewDate && intervalChange) {
            const nextDate = formatDate(new Date(nextReviewDate));
            fullMessage = `${motivMsg}\n\n⏰ ${nextDate}\n📊 ${intervalChange}`;
          }
          
          setMotivationMessage(fullMessage);
          setShowMotivation(true);
          setTimeout(() => setShowMotivation(false), 4000);
        }
        
        // تحديث البيانات
        if (onUpdate) {
          onUpdate();
        }

        // إزالة البطاقة من القائمة المحلية
        setTimeout(() => {
          setAnimation('');
          
          // حذف البطاقة الحالية من القائمة
          setDueSentences(prev => prev.filter((_, index) => index !== currentCardIndex));
          
          // إذا كانت هذه آخر بطاقة، عرض رسالة الإكمال
          if (currentCardIndex >= dueSentences.length - 1) {
            setCompletedSession(true);
          }
          
          setIsReviewing(false);
        }, 1000);
      }

    } catch (error) {
      console.error('❌ خطأ في المراجعة:', error);
      
      let userMessage = '';
      
      if (error.response?.status === 500) {
        userMessage = '⚠️ خطأ في الخادم. سيتم تخطي هذه الجملة.';
        
        setTimeout(() => {
          setAnimation('');
          setDueSentences(prev => prev.filter((_, index) => index !== currentCardIndex));
          setIsReviewing(false);
        }, 1500);
      } else if (error.response?.status === 403) {
        userMessage = '🚫 غير مسموح! يمكنك فقط مراجعة الجمل التي أضفتها أنت';
      } else if (error.response?.status === 404) {
        userMessage = '❌ الجملة غير موجودة. سيتم تحديث القائمة.';
        if (onUpdate) onUpdate();
        fetchDueSentences();
      } else if (error.response?.status === 400) {
        userMessage = '❌ التقييم غير صالح';
      } else if (error.response?.status === 401) {
        userMessage = '🔒 انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.';
      } else {
        userMessage = error.response?.data?.message || '❌ حدث خطأ غير متوقع';
      }
      
      if (!error.response?.data?.message?.includes('userId')) {
        alert(userMessage);
      }
      
      setAnimation('');
      setIsReviewing(false);
    }
  }, [currentCard, correctStreak, currentCardIndex, dueSentences.length, onUpdate]);

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

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="flashcard-container">
        <div className="flashcard-loading">
          <div className="spinner"></div>
          <p>جاري تحميل الجمل المستحقة...</p>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="flashcard-container">
        <div className="flashcard-error">
          <div className="error-icon">❌</div>
          <h2>{error}</h2>
          <button 
            className="review-btn btn-good"
            onClick={fetchDueSentences}
            style={{ marginTop: '20px' }}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // عرض رسالة الإكمال
  if (completedSession || !currentCard) {
    return (
      <div className="flashcard-container">
        <div className="flashcard-empty">
          <div className="empty-icon">🎉</div>
          <h2>
            {completedSession 
              ? 'رائع! أكملت جميع الجمل المستحقة للمراجعة!' 
              : 'أحسنت! لا توجد بطاقات للمراجعة الآن'
            }
          </h2>
          <p>
            {completedSession
              ? `لقد راجعت جمل بنجاح`
              : 'عد لاحقاً أو أضف جمل جديدة'
            }
          </p>
          <div style={{ marginTop: '20px' }}>
            <button 
              className="review-btn btn-excellent"
              onClick={() => {
                fetchDueSentences();
                setCurrentCardIndex(0);
                setCompletedSession(false);
                setCorrectStreak(0);
                setShowArabic(false);
                setIsFlipped(false);
              }}
              style={{ padding: '12px 24px', fontSize: '16px' }}
            >
              <span className="btn-emoji">🔄</span>
              <span className="btn-text">تحديث القائمة</span>
            </button>
          </div>
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
          <span>{currentCardIndex + 1} / {dueSentences.length}</span>
          {correctStreak > 0 && (
            <span className="streak-indicator">
              🔥 {correctStreak}
            </span>
          )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentCardIndex + 1) / dueSentences.length) * 100}%` }}
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
      {showArabic && !isReviewing && (() => {
        const intervals = [
          calculateNextInterval(currentCard.interval || 0, currentCard.easeFactor || 2.5, 0),
          calculateNextInterval(currentCard.interval || 0, currentCard.easeFactor || 2.5, 1),
          calculateNextInterval(currentCard.interval || 0, currentCard.easeFactor || 2.5, 2),
          calculateNextInterval(currentCard.interval || 0, currentCard.easeFactor || 2.5, 3)
        ];

        return (
          <div className="review-buttons">
            <button 
              className="review-btn btn-wrong"
              onClick={(e) => {
                e.stopPropagation();
                handleReview(0);
              }}
              title={`المراجعة القادمة: ${formatDate(calculateNextReviewDate(intervals[0]))}`}
            >
              <span className="btn-emoji">❌</span>
              <span className="btn-text">Again</span>
              <span className="btn-interval">{formatInterval(intervals[0])}</span>
              <span className="btn-shortcut">0</span>
            </button>
            
            <button 
              className="review-btn btn-hard"
              onClick={(e) => {
                e.stopPropagation();
                handleReview(1);
              }}
              title={`المراجعة القادمة: ${formatDate(calculateNextReviewDate(intervals[1]))}`}
            >
              <span className="btn-emoji">😅</span>
              <span className="btn-text">Hard</span>
              <span className="btn-interval">{formatInterval(intervals[1])}</span>
              <span className="btn-shortcut">1</span>
            </button>
            
            <button 
              className="review-btn btn-good"
              onClick={(e) => {
                e.stopPropagation();
                handleReview(2);
              }}
              title={`المراجعة القادمة: ${formatDate(calculateNextReviewDate(intervals[2]))}`}
            >
              <span className="btn-emoji">👍</span>
              <span className="btn-text">Good</span>
              <span className="btn-interval">{formatInterval(intervals[2])}</span>
              <span className="btn-shortcut">2</span>
            </button>
            
            <button 
              className="review-btn btn-excellent"
              onClick={(e) => {
                e.stopPropagation();
                handleReview(3);
              }}
              title={`المراجعة القادمة: ${formatDate(calculateNextReviewDate(intervals[3]))}`}
            >
              <span className="btn-emoji">⭐</span>
              <span className="btn-text">Excellent</span>
              <span className="btn-interval">{formatInterval(intervals[3])}</span>
              <span className="btn-shortcut">3</span>
            </button>
          </div>
        );
      })()}

      {/* أزرار التنقل */}
      <div className="navigation-buttons">
        <button 
          className="nav-btn" 
          onClick={prevCard}
          disabled={currentCardIndex === 0}
        >
          ← السابق
        </button>
        <button 
          className="nav-btn" 
          onClick={nextCard}
          disabled={currentCardIndex >= dueSentences.length - 1}
        >
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
