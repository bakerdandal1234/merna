import React, { useState, useEffect } from 'react';
import Header from './Header';
import AddSentenceForm from './GermanLearningApp/AddSentenceForm';
import FilterButtons from './GermanLearningApp/FilterButtons';
import SentencesList from './GermanLearningApp/SentencesList';
import FlashcardView from './GermanLearningApp/Flashcard/FlashcardViewNew';
import StatsMinimal from './Statistics/StatsMinimal';
import api from '../services/api';
import './GermanLearningApp/styles.css';

export default function GermanLearningApp() {
  const [sentences, setSentences] = useState([]);
  const [newGerman, setNewGerman] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editGerman, setEditGerman] = useState('');
  const [editArabic, setEditArabic] = useState('');
  const [flashcardMode, setFlashcardMode] = useState(false);

  useEffect(() => {
    fetchSentences();
  }, []);

  const fetchSentences = async () => {
    try {
      const response = await api.get('/sentences');
      setSentences(response.data);
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
      const response = await api.post('/sentences', { 
        german: newGerman, 
        arabic: newArabic 
      });

      setNewGerman('');
      setNewArabic('');
      fetchSentences();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.exists) {
        alert('الجملة موجودة مسبقًا');
      } else {
        console.error('خطأ في إضافة الجملة:', error);
      }
    }
  };

  const updateSentence = async (id, updates) => {
    try {
      await api.put(`/sentences/${id}`, updates);
      fetchSentences();
    } catch (error) {
      console.error('خطأ في تحديث الجملة:', error);
    }
  };

  const deleteSentence = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الجملة؟')) return;

    try {
      await api.delete(`/sentences/${id}`);
      fetchSentences();
    } catch (error) {
      console.error('خطأ في حذف الجملة:', error);
    }
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
    sentences: sentences,
    editingId,
    editGerman,
    setEditGerman,
    editArabic,
    setEditArabic,
    saveEdit,
    setEditingId,
    deleteSentence,
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="max-width">
        
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
        />

        {flashcardMode ? (
          <FlashcardView
            sentences={sentences}
            onUpdate={fetchSentences}
          />
        ) : (
          <SentencesList {...sentenceListProps} />
        )}
        </div>
      </div>
    </>
  );
}
