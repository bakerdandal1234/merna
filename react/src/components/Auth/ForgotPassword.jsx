import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: 'error', text: 'Bitte geben Sie Ihre E-Mail-Adresse ein' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await forgotPassword(email);

    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setEmail('');
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🔑</div>
        <h2 style={styles.title}>Passwort vergessen?</h2>
        <p style={styles.description}>
          Geben Sie Ihre E-Mail-Adresse ein, und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts
        </p>

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
            <label style={styles.label}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="example@email.com"
            />
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
            {loading ? 'Sending...' : 'Link zum Zurücksetzen des Passworts senden'}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            Zurück zum Einloggen
          </Link>
        </div>
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
  },
  footer: {
    marginTop: '20px'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default ForgotPassword;
