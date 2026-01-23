import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDueSentences, getLevelDetails, getMotivationalMessage, calculateNextInterval, formatInterval, formatDate, calculateNextReviewDate } from '../../../utils/srsUtils';
import api from '../../../services/api';
import { handleApiError } from '../../../utils/apiHelper';
import './FlashcardNew.css';

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
  const [completedSession, setCompletedSession] = useState(false);
  const [cardProgress, setCardProgress] = useState(null); // 🆕 التقدم الشخصي
  const [loadingProgress, setLoadingProgress] = useState(false);
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
    setCompletedSession(false);
  }, [sentences]);

  useEffect(() => {
    // التحقق من إكمال جميع الجمل
    if (currentCardIndex >= filteredSentences.length && filteredSentences.length > 0) {
      setCompletedSession(true);
    } else {
      setCompletedSession(false);
    }
  }, [filteredSentences.length, currentCardIndex]);

  const currentCard = filteredSentences[currentCardIndex];

  // 🔄 جلب التقدم الشخصي عند تغيير البطاقة
  useEffect(() => {
    const fetchProgress = async () => {
      if (!currentCard || !currentCard._id) return;
      
      setLoadingProgress(true);
      try {
        // جلب التقدم من Backend
        const response = await api.get(`/progress/${currentCard._id}`);
        setCardProgress(response.data.progress);
      } catch (error) {
        // إذا لم يوجد تقدم → بطاقة جديدة
        console.log('بطاقة جديدة');
        setCardProgress({
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          reviewLevel: 'new'
        });
      } finally {
        setLoadingProgress(false);
      }
    };
    
    fetchProgress();
  }, [currentCard]);

  const nextCard = useCallback(() => {
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
    
    // ✅ التحقق: هل نحن في آخر جملة؟
    if (currentCardIndex < filteredSentences.length - 1) {
      // لا زلنا في القائمة → انتقل للتالي
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // وصلنا لآخر جملة → تفعيل حالة الإكمال
      setCompletedSession(true);
    }
  }, [currentCardIndex, filteredSentences.length]);

  const prevCard = useCallback(() => {
    setShowArabic(false);
    setIsFlipped(false);
    setAnimation('');
    
    // ✅ التحقق: هل نحن في أول جملة؟
    if (currentCardIndex > 0) {
      // لا زلنا في القائمة → انتقل للسابق
      setCurrentCardIndex(prev => prev - 1);
    }
    // إذا كنا في أول جملة → لا تفعل شيء
  }, [currentCardIndex]);

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

    try {
      // ✅ استدعاء API باستخدام axios instance
      const response = await api.post(`/sentences/${currentCard._id}/review`, {
        quality
      });

      // ✅ التحقق من النجاح
      if (response.data.success) {
        console.log('✅ تمت المراجعة:', response.data.message);
        
        // ✅ عرض معلومات التغييرات ورسالة تحفيزية
        if (response.data.changes) {
          console.log('📊 التغييرات:', response.data.changes);
          
          // تجهيز الرسالة الكاملة
          const { nextReviewDate, intervalChange } = response.data.changes;
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

        // ✅ الانتقال للبطاقة التالية (فقط إذا لم نكن في آخر جملة)
        setTimeout(() => {
          setAnimation('');
          
          // التحقق من وجود جملة تالية
          if (currentCardIndex < filteredSentences.length - 1) {
            nextCard();
          } else {
            // آخر جملة → فقط إيقاف المراجعة (سيتم تحديث القائمة وستظهر رسالة "لا توجد جمل")
            console.log('✅ أحسنت! أنهيت جميع الجمل المستحقة');
          }
          
          setIsReviewing(false);
        }, 1000);
      }

    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ خطأ في المراجعة:', errorInfo);
      
      // ✅ معالجة أخطاء مختلفة برسائل واضحة
      let userMessage = '';
      
      if (error.response?.status === 500) {
        const serverMessage = error.response?.data?.message || '';
        
        if (serverMessage.includes('userId مفقود')) {
          // جملة قديمة/تالفة في قاعدة البيانات
          userMessage = '⚠️ هذه الجملة تحتوي على بيانات غير صحيحة.\n\nسيتم تخطيها تلقائياً. جرب الجملة التالية.';
          
          // الانتقال للبطاقة التالية تلقائياً
          setTimeout(() => {
            setAnimation('');
            nextCard();
            setIsReviewing(false);
          }, 1500);
        } else {
          userMessage = '❌ خطأ في الخادم. حاول مرة أخرى.';
        }
      } else if (error.response?.status === 403) {
        userMessage = '🚫 غير مسموح! يمكنك فقط مراجعة الجمل التي أضفتها أنت';
      } else if (error.response?.status === 404) {
        userMessage = '❌ الجملة غير موجودة. سيتم تحديث القائمة.';
        // تحديث القائمة
        if (onUpdate) onUpdate();
      } else if (error.response?.status === 400) {
        userMessage = '❌ التقييم غير صالح';
      } else if (error.response?.status === 401) {
        userMessage = '🔒 انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.';
      } else {
        userMessage = errorInfo.message || '❌ حدث خطأ غير متوقع';
      }
      
      // عرض الرسالة فقط إذا لم يكن userId مفقود (لأننا سننتقل تلقائياً)
      if (!error.response?.data?.message?.includes('userId مفقود')) {
        alert(userMessage);
      }
      
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
              ? `لقد راجعت ${filteredSentences.length} جملة بنجاح`
              : 'عد لاحقاً أو أضف جمل جديدة'
            }
          </p>
          {completedSession && (
            <div style={{ marginTop: '20px' }}>
              <button 
                className="review-btn btn-excellent"
                onClick={() => {
                  setCurrentCardIndex(0);
                  setCompletedSession(false);
                  setCorrectStreak(0);
                  setShowArabic(false);
                  setIsFlipped(false);
                }}
                style={{ padding: '12px 24px', fontSize: '16px' }}
              >
                <span className="btn-emoji">🔄</span>
                <span className="btn-text">ابدأ من جديد</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ استخدام التقدم الشخصي لعرض المستوى
  const levelDetails = cardProgress 
    ? getLevelDetails(cardProgress.interval || 0) 
    : getLevelDetails(0);
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
                  <span className="stat-value">{cardProgress?.reviewCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">الدقة</span>
                  <span className="stat-value">
                    {cardProgress?.reviewCount > 0 
                      ? `${Math.round((cardProgress.correctCount / cardProgress.reviewCount) * 100)}%`
                      : '-'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">الفاصل</span>
                  <span className="stat-value">{cardProgress?.interval || 0} يوم</span>
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

      {/* مؤشر التحميل */}
      {showArabic && loadingProgress && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="spinner"></div>
          <p>جاري تحميل التقدم...</p>
        </div>
      )}

      {/* الأزرار - 4 مستويات */}
      {showArabic && !isReviewing && !loadingProgress && cardProgress && (() => {
        // ✅ حساب الفترات باستخدام التقدم الشخصي
        const intervals = [
          calculateNextInterval(cardProgress.interval || 0, cardProgress.easeFactor || 2.5, 0),
          calculateNextInterval(cardProgress.interval || 0, cardProgress.easeFactor || 2.5, 1),
          calculateNextInterval(cardProgress.interval || 0, cardProgress.easeFactor || 2.5, 2),
          calculateNextInterval(cardProgress.interval || 0, cardProgress.easeFactor || 2.5, 3)
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
