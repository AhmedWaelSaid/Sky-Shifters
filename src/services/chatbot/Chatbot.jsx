import { useState, useEffect, useContext } from 'react';
import styles from './Chatbot.module.css';
import { FaSearch, FaHeart, FaCommentAlt, FaTimes, FaHome, FaQuestionCircle, FaTicketAlt, FaEnvelope } from 'react-icons/fa';
import { ThemeContext } from '../../components/context/ThemeContext'; // نفس الـ ThemeContext المستخدم في الـ Header

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useContext(ThemeContext); // نجيب الـ Theme الحالي (light أو dark)

  // التحكم في الـ Animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // نفس مدة الـ transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.chatbotContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      {/* زرار فتح/إغلاق الـ Chatbot */}
      <button className={styles.chatbotButton} onClick={toggleChatbot}>
        {isOpen ? <FaTimes /> : <FaCommentAlt />}
      </button>

      {/* نافذة الـ Chatbot مع الـ Animation */}
      {isVisible && (
        <div className={`${styles.chatbotWindow} ${isOpen ? styles.open : styles.close}`}>
          {/* الجزء العلوي (Header + Greeting) */}
          <div className={styles.topSection}>
            <div className={`${styles.header} ${isOpen ? styles.fadeIn : styles.fadeOut}`}>
              <span className={styles.logo}>SkyShifters</span>
            </div>

            <div className={`${styles.greeting} ${isOpen ? styles.fadeIn : styles.fadeOut}`}>
              <h2>
                Hi Traveler <FaHeart className={styles.heartIcon} />
              </h2>
              <p>How can we help with your journey?</p>
            </div>
          </div>

          {/* باقي المحتوى (يتأثر بالـ Dark Mode) */}
          <div className={styles.bottomSection}>
            {/* شريط البحث */}
            <div className={`${styles.searchBar} ${isOpen ? styles.fadeIn : styles.fadeOut}`}>
              <FaSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search for flight help" />
            </div>

            {/* قائمة الخيارات الخاصة بالطيران */}
            <ul className={`${styles.optionsList} ${isOpen ? styles.fadeIn : styles.fadeOut}`}>
              <li>Flight Booking</li>
              <li>Cancel Flight</li>
              <li>Check-In Process</li>
              <li>Baggage Policy</li>
              <li>Flight Status</li>
            </ul>

            {/* زرار Start a conversation */}
            <div className={`${styles.startConversation} ${isOpen ? styles.fadeIn : styles.fadeOut}`}>
              <button>Start a conversation</button>
              <p>We typically reply in under 3 minutes</p>
            </div>

            {/* الـ Footer (السطر اللي تحت) */}
            <div className={`${styles.footer} ${isOpen ? styles.fadeIn : styles.fadeOut}`}>
              <button className={styles.footerButton}>
                <FaHome />
                <span>Home</span>
              </button>
              <button className={styles.footerButton}>
                <FaQuestionCircle />
                <span>Help</span>
              </button>
              <button className={styles.footerButton}>
                <FaTicketAlt />
                <span>Tickets</span>
              </button>
              <button className={styles.footerButton}>
                <FaEnvelope />
                <span>Messages</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}