// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../services/ScrollToTop';
import Chatbot from '../services/chatbot/Chatbot'

export default function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet />
      <Chatbot/>
      <Footer />
    </>
  );
}
