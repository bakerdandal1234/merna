import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth/AuthPage.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎉 مرحباً بك</h1>
          <p>لوحة التحكم</p>
        </div>

        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            borderRadius: '12px',
            color: 'white',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 1rem 0' }}>مرحباً {user?.name || 'User'}</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>{user?.email}</p>
          </div>

          <div style={{ 
            background: '#f7fafc',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'right'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>معلومات الحساب</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: '#4a5568' }}>الحالة:</span>
                <span style={{ color: user?.isVerified ? '#48bb78' : '#f56565' }}>
                  {user?.isVerified ? '✓ مفعّل' : '✗ غير مفعّل'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: '#4a5568' }}>الدور:</span>
                <span style={{ color: '#667eea' }}>{user?.role || 'user'}</span>
              </div>
              {user?.createdAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#4a5568' }}>تاريخ التسجيل:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #f56565 0%, #c53030 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            تسجيل الخروج 🚪
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          <p style={{ color: '#718096', fontSize: '0.875rem' }}>
            🚀 MERN Authentication Starter Template
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
