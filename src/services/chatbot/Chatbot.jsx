import { useState, useContext, useRef, useEffect } from "react";
import styles from "./Chatbot.module.css";
import { useAuth } from "../../components/context/AuthContext";
import chatbotDark from "../../assets/chatbot-dark.png";
import chatbotLight from "../../assets/chatbot.png";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { ThemeContext } from "../../components/context/ThemeContext"; // نفس الـ ThemeContext المستخدم في الـ Header
const InitialMessages = [
  {
    id: 0,
    text: "Welcome to Taier AI , I'm here to help you , feel free to ask anything flight related , I can do awesome things like search for flights, show your booked flight, cancel any of them, update your info , change password and answer any customer service questions 🛩",
    sender: "ai",
  },
];
async function sendRequest(body) {
  if (!body) return;
  try {
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
export default function Chatbot({ setChatbotFlights }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useContext(ThemeContext); // نجيب الـ Theme الحالي (light أو dark)
  const [messages, setMessages] = useState(InitialMessages);
  const [userMessage, setUserMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [flightsData, setFlightsData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const textareaRef = useRef(null);
  const messageEndRef = useRef(null);
  const { isAuthenticated } = useAuth();

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
    if (!isOpen) {
      setSessionId(uuidv4()); // generate a new session ID
    }
    setIsOpen(!isOpen);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length, text: userMessage, sender: "user" },
    ]); // set user message
    setUserMessage(""); //empty text area

    const body = {
      message: userMessage,
      access_token: user.token,
      user_id: user.userId,
      session_id: sessionId,
    };

    setIsLoading(true);
    const result = await sendRequest(body);
    setIsLoading(false);
    console.log(result);
    if (result?.response?.message) {
      //check if response exists
      if (
        result.response.type === "search_flights" &&
        result.response.data == null
      )
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length,
            text: "The AI couldn`t return the flights data.",
            sender: "ai",
          },
        ]);
      else if (
        result.response.type === "search_flights" &&
        result.response.data.data !== null
      ) {
        setFlightsData(result.response.data);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length,
            text: result.response.message,
            sender: "ai",
            type: result.response.type,
          },
        ]);
      } else
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length,
            text: result.response.message,
            sender: "ai",
            type: result.response.type,
          },
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
              <button
                className={styles.exitChat}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                X
              </button>
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
                          {msg.text+" "} 
                          {!isAuthenticated && "(Log in needed to start chat) "}
                          {msg.type == "search_flights" && (
                            <Link
                              to="/selected-flights"
                              onClick={() => {
                                if (flightsData) setChatbotFlights(flightsData);
                              }}
                              className={styles.flightSearchLink}
                            >
                              Flights page
                            </Link>
                          )}
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
                minLength={10}
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
Chatbot.propTypes = {
  setChatbotFlights: PropTypes.func,
}