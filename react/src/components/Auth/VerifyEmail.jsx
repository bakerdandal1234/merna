import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      const result = await verifyEmail(token);
      setLoading(false);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // التوجيه لصفحة تسجيل الدخول بعد 3 ثواني
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    };

    verify();
  }, [token, verifyEmail, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {loading ? (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>جاري التحقق من حسابك...</h2>
            <p style={styles.description}>يرجى الانتظار</p>
          </>
        ) : (
          <>
            <div style={styles.icon}>
              {message.type === 'success' ? '✅' : '❌'}
            </div>
            <h2 style={styles.title}>
              {message.type === 'success' ? 'تم التفعيل!' : 'فشل التفعيل'}
            </h2>
            <div
              style={
                message.type === 'success'
                  ? styles.successAlert
                  : styles.errorAlert
              }
            >
              {message.text}
            </div>

            {message.type === 'success' ? (
              <p style={styles.description}>
                سيتم توجيهك لصفحة تسجيل الدخول خلال 3 ثواني...
              </p>
            ) : (
              <div style={styles.footer}>
                <Link to="/login" style={styles.link}>
                  العودة لتسجيل الدخول
                </Link>
              </div>
            )}
          </>
        )}
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
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  icon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  title: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '28px'
  },
  description: {
    color: '#666',
    marginTop: '20px',
    lineHeight: '1.6'
  },
  successAlert: {
    background: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb'
  },
  errorAlert: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  footer: {
    marginTop: '20px'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px'
  }
};

// Add animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default VerifyEmail;
