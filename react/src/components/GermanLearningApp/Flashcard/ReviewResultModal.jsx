import React, { useEffect, useState } from 'react';
import './ReviewResultModal.css';

const ReviewResultModal = ({ isOpen, onClose, sm2Result, autoCloseDelay = 3000 }) => {
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Reset timer when modal opens
    setTimeLeft(autoCloseDelay / 1000);
    setCanClose(false);

    // Countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close after delay
    const timeout = setTimeout(() => {
      setCanClose(true);
    }, autoCloseDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen, autoCloseDelay]);

  if (!isOpen || !sm2Result) return null;

  const { intervalFormatted, qualityLabel, reviewLevel } = sm2Result;

  const getQualityEmoji = (quality) => {
    const emojis = {
      0: '❌',
      1: '😅',
      2: '👍',
      3: '⭐'
    };
    return emojis[quality] || '📝';
  };

  const getQualityColor = (quality) => {
    const colors = {
      0: '#ef4444',
      1: '#f59e0b',
      2: '#10b981',
      3: '#3b82f6'
    };
    return colors[quality] || '#6b7280';
  };

  const getLevelEmoji = (level) => {
    const emojis = {
      new: '🆕',
      learning: '📚',
      hard: '😅',
      good: '👍',
      excellent: '⭐',
      mastered: '🏆'
    };
    return emojis[level] || '📝';
  };

  const formatIntervalText = (formatted) => {
    const unitTranslations = {
      minutes: 'دقيقة',
      minute: 'دقيقة',
      hours: 'ساعة',
      hour: 'ساعة',
      day: 'يوم',
      days: 'أيام'
    };

    const unit = unitTranslations[formatted.unit] || formatted.unit;
    return `${formatted.value} ${unit}`;
  };

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <div className="review-result-overlay" onClick={handleClose}>
      <div 
        className="review-result-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: getQualityColor(sm2Result.quality) }}
      >
        <div className="modal-header">
          <div 
            className="quality-badge"
            style={{ backgroundColor: getQualityColor(sm2Result.quality) }}
          >
            <span className="quality-emoji">
              {getQualityEmoji(sm2Result.quality)}
            </span>
            <span className="quality-label">{qualityLabel}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="result-main">
            <h3>⏰ المراجعة القادمة</h3>
            <div className="next-review-time">
              {formatIntervalText(intervalFormatted)}
            </div>
          </div>

          <div className="result-details">
            <div className="detail-item">
              <span className="detail-label">المستوى:</span>
              <span className="detail-value">
                {getLevelEmoji(reviewLevel)} {reviewLevel}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">معامل السهولة:</span>
              <span className="detail-value">
                {sm2Result.easeFactor.toFixed(2)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">التكرارات:</span>
              <span className="detail-value">
                {sm2Result.repetitions}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {!canClose ? (
            <div className="timer-info">
              <div className="timer-circle">
                <svg className="timer-svg" viewBox="0 0 36 36">
                  <path
                    className="timer-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    className="timer-progress"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={getQualityColor(sm2Result.quality)}
                    strokeWidth="3"
                    strokeDasharray={`${(timeLeft / (autoCloseDelay / 1000)) * 100}, 100`}
                  />
                </svg>
                <span className="timer-text">{timeLeft}</span>
              </div>
            </div>
          ) : (
            <button 
              className="continue-btn"
              onClick={handleClose}
              style={{ backgroundColor: getQualityColor(sm2Result.quality) }}
            >
              <span>متابعة</span>
              <span className="btn-arrow">←</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewResultModal;
