import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Der Name ist erforderlich';
    }
    if (!formData.email) {
      newErrors.email = 'Die E-Mail-Adresse ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Die E-Mail-Adresse ist ungültig';
    }
    if (!formData.password) {
      newErrors.password = 'Das Passwort ist erforderlich';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Das Passwort muss mindestens 8 Zeichen lang sein';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Die Passwörter stimmen nicht überein';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccessMessage('');
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    setLoading(false);
    if (result.success) {
      setSuccessMessage(result.message);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 3000);
    } else {
      if (Array.isArray(result.errors)) {
        const newErrors = {};
        result.errors.forEach(error => {
          const errorLower = error.toLowerCase();
          if (errorLower.includes('email') || errorLower.includes('e-mail')) {
            newErrors.email = error;
          } else if (errorLower.includes('name')) {
            newErrors.name = error;
          } else if (errorLower.includes('password') || errorLower.includes('passwort')) {
            newErrors.password = error;
          } else {
            newErrors.general = error;
          }
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Neues Konto erstellen</h2>

        {successMessage && <div style={styles.successAlert}>{successMessage}</div>}
        {errors.general && <div style={styles.errorAlert}>{errors.general}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input type="text" name="name" value={formData.name}
              onChange={handleChange} style={styles.input} placeholder="Ihr Name" />
            {errors.name && <span style={styles.error}>{errors.name}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>E-Mail</label>
            <input type="text" name="email" value={formData.email}
              onChange={handleChange} style={styles.input} placeholder="beispiel@email.com" />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Passwort</label>
            <input type="password" name="password" value={formData.password}
              onChange={handleChange} style={styles.input} placeholder="••••••••" />
            {errors.password && <span style={styles.error}>{errors.password}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Passwort bestätigen</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} style={styles.input} placeholder="••••••••" />
            {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Konto wird erstellt...' : 'Konto erstellen'}
          </button>
        </form>

        <p style={styles.footer}>
          Bereits ein Konto?{' '}
          <Link to="/login" style={styles.link}>Anmelden</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',          // ← بدل minHeight، هيك الصفحة بتضل بحدود الشاشة
    overflowY: 'auto',        // ← الـ scroll بيصير داخل الـ container مش على الـ page
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    margin: 'auto',           // ← يضمن التمركز حتى لما الكارد أطول من الشاشة
  },
  title: { textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontWeight: '600', color: '#555', fontSize: '14px' },
  input: { padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', outline: 'none', width: '100%' },
  button: {
    padding: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
    fontWeight: '600', marginTop: '5px', width: '100%',
  },
  error: { color: '#e74c3c', fontSize: '13px' },
  successAlert: { background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c3e6cb' },
  errorAlert: { background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' },
  footer: { textAlign: 'center', marginTop: '10px', color: '#666' },
  link: { color: '#667eea', textDecoration: 'none', fontWeight: '600' }
};

export default Register;
