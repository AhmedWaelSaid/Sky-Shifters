import { useState, useContext, useRef, useEffect } from "react";
import styles from "./Chatbot.module.css";
import { useAuth } from "../../components/context/AuthContext";
import { ThemeContext } from "../../components/context/ThemeContext"; // نفس الـ ThemeContext المستخدم في الـ Header
const InitialMessages = [
  { id: 0, text: "hello, from user.", sender: "user" },
  {
    id: 1,
    text: "hello, from AI.",
    sender: "AI",
  },
];
async function sendRequest(body) {
  if (!body) return;
  const result = await fetch("https://chatbot-sky-shifters.duckdns.org/chat", {
    method: "POST",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((e) => console.error(e));

  console.log(result);
}
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useContext(ThemeContext); // نجيب الـ Theme الحالي (light أو dark)
  const [messages, setMessages] = useState(InitialMessages);
  const [userMessage, setUserMessage] = useState("");
  const textareaRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [userMessage]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      const user = localStorage.getItem("user");
      const body = {
        message: userMessage,
        access_token: user.accessToken,
        user_id: user.userId,
        session_id: messages.length - 1,
      };
      alert("success");
      sendRequest(body);
      setUserMessage("");
    } else return;
  };

  return (
    <div
      className={`${styles.chatbotContainer} ${theme === "dark" ? styles.dark : ""}`}
    >
      {/* زرار فتح/إغلاق الـ Chatbot */}
      <button className={styles.chatbotButton} onClick={toggleChatbot}>
        <img
          src={`${theme === "dark" ? "/assets/chatbot-dark.png" : "/assets/chatbot.png"}`}
          alt="chatbot"
          className={styles.chatbotLogo}
        />
      </button>
      {isOpen && (
        <form action="" onSubmit={handleSubmit}>
          <div className={styles.chatbot}>
            <div className={styles.chatbotStatus}>
              <div className={styles.logoTaierContainer}>
                <div className={`${styles.logo} ${styles.taier}`}></div>
                <div>
                  <span>Taier AI</span>
                  <div className={styles.online}>
                    <span className={styles.dot}></span>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.chatbotMessages}>
              {messages.map((msg) => (
                <>
                  <div
                    key={msg.id}
                    className={`${styles.message} ${msg.sender === "user" ? styles.fromUser : styles.fromAI}`}
                  >
                    {msg.sender === "user" ? (
                      <>
                        <div
                          className={`${styles.messageText} ${msg.sender === "user" ? styles.userMessageText : styles.aiMessageText}`}
                        >
                          {msg.text}
                        </div>
                        <div
                          className={`${msg.sender === "user" ? styles.userLogo : styles.aiLogo}`}
                        ></div>
                      </>
                    ) : (
                      <>
                        <div
                          className={`${msg.sender === "user" ? styles.userLogo : styles.aiLogo}`}
                        ></div>
                        <div
                          className={`${styles.messageText} ${msg.sender === "user" ? styles.userMessageText : styles.aiMessageText}`}
                        >
                          {msg.text}
                        </div>
                      </>
                    )}
                  </div>
                </>
              ))}
            </div>
            <div className={styles.chatbotInputContainer}>
              <textarea
                name="user_message"
                id="user_message"
                placeholder="Ask anything"
                required
                ref={textareaRef}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
              ></textarea>
              <button type="submit" className={styles.submitBtn}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <title>Send</title>
                  <path d="M3 20V14L11 12L3 10V4L22 12Z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
