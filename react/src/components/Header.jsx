import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div style={styles.header}>
      <div style={styles.container}>
        {/* Logo & Title */}
        <div style={styles.leftSection}>
          <h1 style={styles.logo}>🇩🇪 Baker</h1>
          <span style={styles.subtitle}>تعلم الألمانية</span>
        </div>

        {/* Desktop View */}
        <div style={styles.desktopMenu}>
          <div style={styles.userInfo}>
            <User size={20} color="#667eea" />
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.name}</span>
              <span style={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
          
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          style={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} color="#667eea" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <div style={styles.mobileUserInfo}>
            <User size={24} color="#667eea" />
            <div style={styles.mobileUserDetails}>
              <span style={styles.mobileUserName}>{user?.name}</span>
              <span style={styles.mobileUserEmail}>{user?.email}</span>
            </div>
          </div>
          
          <button onClick={handleLogout} style={styles.mobileLogoutButton}>
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    background: 'white',
    borderBottom: '2px solid #f0f0f0',
    padding: '1rem 0',
    marginBottom: '2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexShrink: 0
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#667eea'
  },
  subtitle: {
    color: '#666',
    fontSize: '0.85rem',
    display: 'none'
  },
  
  // Desktop Menu
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    background: '#f8f9ff',
    borderRadius: '8px'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333'
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#666'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    whiteSpace: 'nowrap'
  },

  // Mobile Menu Button
  mobileMenuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem'
  },

  // Mobile Menu
  mobileMenu: {
    display: 'none',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f0f0f0',
    background: 'white'
  },
  mobileUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f8f9ff',
    borderRadius: '8px'
  },
  mobileUserDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  mobileUserName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333'
  },
  mobileUserEmail: {
    fontSize: '0.85rem',
    color: '#666'
  },
  mobileLogoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
  }
};

// Add responsive styles and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Hover Effects */
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
  }
  
  button:active {
    transform: translateY(0);
  }

  /* Responsive Styles */
  @media (max-width: 650px) {
    /* Hide desktop menu */
    ${Object.entries(styles.desktopMenu).map(([key, value]) => 
      `[style*="desktopMenu"] { display: none !important; }`
    ).join('\n')}
    
    /* Show mobile menu button */
    ${Object.entries(styles.mobileMenuButton).map(([key, value]) => 
      `[style*="mobileMenuButton"] { display: block !important; }`
    ).join('\n')}
    
    /* Show subtitle on desktop only */
    ${Object.entries(styles.subtitle).map(([key, value]) => 
      `[style*="subtitle"] { display: inline !important; }`
    ).join('\n')}
    
    /* Smaller logo on mobile */
    h1 {
      font-size: 1.25rem !important;
    }
  }

  @media (min-width: 651px) {
    /* Show subtitle on larger screens */
    [style*="subtitle"] {
      display: inline !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Header;