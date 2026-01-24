import { useState, useEffect } from 'react';
import { 
  toggleNotifications, 
  getNotificationStatus,
  unsubscribeFromNotifications 
} from '../../services/notificationsApi';

const NotificationSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNotificationStatus();
  }, []);

  const fetchNotificationStatus = async () => {
    setIsLoading(true);
    try {
      const result = await getNotificationStatus();
      if (result.success) {
        setIsSubscribed(result.data.subscribed);
        setIsEnabled(result.data.enabled);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    const newState = !isEnabled;
    setIsLoading(true);
    setMessage('');

    try {
      const result = await toggleNotifications(newState);
      
      if (result.success) {
        setIsEnabled(newState);
        setMessage(result.message);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + result.message);
      }
    } catch (error) {
      setMessage('❌ حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!window.confirm('هل أنت متأكد من إلغاء الاشتراك في الإشعارات؟')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await unsubscribeFromNotifications();
      
      if (result.success) {
        setIsSubscribed(false);
        setIsEnabled(false);
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('❌ حدث خطأ في إلغاء الاشتراك');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSubscribed) {
    return (
      <div style={styles.container}>
        <p>لم تفعّل الإشعارات بعد</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={{margin: '0 0 20px 0', color: '#333', fontSize: '1.3rem'}}>⚙️ إعدادات الإشعارات</h3>

      <div style={styles.settingItem}>
        <div style={{flex: 1}}>
          <label style={{display: 'block', marginBottom: '5px', color: '#333'}}>
            <strong>تفعيل الإشعارات</strong>
          </label>
          <p style={{margin: 0, color: '#666', fontSize: '0.9rem'}}>
            احصل على تنبيهات عند حلول موعد المراجعة
          </p>
        </div>

        <div style={styles.toggleSwitch}>
          <input
            type="checkbox"
            id="notification-toggle"
            checked={isEnabled}
            onChange={handleToggle}
            disabled={isLoading}
            style={{opacity: 0, width: 0, height: 0}}
          />
          <label 
            htmlFor="notification-toggle" 
            style={{
              ...styles.switchLabel,
              background: isEnabled ? '#4CAF50' : '#ccc',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <span style={{
              ...styles.switchButton,
              transform: isEnabled ? 'translateX(30px)' : 'translateX(0)'
            }}></span>
          </label>
        </div>
      </div>

      {message && (
        <div style={message.includes('✅') ? styles.success : styles.error}>
          {message}
        </div>
      )}

      <div style={styles.dangerZone}>
        <button 
          onClick={handleUnsubscribe}
          disabled={isLoading}
          style={{
            ...styles.dangerButton,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          إلغاء الاشتراك من الإشعارات
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    margin: '20px 0',
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  toggleSwitch: {
    position: 'relative',
  },
  switchLabel: {
    display: 'block',
    width: '60px',
    height: '30px',
    borderRadius: '30px',
    position: 'relative',
    transition: 'background 0.3s',
  },
  switchButton: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '24px',
    height: '24px',
    background: 'white',
    borderRadius: '50%',
    transition: 'transform 0.3s',
  },
  success: {
    padding: '12px',
    borderRadius: '6px',
    margin: '15px 0',
    textAlign: 'center',
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    fontWeight: '500',
  },
  error: {
    padding: '12px',
    borderRadius: '6px',
    margin: '15px 0',
    textAlign: 'center',
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    fontWeight: '500',
  },
  dangerZone: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  dangerButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    transition: 'background 0.3s',
  }
};

export default NotificationSettings;
