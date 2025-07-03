import { useState, useContext, useRef, useEffect } from "react";
import styles from "./Chatbot.module.css";
import { useAuth } from "../../components/context/AuthContext";
import chatbotDark from "../../assets/chatbot-dark.png";
import chatbotLight from "../../assets/chatbot.png";
import { ThemeContext } from "../../components/context/ThemeContext"; // نفس الـ ThemeContext المستخدم في الـ Header
const InitialMessages = [
  { id: 0, text: "hello, from user.", sender: "user" },
  {
    id: 1,
    text: "hello, from AI.",
    sender: "ai",
  },
];
async function sendRequest(body) {
  if (!body) return;
  try {
    console.log(body);
    const result = await fetch(
      "https://chatbot-sky-shifters.duckdns.org/chat",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!result.ok) {
      throw new Error(`Server responded with status ${result.status}`);
    }
    return await result.json();
  } catch (err) {
    console.error("Something went wrong:", err);
    return null;
  }
}
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useContext(ThemeContext); // نجيب الـ Theme الحالي (light أو dark)
  const [messages, setMessages] = useState(InitialMessages);
  const [userMessage, setUserMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);
  const textareaRef = useRef(null);
  const messageEndRef = useRef(null);
  const { isAuthenticated } = useAuth();
  console.log(messages);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [userMessage]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length, text: userMessage, sender: "user" },
      ]);

      setUserMessage("");
      const body = {
        message: userMessage,
        access_token: user.token,
        user_id: user.userId,
        session_id: `${messages.length - 1}`,
      };
      setIsLoading(true);
      const result = await sendRequest(body);
      setIsLoading(false);
      if (result?.response?.message) {
        setMessages((prev) => [
          ...prev,
          { id: prev.length, text: result.response.message, sender: "ai" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length,
            text: "Sorry, something went wrong.",
            sender: "ai",
          },
        ]);
      }
    } else return;
  };

  return (
        <div
          className={`${styles.chatbotContainer} ${theme === "dark" ? styles.dark : ""}`}
        >
          {/* زرار فتح/إغلاق الـ Chatbot */}
          <button className={styles.chatbotButton} onClick={toggleChatbot}>
            <img
              src={`${theme === "dark" ? chatbotDark : chatbotLight}`}
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
                  <button className={styles.exitChat} onClick={()=>{setIsOpen(false)}}>X</button>
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
                  {isLoading && (
                    <div className={`${styles.message} ${styles.fromAI}`}>
                      <div className={styles.aiLogo}></div>
                      <div className={styles.messageText}>
                        <div className={styles.spinner}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messageEndRef}></div>
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (isLoading) {
                          return;
                        } else {
                          handleSubmit(e);
                        }
                      }
                    }}
                  ></textarea>
                  <button
                    type="submit"
                    className={`${styles.submitBtn} ${isLoading ? styles.disabled : ""}`}
                    title="Send"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
