import React from 'react';
import { 
  ShoppingCart, 
  Tag, 
  TrendingUp, 
  Crown, 
  Wallet, 
  MessageSquare, 
  Bell, 
  Star, 
  Settings, 
  User 
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const menuItems = [
    { icon: ShoppingCart, label: 'Orders', hasDropdown: true },
    { icon: Tag, label: 'Offers', hasDropdown: true },
    { icon: TrendingUp, label: 'Boosting', hasDropdown: true },
    { icon: Crown, label: 'Loyalty', badge: 'BETA' },
    { icon: Wallet, label: 'Wallet' },
    { icon: MessageSquare, label: 'Messages' },
    { icon: Bell, label: 'Notifications' },
    { icon: Star, label: 'Feedback' },
    { icon: Settings, label: 'Account settings', active: true },
    { icon: User, label: 'View Profile' }
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
          <div key={index} className={`${styles.menuItem} ${item.active ? styles.active : ''}`}>
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

