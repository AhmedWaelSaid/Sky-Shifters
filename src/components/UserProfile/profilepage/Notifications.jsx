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
      <h2>Notifications</h2>
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
                background: notif.state === 0 ? '#e6f0ff' : 'white',
                marginBottom: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 4px #0001'
              }}
              onClick={() => handleNotificationClick(notif)}
            >
              <strong>{notif.title}</strong>
              <div>{notif.body}</div>
              {notif.state === 0 && <span className="new-badge">New</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 