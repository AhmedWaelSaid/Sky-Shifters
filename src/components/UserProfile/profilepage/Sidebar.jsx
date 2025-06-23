import React from 'react';
import { 
  Bell, 
  Settings, 
  User 
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ onSelectPage }) => {
  const menuItems = [
    { icon: Bell, label: 'Notifications', page: 'notifications' },
    { icon: Settings, label: 'Account settings', page: 'account' },
    { icon: User, label: 'View Profile', page: 'profile' }
  ];

  return (
    <div className={styles.sidebar}>
      {/* User Profile Section */}
      <div className={styles.userProfile}>
        <div className={styles.avatar}>
          <img src="/api/placeholder/40/40" alt="User Avatar" />
        </div>
        <div className={styles.userInfo}>
          <h3>GraceHermit15...</h3>
          <p>Registered: 4/11/24</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className={styles.navigation}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={styles.menuItem}
            onClick={() => onSelectPage && onSelectPage(item.page)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.menuContent}>
              <item.icon className={styles.icon} size={20} />
              <span className={styles.label}>{item.label}</span>
              {item.badge && (
                <span className={styles.badge}>{item.badge}</span>
              )}
              {item.hasDropdown && (
                <span className={styles.dropdown}>▼</span>
              )}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

