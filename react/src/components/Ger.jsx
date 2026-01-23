import React, { useState, useEffect } from 'react';
import Header from './Header';
import AddSentenceForm from './GermanLearningApp/AddSentenceForm';
import FilterButtons from './GermanLearningApp/FilterButtons';
import SentencesList from './GermanLearningApp/SentencesList';
import FlashcardView from './GermanLearningApp/Flashcard/FlashcardViewNew';
import StatsMinimal from './Statistics/StatsMinimal';
import { getMySentences, createSentence, updateSentence, deleteSentence } from '../services/sentencesApi';
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
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchSentences();
  }, []);

  const fetchSentences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب جمل المستخدم فقط
      const response = await getMySentences({
        page: 1,
        limit: 100, // جلب أول 100 جملة
        sort: 'createdAt' // ترتيب حسب تاريخ الإنشاء
      });
      
      if (response.success) {
        setSentences(response.data || []);
        
        // التحقق من وجود صفحات إضافية
        if (response.pagination) {
          setHasMore(response.pagination.hasNext);
        }
        
        console.log('✅ تم جلب الجمل:', response.data.length);
      }
    } catch (err) {
      console.error('❌ خطأ في جلب البيانات:', err);
      setError(err.response?.data?.message || 'حدث خطأ في تحميل الجمل');
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
      setError(null);
      
      const response = await createSentence(newGerman.trim(), newArabic.trim());

      if (response.success) {
        console.log('✅', response.message);
        setNewGerman('');
        setNewArabic('');
        
        // إضافة الجملة الجديدة للقائمة
        setSentences(prev => [response.data, ...prev]);
      }
    } catch (err) {
      console.error('❌ خطأ في إضافة الجملة:', err);
      
      const errorMessage = err.response?.data?.message || 'حدث خطأ في إضافة الجملة';
      
      if (err.response?.status === 400 && errorMessage.includes('موجودة')) {
        alert('❌ الجملة موجودة مسبقاً');
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSentenceHandler = async (id, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await updateSentence(id, updates);
      
      if (response.success) {
        console.log('✅', response.message);
        
        // تحديث الجملة في القائمة
        setSentences(prev => 
          prev.map(s => s._id === id ? { ...s, ...updates } : s)
        );
        
        return true;
      }
    } catch (err) {
      console.error('❌ خطأ في تحديث الجملة:', err);
      
      const errorMessage = err.response?.data?.message || 'حدث خطأ في تحديث الجملة';
      
      if (err.response?.status === 403) {
        alert('🚫 غير مسموح! يمكنك فقط تعديل الجمل التي أضفتها أنت');
      } else if (err.response?.status === 404) {
        alert('❌ الجملة غير موجودة');
        fetchSentences(); // إعادة تحميل القائمة
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSentenceHandler = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الجملة؟')) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await deleteSentence(id);
      
      if (response.success) {
        console.log('✅', response.message);
        
        // حذف الجملة من القائمة
        setSentences(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      console.error('❌ خطأ في حذف الجملة:', err);
      
      const errorMessage = err.response?.data?.message || 'حدث خطأ في حذف الجملة';
      
      if (err.response?.status === 403) {
        alert('🚫 غير مسموح! يمكنك فقط حذف الجمل التي أضفتها أنت');
      } else if (err.response?.status === 404) {
        alert('❌ الجملة غير موجودة');
        fetchSentences(); // إعادة تحميل القائمة
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = () => {
    if (!editGerman.trim() || !editArabic.trim()) {
      alert('يرجى إدخال الجملة والترجمة');
      return;
    }
    updateSentenceHandler(editingId, { 
      german: editGerman.trim(), 
      arabic: editArabic.trim() 
    });
    setEditingId(null);
  };

  // Props for the sentence list
  const sentenceListProps = {
    sentences,
    editingId,
    editGerman,
    setEditGerman,
    editArabic,
    setEditArabic,
    saveEdit,
    setEditingId,
    deleteSentence: deleteSentenceHandler,
    loading
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="max-width">
        
        {/* إحصائيات مبسطة من Backend */}
        <StatsMinimal />

        {/* عرض الأخطاء */}
        {error && (
          <div className="error-banner" style={{
            padding: '12px 20px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <AddSentenceForm
          newGerman={newGerman}
          setNewGerman={setNewGerman}
          newArabic={newArabic}
          setNewArabic={setNewArabic}
          addSentence={addSentence}
          loading={loading}
        />

        <FilterButtons
          flashcardMode={flashcardMode}
          setFlashcardMode={setFlashcardMode}
        />

        {loading && !flashcardMode ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p>جاري التحميل...</p>
          </div>
        ) : flashcardMode ? (
          <FlashcardView
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
