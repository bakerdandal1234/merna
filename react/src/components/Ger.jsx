import React, { useState, useEffect } from 'react';
import AddSentenceForm from './GermanLearningApp/AddSentenceForm';
import FilterButtons from './GermanLearningApp/FilterButtons';
import SentencesList from './GermanLearningApp/SentencesList';
import FlashcardView from './GermanLearningApp/Flashcard/FlashcardViewNew';
import StatsMinimal from './Statistics/StatsMinimal';
import './GermanLearningApp/styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function GermanLearningApp() {
  const [sentences, setSentences] = useState([]);
  const [newGerman, setNewGerman] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editGerman, setEditGerman] = useState('');
  const [editArabic, setEditArabic] = useState('');
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    fetchSentences();
  }, []);

  const fetchSentences = async () => {
    try {
      const response = await fetch(`${API_URL}/sentences`);
      const data = await response.json();
      setSentences(data);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    }
  };

  const addSentence = async () => {
    if (!newGerman.trim() || !newArabic.trim()) {
      alert('يرجى إدخال الجملة والترجمة');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sentences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ german: newGerman, arabic: newArabic })
      });

      const data = await response.json();

      if (response.status === 400 && data.exists) {
        alert('الجملة موجودة مسبقًا');
        return;
      }

      if (response.ok) {
        setNewGerman('');
        setNewArabic('');
        fetchSentences();
      }
    } catch (error) {
      console.error('خطأ في إضافة الجملة:', error);
    }
  };

  const updateSentence = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/sentences/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchSentences();
      }
    } catch (error) {
      console.error('خطأ في تحديث الجملة:', error);
    }
  };

  const deleteSentence = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الجملة؟')) return;

    try {
      const response = await fetch(`${API_URL}/sentences/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSentences();
      }
    } catch (error) {
      console.error('خطأ في حذف الجملة:', error);
    }
  };

  const toggleFavorite = (sentence) => {
    updateSentence(sentence._id, { favorite: !sentence.favorite });
  };

  const saveEdit = () => {
    if (!editGerman.trim() || !editArabic.trim()) {
      alert('يرجى إدخال الجملة والترجمة');
      return;
    }
    updateSentence(editingId, { german: editGerman, arabic: editArabic });
    setEditingId(null);
  };

  // Props for the sentence list and its items
  const sentenceListProps = {
    sentences: sentences.filter(s => filterFavorites ? s.favorite : true),
    editingId,
    editGerman,
    setEditGerman,
    editArabic,
    setEditArabic,
    saveEdit,
    setEditingId,
    toggleFavorite,
    deleteSentence,
  };

  return (
    <div className="container">
      <div className="max-width">
        <h1 className="title">تعلم الألمانية 🇩🇪</h1>
        
        {/* إحصائيات مبسطة دائمة الظهور */}
        <StatsMinimal sentences={sentences} />

        <AddSentenceForm
          newGerman={newGerman}
          setNewGerman={setNewGerman}
          newArabic={newArabic}
          setNewArabic={setNewArabic}
          addSentence={addSentence}
        />

        <FilterButtons
          flashcardMode={flashcardMode}
          setFlashcardMode={setFlashcardMode}
          filterFavorites={filterFavorites}
          setFilterFavorites={setFilterFavorites}
        />

        {flashcardMode ? (
          <FlashcardView
            sentences={sentences}
            filterFavorites={filterFavorites}
            onUpdate={fetchSentences}
          />
        ) : (
          <SentencesList {...sentenceListProps} />
        )}
      </div>
    </div>
  );
}
