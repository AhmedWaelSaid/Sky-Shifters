// src/App.jsx
import { Routes, Route} from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './components/Header';
import { ThemeProvider } from './components/context/ThemeContext'; 
import { MenuProvider } from './components/context/menuContext';
const HeroSection = lazy(() => import('./components/Find-Flight/HeroSection'));
const FlightSearchForm = lazy(() => import('./components/Find-Flight/FlightSearchForm'));
const TravelOffers = lazy(() => import('./components/Find-Flight/TravelOffers'));
const Footer = lazy(() => import('./components/Footer'));
const Auth = lazy(() => import('./components/Auth/Auth'));
const UserProfile = lazy(() => import('./components/UserProfile/UserProfile'));


export default function App() {
  return (
    <div className="app">
    <ThemeProvider>
    <MenuProvider>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<><HeroSection /><FlightSearchForm /><TravelOffers /></>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          
        </Routes>
      </Suspense>
      <Footer />
      </MenuProvider>
      </ThemeProvider>
    </div>
  );
}