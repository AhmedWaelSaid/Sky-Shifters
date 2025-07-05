// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../services/ScrollToTop';
import Chatbot from '../services/chatbot/Chatbot'
import { useState } from 'react';

export default function MainLayout() {
  const [chatbotFlights, setChatbotFlights] = useState(null)
  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet context={{chatbotFlights,setChatbotFlights}}/>
      <Chatbot setChatbotFlights={setChatbotFlights}/>
      <Footer />
    </>
  );
}
