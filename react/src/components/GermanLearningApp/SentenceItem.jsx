import React from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';

export default function SentenceItem({
  sentence,
  editingId,
  editGerman,
  setEditGerman,
  editArabic,
  setEditArabic,
  saveEdit,
  setEditingId,
  deleteSentence,
}) {
  const isEditing = editingId === sentence._id;
  const canEdit = sentence.isOwner || false;
  const canDelete = sentence.isOwner || false;
  return (
    <div className="sentence-card">
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editGerman}
            onChange={(e) => setEditGerman(e.target.value)}
            className="input"
          />
          <input
            type="text"
            value={editArabic}
            onChange={(e) => setEditArabic(e.target.value)}
            className="input"
          />
          <div className="edit-buttons">
            <button onClick={saveEdit} className="button-save">
              <Check size={18} /> حفظ
            </button>
            <button onClick={() => setEditingId(null)} className="button-cancel">
              <X size={18} /> إلغاء
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="sentence-content">
            <p className="german-text">{sentence.german}</p>
            <p className="arabic-text">{sentence.arabic}</p>
          </div>

          <div className="sentence-footer">
            <div className="action-buttons">
              <button
                onClick={() => {
                  setEditingId(sentence._id);
                  setEditGerman(sentence.german);
                  setEditArabic(sentence.arabic);
                }}
                className="icon-button"
              >
                {canEdit && <Edit2 size={18} color="#3b82f6" />}
              </button>
              <button
                onClick={() => deleteSentence(sentence._id)}
                className="icon-button"
              >
                {canDelete && <Trash2 size={18} color="#ef4444" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
