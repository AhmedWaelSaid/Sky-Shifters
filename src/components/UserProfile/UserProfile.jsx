// src/components/UserProfile.jsx
import "./UserProfile.css";
import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { getNotifications, getNotificationCount } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isChecked, setIsChecked] = useState(theme === "light");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsChecked(!isChecked);
    toggleTheme();
  };

  // جلب عدد الإشعارات الجديدة
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await getNotificationCount();
        console.log('[UserProfile] getNotificationCount result:', res);
        setNewCount(res.data?.count || 0);
      } catch (e) {
        console.error('[UserProfile] getNotificationCount error:', e);
        setNewCount(0);
      }
    }
    fetchCount();
  }, []);

  // جلب الإشعارات عند فتح القائمة
  const toggleNotifications = async () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    console.log('[UserProfile] toggleNotifications: open', !isNotificationsOpen);
    if (!isNotificationsOpen) {
      setLoading(true);
      try {
        const res = await getNotifications();
        console.log('[UserProfile] getNotifications result:', res);
        setNotifications(res.data || []);
        setNewCount(0);
      } catch (e) {
        console.error('[UserProfile] getNotifications error:', e);
        setNotifications([]);
      }
      setLoading(false);
    }
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  // عند الضغط على إشعار
  const handleNotificationClick = (notif) => {
    console.log('[UserProfile] handleNotificationClick:', notif);
    if (notif.bookingId) {
      navigate(`/my-bookings/${notif.bookingId}`);
    }
    setIsNotificationsOpen(false);
  };

  // عند الضغط على View all
  const handleViewAll = () => {
    console.log('[UserProfile] handleViewAll: navigate to /profile?tab=notifications');
    navigate('/profile?tab=notifications');
    setIsNotificationsOpen(false);
  };

  return (
    <div className="navigation-card">
      {/* Tab 1: Plane Switch (for Dark Mode/Light Mode) */}
      <label className="plane-switch">
        <input type="checkbox" checked={isChecked} onChange={handleToggle} />
        <div>
          <div>
            <svg viewBox="0 0 13 13">
              <path
                d="M1.55989957,5.41666667 L5.51582215,5.41666667 L4.47015462,0.108333333 L4.47015462,0.108333333 C4.47015462,0.0634601974 4.49708054,0.0249592654 4.5354546,0.00851337035 L4.57707145,0 L5.36229752,0 C5.43359776,0 5.50087375,0.028779451 5.55026392,0.0782711996 L5.59317877,0.134368264 L7.13659662,2.81558333 L8.29565964,2.81666667 C8.53185377,2.81666667 8.72332694,3.01067661 8.72332694,3.25 C8.72332694,3.48932339 8.53185377,3.68333333 8.29565964,3.68333333 L7.63589819,3.68225 L8.63450135,5.41666667 L11.9308317,5.41666667 C12.5213171,5.41666667 13,5.90169152 13,6.5 C13,7.09830848 12.5213171,7.58333333 11.9308317,7.58333333 L8.63450135,7.58333333 L7.63589819,9.31666667 L8.29565964,9.31666667 C8.53185377,9.31666667 8.72332694,9.51067661 8.72332694,9.75 C8.72332694,9.98932339 8.53185377,10.1833333 8.29565964,10.1833333 L7.13659662,10.1833333 L5.59317877,12.8656317 C5.55725264,12.9280353 5.49882018,12.9724157 5.43174295,12.9907056 L5.36229752,13 L4.57707145,13 L4.55610333,12.9978962 C4.51267695,12.9890959 4.48069792,12.9547924 4.47230803,12.9134397 L4.47223088,12.8704208 L5.51582215,7.58333333 L1.55989957,7.58333333 L0.891288881,8.55114605 C0.853775374,8.60544678 0.798421006,8.64327676 0.73629202,8.65879796 L0.672314689,8.66666667 L0.106844414,8.66666667 L0.0715243949,8.66058466 L0.0715243949,8.66058466 C0.0297243066,8.6457608 0.00275502199,8.60729104 0,8.5651586 L0.00593007386,8.52254537 L0.580855011,6.85813984 C0.64492547,6.67265611 0.6577034,6.47392717 0.619193545,6.28316421 L0.580694768,6.14191703 L0.00601851064,4.48064746 C0.00203480725,4.4691314 0,4.45701613 0,4.44481314 C0,4.39994001 0.0269259152,4.36143908 0.0652999725,4.34499318 L0.106916826,4.33647981 L0.672546853,4.33647981 C0.737865848,4.33647981 0.80011301,4.36066329 0.848265401,4.40322477 L0.89131128,4.45169723 L1.55989957,5.41666667 Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="street-middle"></span>
          <span className="cloud"></span>
          <span className="cloud two"></span>
        </div>
      </label>

      {/* Tab 2: Notification Bell Icon with Dropdown */}
      <div className="tab notification-tab">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg
            className="svgIcon bell"
            viewBox="0 0 448 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={toggleNotifications}
            style={{ cursor: 'pointer' }}
          >
            <path
              d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"
              fill="black"
            />
          </svg>
          {newCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -5,
              right: -5,
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 2
            }}>{newCount}</span>
          )}
        </div>
        {isNotificationsOpen && (
          <div className="notifications-dropdown">
            <div className="dropdown-header">
              <span className="connected-status">
                <span className="status-dot"></span> Connected
              </span>
              <button className="close-btn" onClick={toggleNotifications}>
                ✕
              </button>
            </div>
            <div className="dropdown-content">
              {loading ? (
                <p>Loading notifications...</p>
              ) : notifications.length === 0 ? (
                <>
                  <h3>You are all caught up!</h3>
                  <p>You have no new notifications. Notifications are deleted after 30 days</p>
                  <button className="view-all-btn" onClick={handleViewAll}>View all</button>
                </>
              ) : (
                <>
                  
                  <ul className="notifications-list" style={{padding:0, margin:0, width:'100%'}}>
                    {notifications.map((notif, idx) => (
                      <li
                        key={idx}
                        className={notif.state === 0 ? 'notification-item new' : 'notification-item'}
                        style={{
                          background: '#e3f2fd',
                          border: '1.5px solid #2196f3',
                          margin: '0 0 0.7rem 0',
                          padding: '0.7rem 1rem',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(33,150,243,0.08)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          direction: 'ltr',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          color: '#1565c0',
                          fontWeight: 'normal',
                          fontSize: '0.60em',
                          transition: 'box-shadow 0.2s',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',display:'inline-block',width:'100%'}}>
                          Your flight is approaching. Please check the flight details.
                          <span style={{ fontSize: '0.82em', color: '#888', marginLeft: 8 }}>
                            Booking ID: {notif.bookingId}
                          </span>
                        </span>
                        {notif.state === 0 && <span className="new-badge"> New</span>}
                      </li>
                    ))}
                  </ul>
                  <button className="view-all-btn" onClick={handleViewAll}>View all</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
