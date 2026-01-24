import { useState, useEffect } from 'react';
import { 
  subscribeToNotifications, 
  checkNotificationPermission 
} from '../../services/notificationsApi';

const NotificationPermission = () => {
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const currentPermission = checkNotificationPermission();
    setPermission(currentPermission);
  }, []);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await subscribeToNotifications();
      
      if (result.success) {
        setPermission('granted');
        setMessage('✅ تم تفعيل الإشعارات بنجاح!');
      } else {
        setMessage('❌ ' + result.message);
      }
    } catch (error) {
      setMessage('❌ حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  if (permission === 'granted') {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div style={styles.bannerDenied}>
        <p>⚠️ الإشعارات محظورة. يمكنك تفعيلها من إعدادات المتصفح.</p>
      </div>
    );
  }

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <h3 style={{margin: '0 0 10px 0', fontSize: '1.5rem'}}>🔔 تفعيل الإشعارات</h3>
        <p style={{margin: '0 0 20px 0', opacity: 0.9}}>احصل على تنبيهات عندما يحين وقت مراجعة الجمل</p>
        
        <button 
          onClick={handleRequestPermission}
          disabled={isLoading}
          style={{
            ...styles.button,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'جاري التفعيل...' : 'تفعيل الإشعارات'}
        </button>

        {message && (
          <p style={message.includes('✅') ? styles.success : styles.error}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    margin: '20px 0',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  bannerDenied: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    margin: '20px 0',
    textAlign: 'center',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  button: {
    background: 'white',
    color: '#667eea',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
  },
  success: {
    marginTop: '15px',
    padding: '10px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.2)',
    fontWeight: '500',
  },
  error: {
    marginTop: '15px',
    padding: '10px',
    borderRadius: '6px',
    background: 'rgba(255, 0, 0, 0.2)',
    fontWeight: '500',
  }
};

export default NotificationPermission;
