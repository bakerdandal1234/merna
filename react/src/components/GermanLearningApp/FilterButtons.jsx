import React from 'react';

export default function FilterButtons({
  flashcardMode,
  setFlashcardMode,
}) {
  return (
    <div className="button-group">
      <button
        onClick={() => setFlashcardMode(!flashcardMode)}
        className={`button ${flashcardMode ? 'button-active' : 'button-inactive'}`}
      >
        {flashcardMode ? 'عرض القائمة' : 'وضع البطاقات التعليمية'}
      </button>
    </div>
  );
}
