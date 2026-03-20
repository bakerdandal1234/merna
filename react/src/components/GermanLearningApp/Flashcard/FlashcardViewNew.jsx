import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getLevelDetails } from '../../../utils/srsUtils';
import { reviewSentence, getDueSentences } from '../../../services/sentencesApi';
import ReviewResultModal from './ReviewResultModal';
import './FlashcardNew.css';

export default function FlashcardView({ onUpdate, showOnlyDue = true }) {
  const [dueSentences, setDueSentences] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(false);
  const [animation, setAnimation] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [completedSession, setCompletedSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sm2Result, setSm2Result] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => { fetchDueSentences(); }, []);

  const fetchDueSentences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDueSentences(50);
      if (response.success) {
        setDueSentences(response.data || []);
        if (response.data.length === 0) setCompletedSession(true);
      }
    } catch (err) {
      console.error('Error fetching due sentences:', err);
      setError('Fällige Sätze konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCardIndex >= dueSentences.length && dueSentences.length > 0) {
      setCompletedSession(true);
    } else {
      setCompletedSession(false);
    }
  }, [dueSentences.length, currentCardIndex]);

  const currentCard = dueSentences[currentCardIndex];

  const nextCard = useCallback(() => {
    setShowArabic(false); setIsFlipped(false); setAnimation('');
    if (currentCardIndex < dueSentences.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCompletedSession(true);
    }
  }, [currentCardIndex, dueSentences.length]);

  const prevCard = useCallback(() => {
    setShowArabic(false); setIsFlipped(false); setAnimation('');
    if (currentCardIndex > 0) setCurrentCardIndex(prev => prev - 1);
  }, [currentCardIndex]);

  const handleModalClose = () => {
    setShowModal(false); setSm2Result(null); setAnimation('');
    setShowArabic(false); setIsFlipped(false);
    setDueSentences(prev => prev.filter((_, index) => index !== currentCardIndex));
    if (currentCardIndex >= dueSentences.length - 1) setCompletedSession(true);
    setIsReviewing(false);
  };

  const handleReview = useCallback(async (quality) => {
    if (!currentCard || isReviewing) return;
    setIsReviewing(true);

    if (quality >= 2) {
      setAnimation('correct-animation');
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      const lastReviewDate = localStorage.getItem('lastReviewDate');
      const today = new Date().toDateString();
      if (lastReviewDate === today) {
        const currentStreak = parseInt(localStorage.getItem('reviewStreak') || '0');
        localStorage.setItem('reviewStreak', (currentStreak + 1).toString());
      } else {
        localStorage.setItem('reviewStreak', '1');
        localStorage.setItem('lastReviewDate', today);
      }
    } else {
      setAnimation('shake-animation');
      setCorrectStreak(0);
    }

    try {
      const response = await reviewSentence(currentCard._id, quality);
      if (response.success && response.sm2Result) {
        setSm2Result(response.sm2Result);
        setShowModal(true);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error reviewing sentence:', error);
      let userMessage = '';
      if (error.response?.status === 500) {
        userMessage = '⚠️ Serverfehler. Dieser Satz wird übersprungen.';
        setTimeout(() => {
          setAnimation('');
          setDueSentences(prev => prev.filter((_, index) => index !== currentCardIndex));
          setIsReviewing(false);
        }, 1500);
      } else if (error.response?.status === 403) {
        userMessage = '🚫 Nicht erlaubt! Sie können nur Ihre eigenen Sätze wiederholen.';
      } else if (error.response?.status === 404) {
        userMessage = '❌ Satz nicht gefunden. Die Liste wird aktualisiert.';
        if (onUpdate) onUpdate();
        fetchDueSentences();
      } else if (error.response?.status === 400) {
        userMessage = '❌ Ungültige Bewertung';
      } else if (error.response?.status === 401) {
        userMessage = '🔒 Sitzung abgelaufen. Bitte erneut anmelden.';
      } else {
        userMessage = error.response?.data?.message || '❌ Unbekannter Fehler';
      }
      if (!error.response?.data?.message?.includes('userId')) {
        alert(userMessage);
      }
      setAnimation('');
      setIsReviewing(false);
    }
  }, [currentCard, correctStreak, currentCardIndex, dueSentences.length, onUpdate]);

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped); setShowArabic(!showArabic);
  }, [isFlipped, showArabic]);

  const handleKeyPress = useCallback((e) => {
    if (isReviewing || showModal) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleFlip(); }
    else if (e.key === 'ArrowLeft') prevCard();
    else if (e.key === 'ArrowRight') nextCard();
    else if (showArabic) {
      if (e.key === '0') handleReview(0);
      else if (e.key === '1') handleReview(1);
      else if (e.key === '2') handleReview(2);
      else if (e.key === '3') handleReview(3);
    }
  }, [isReviewing, showModal, showArabic, handleFlip, handleReview, nextCard, prevCard]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (loading) {
    return (
      <div className="flashcard-container">
        <div className="flashcard-loading">
          <div className="spinner"></div>
          <p>Fällige Sätze werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-container">
        <div className="flashcard-error">
          <div className="error-icon">❌</div>
          <h2>{error}</h2>
          <button className="review-btn btn-good" onClick={fetchDueSentences} style={{ marginTop: '20px' }}>
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (completedSession || !currentCard) {
    return (
      <div className="flashcard-container">
        <div className="flashcard-empty">
          <div className="empty-icon">🎉</div>
          <h2>
            {completedSession
              ? 'Super! Alle fälligen Sätze wurden wiederholt!'
              : 'Keine Karten zur Wiederholung vorhanden.'}
          </h2>
          <p>
            {completedSession
              ? 'Sie haben die Sätze erfolgreich wiederholt.'
              : 'Kommen Sie später wieder oder fügen Sie neue Sätze hinzu.'}
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
              <span className="btn-text">Liste aktualisieren</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const levelDetails = getLevelDetails(currentCard.interval || 0);

  return (
    <div className="flashcard-container">
      {/* Progress bar */}
      <div className="flashcard-progress">
        <div className="progress-info">
          <span>{currentCardIndex + 1} / {dueSentences.length}</span>
          {correctStreak > 0 && (
            <span className="streak-indicator">🔥 {correctStreak}</span>
          )}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentCardIndex + 1) / dueSentences.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className={`flashcard ${animation} ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-inner">
          {/* Front */}
          <div className="flashcard-front">
            <div className="level-badge" style={{ backgroundColor: levelDetails.color }}>
              <span className="badge-emoji">{levelDetails.emoji}</span>
              <span className="badge-text">{levelDetails.text}</span>
            </div>
            <div className="card-content">
              <p className="german-text">{currentCard.german}</p>
              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-label">Wiederholungen</span>
                  <span className="stat-value">{currentCard.reviewCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Genauigkeit</span>
                  <span className="stat-value">
                    {currentCard.reviewCount > 0
                      ? `${Math.round((currentCard.correctCount / currentCard.reviewCount) * 100)}%`
                      : '-'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Intervall</span>
                  <span className="stat-value">{currentCard.interval || 0} Tag(e)</span>
                </div>
              </div>
            </div>
            <div className="flip-hint">
              <span>Zum Aufdecken klicken</span>
              <span className="hint-icon">👆</span>
            </div>
          </div>

          {/* Back */}
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

      {/* Review buttons */}
      {showArabic && !isReviewing && (
        <div className="review-buttons">
          <button className="review-btn btn-wrong" onClick={(e) => { e.stopPropagation(); handleReview(0); }}>
            <span className="btn-emoji">❌</span>
            <span className="btn-text">Again</span>
            <span className="btn-shortcut">0</span>
          </button>
          <button className="review-btn btn-hard" onClick={(e) => { e.stopPropagation(); handleReview(1); }}>
            <span className="btn-emoji">😅</span>
            <span className="btn-text">Hard</span>
            <span className="btn-shortcut">1</span>
          </button>
          <button className="review-btn btn-good" onClick={(e) => { e.stopPropagation(); handleReview(2); }}>
            <span className="btn-emoji">👍</span>
            <span className="btn-text">Good</span>
            <span className="btn-shortcut">2</span>
          </button>
          <button className="review-btn btn-excellent" onClick={(e) => { e.stopPropagation(); handleReview(3); }}>
            <span className="btn-emoji">⭐</span>
            <span className="btn-text">Excellent</span>
            <span className="btn-shortcut">3</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="navigation-buttons">
        <button className="nav-btn" onClick={prevCard} disabled={currentCardIndex === 0}>
          ← Zurück
        </button>
        <button className="nav-btn" onClick={nextCard} disabled={currentCardIndex >= dueSentences.length - 1}>
          Weiter →
        </button>
      </div>

      <ReviewResultModal
        isOpen={showModal}
        onClose={handleModalClose}
        sm2Result={sm2Result}
        autoCloseDelay={3000}
      />
    </div>
  );
}
