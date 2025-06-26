import React from 'react';
import { 
  Bell, 
  Settings, 
  User 
} from 'lucide-react';
import styles from './Sidebar.module.css';
import avatarLogo from '../../../assets/Asset 18@2x.png';

const Sidebar = ({ onSelectPage, currentPage, firstName, lastName, birthdate }) => {
  const menuItems = [
    { icon: Settings, label: 'Account settings', page: 'account' },
    { icon: User, label: 'View Profile', page: 'profile' },
    { divider: true },
    { icon: Bell, label: 'Notifications', page: 'notifications' }
  ];

  return (
    <div className={styles.sidebar}>
      {/* User Profile Section */}
      <div className={styles.userProfile}>
        <div className={styles.avatar}>
          <img src={avatarLogo} alt="User Avatar" />
        </div>
        <div className={styles.userInfo}>
          <h3>{(firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : 'User Name'}</h3>
          <p>{birthdate ? `Birthdate: ${birthdate}` : 'Birthdate: --'}</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className={styles.navigation}>
        {menuItems.map((item, index) => (
          item.divider ? (
            <div key={`divider-${index}`} style={{borderTop:'1.5px solid var(--profile-header-border)',margin:'10px 0'}}></div>
          ) : (
            <div
              key={item.page}
              className={
                styles.menuItem +
                (currentPage === item.page ? ' ' + styles.active : '')
              }
              onClick={() => onSelectPage && onSelectPage(item.page)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.menuContent}>
                {item.icon && <item.icon className={styles.icon} size={20} />}
                <span className={styles.label}>{item.label}</span>
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
                {item.hasDropdown && (
                  <span className={styles.dropdown}>▼</span>
                )}
              </div>
            </div>
          )
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

