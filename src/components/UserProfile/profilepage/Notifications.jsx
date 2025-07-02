import React, { useEffect, useState } from 'react';
import { getNotifications } from '../../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import './ProfileSection.module.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        const res = await getNotifications();
        setNotifications(res.data || []);
      } catch (e) {
        setNotifications([]);
      }
      setLoading(false);
    }
    fetchNotifications();
  }, []);

  const handleNotificationClick = (notif) => {
    if (notif.bookingId) {
      navigate(`/my-bookings/${notif.bookingId}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>You have no notifications.</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notif, idx) => (
            <li
              key={idx}
              className={notif.state === 0 ? 'notification-item new' : 'notification-item'}
              style={{
                background: notif.state === 0 ? 'var(--notification-bg, #e3f2fd)' : 'var(--bg-color, #181818)',
                border: notif.state === 0 ? '1.5px solid var(--notification-border, #2196f3)' : '1.5px solid var(--notification-border, #333)',
                marginBottom: '1rem',
                padding: '1.1rem 1.5rem',
                borderRadius: '10px',
                cursor: notif.bookingId ? 'pointer' : 'default',
                boxShadow: '0 2px 8px rgba(33,150,243,0.08)',
                whiteSpace: 'normal',
                overflow: 'visible',
                textOverflow: 'unset',
                direction: 'ltr',
                textAlign: 'left',
                color: 'var(--notification-text, #1565c0)',
                fontWeight: 500,
                fontSize: '1.08rem',
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => handleNotificationClick(notif)}
            >
              <span style={{whiteSpace:'normal',overflow:'visible',textOverflow:'unset',display:'block',width:'100%'}}>
                Your flight is approaching. Please check the flight details.
                <br />
                <span className="booking-id">
                  Booking ID: {notif.bookingId}
                </span>
                <br />
                <span className="notification-hint" style={{fontSize:'0.85em',color:'var(--notification-id, #888)'}}>Go to My Bookings page to see details.</span>
              </span>
              {notif.state === 0 && <span className="new-badge"> New</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 