import React, { useState, useEffect } from 'react';
import Header from './Header';
import AddSentenceForm from './GermanLearningApp/AddSentenceForm';
import FilterButtons from './GermanLearningApp/FilterButtons';
import SentencesList from './GermanLearningApp/SentencesList';
import FlashcardView from './GermanLearningApp/Flashcard/FlashcardViewNew';
import StatsMinimal from './Statistics/StatsMinimal';
import api from '../services/api';
import { extractSentences, handleApiError } from '../utils/apiHelper';
import './GermanLearningApp/styles.css';

export default function GermanLearningApp() {
  const [sentences, setSentences] = useState([]);
  const [newGerman, setNewGerman] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editGerman, setEditGerman] = useState('');
  const [editArabic, setEditArabic] = useState('');
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSentences();
  }, []);

  const fetchSentences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sentences');
      
      // ✅ استخدام helper لاستخراج الجمل (يعمل مع الشكلين)
      const sentences = extractSentences(response);
      setSentences(sentences);
      
      console.log('✅ تم جلب الجمل:', sentences.length);
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ خطأ في جلب البيانات:', errorInfo.message);
      alert(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const addSentence = async () => {
    if (!newGerman.trim() || !newArabic.trim()) {
      alert('يرجى إدخال الجملة والترجمة');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/sentences', { 
        german: newGerman, 
        arabic: newArabic 
      });

      // ✅ التحقق من النجاح
      if (response.data.success) {
        console.log('✅', response.data.message);
        setNewGerman('');
        setNewArabic('');
        fetchSentences();
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      
      // ✅ معالجة حالة الجملة المكررة
      if (error.response?.data?.exists) {
        alert('❌ الجملة موجودة مسبقاً');
      } else {
        alert(errorInfo.message);
      }
      console.error('❌ خطأ في إضافة الجملة:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const updateSentence = async (id, updates) => {
    try {
      setLoading(true);
      const response = await api.put(`/sentences/${id}`, updates);
      
      // ✅ التحقق من النجاح
      if (response.data.success) {
        console.log('✅', response.data.message);
        fetchSentences();
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      
      // ✅ معالجة أخطاء Authorization
      if (error.response?.status === 403) {
        alert('🚫 غير مسموح! يمكنك فقط تعديل الجمل التي أضفتها أنت');
      } else if (error.response?.status === 404) {
        alert('❌ الجملة غير موجودة');
      } else {
        alert(errorInfo.message);
      }
      console.error('❌ خطأ في تحديث الجملة:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const deleteSentence = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الجملة؟')) return;

    try {
      setLoading(true);
      const response = await api.delete(`/sentences/${id}`);
      
      // ✅ التحقق من النجاح
      if (response.data.success) {
        console.log('✅', response.data.message);
        fetchSentences();
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      
      // ✅ معالجة أخطاء Authorization
      if (error.response?.status === 403) {
        alert('🚫 غير مسموح! يمكنك فقط حذف الجمل التي أضفتها أنت');
      } else if (error.response?.status === 404) {
        alert('❌ الجملة غير موجودة');
      } else {
        alert(errorInfo.message);
      }
      console.error('❌ خطأ في حذف الجملة:', errorInfo);
    } finally {
      setLoading(false);
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
    loading // ✅ تمرير حالة التحميل
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
          loading={loading} // ✅ تمرير حالة التحميل
        />

        <FilterButtons
          flashcardMode={flashcardMode}
          setFlashcardMode={setFlashcardMode}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p>جاري التحميل...</p>
          </div>
        ) : flashcardMode ? (
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
