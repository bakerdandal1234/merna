import React from 'react';
import { Plus } from 'lucide-react';

export default function AddSentenceForm({
  newGerman,
  setNewGerman,
  newArabic,
  setNewArabic,
  addSentence,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addSentence();
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Neuen Satz hinzufügen</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Deutscher Satz"
          value={newGerman}
          onChange={(e) => setNewGerman(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input"
        />
        <input
          type="text"
          placeholder="Arabische Übersetzung"
          value={newArabic}
          onChange={(e) => setNewArabic(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input"
        />
        <button onClick={addSentence} className="button-primary">
          <Plus size={20} /> Satz speichern
        </button>
      </div>
    </div>
  );
}
