import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(
        formData.password
      )
    ) {
      newErrors.password =
        'كلمة المرور يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، ورمز خاص';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await resetPassword(token, formData.password);

    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setFormData({ password: '', confirmPassword: '' });
      
      // التوجيه لصفحة تسجيل الدخول بعد 3 ثواني
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>
        <h2 style={styles.title}>إعادة تعيين كلمة المرور</h2>
        <p style={styles.description}>أدخل كلمة المرور الجديدة لحسابك</p>

        {message.text && (
          <div
            style={
              message.type === 'success' ? styles.successAlert : styles.errorAlert
            }
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>كلمة المرور الجديدة</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
            />
            {errors.password && (
              <span style={styles.error}>{errors.password}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>تأكيد كلمة المرور</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span style={styles.error}>{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  icon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  title: {
    marginBottom: '15px',
    color: '#333',
    fontSize: '28px'
  },
  description: {
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'right'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#555',
    fontSize: '14px'
  },
  input: {
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none'
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px'
  },
  error: {
    color: '#e74c3c',
    fontSize: '13px'
  },
  successAlert: {
    background: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb',
    textAlign: 'right'
  },
  errorAlert: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    textAlign: 'right'
  }
};

export default ResetPassword;
