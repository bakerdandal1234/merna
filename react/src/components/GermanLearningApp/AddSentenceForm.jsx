import React from 'react';
import { Plus } from 'lucide-react';

export default function AddSentenceForm({
  newGerman,
  setNewGerman,
  newArabic,
  setNewArabic,
  addSentence,
}) {
  // A simple keydown handler to allow submitting with Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addSentence();
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">إضافة جملة جديدة</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="الجملة الألمانية"
          value={newGerman}
          onChange={(e) => setNewGerman(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input"
        />
        <input
          type="text"
          placeholder="الترجمة العربية"
          value={newArabic}
          onChange={(e) => setNewArabic(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input"
        />
        <button onClick={addSentence} className="button-primary">
          <Plus size={20} /> حفظ الجملة
        </button>
      </div>
    </div>
  );
}
