import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage() {
  const { login, register, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        // تسجيل الدخول
        if (!formData.email || !formData.password) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
          setLoading(false);
          return;
        }
        
        result = await login(formData.email, formData.password);
      } else {
        // التسجيل
        if (!formData.name || !formData.email || !formData.password) {
          setError('يرجى إدخال جميع البيانات المطلوبة');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setLoading(false);
          return;
        }
        
        result = await register(formData.name, formData.email, formData.password);
        console.log('نتيجة التسجيل:', result);
      }

      if (!result.success) {
        setError(result.error);
      }
      
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          {/* العنوان */}
          <div className="auth-header">
            <div className="auth-logo">
              🎓
            </div>
            <h1 className="auth-title">
              {isLogin ? 'مرحباً بعودتك!' : 'انضم إلينا!'}
            </h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'سجل دخولك لمتابعة تعلم الألمانية' 
                : 'أنشئ حساباً جديداً وابدأ رحلة التعلم'}
            </p>
          </div>

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* الاسم (فقط للتسجيل) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">
                  <User size={18} />
                  الاسم
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}

            {/* البريد الإلكتروني */}
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* كلمة المرور */}
            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                كلمة المرور
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder={isLogin ? '••••••••' : 'على الأقل 6 أحرف'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* رسالة الخطأ */}
            {(error || authError) && (
              <div className="error-message">
                <span>⚠️</span>
                {error || authError}
              </div>
            )}

            {/* زر الإرسال */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">⏳ جاري التحميل...</span>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
                </>
              )}
            </button>
          </form>

          {/* التبديل بين تسجيل الدخول والتسجيل */}
          <div className="auth-footer">
            <p>
              {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            </p>
            <button 
              type="button" 
              className="toggle-mode-btn"
              onClick={toggleMode}
              disabled={loading}
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="auth-info">
          <div className="info-card">
            <span className="info-icon">📚</span>
            <h3>تعلم ذكي</h3>
            <p>نظام SM-2 للمراجعة المتباعدة</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📊</span>
            <h3>تتبع التقدم</h3>
            <p>إحصائيات دقيقة لأدائك</p>
          </div>
          <div className="info-card">
            <span className="info-icon">🎯</span>
            <h3>أهداف مخصصة</h3>
            <p>حدد هدفك اليومي</p>
          </div>
        </div>
      </div>
    </div>
  );
}
