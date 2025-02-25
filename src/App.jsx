import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FlightSearchForm from './components/FlightSearchForm';

import TravelOffers from './components/TravelOffers';
// import Footer from './components/Footer';

export default function App() {
  return (
    <div className="app">
      <Header />
      <HeroSection />
      <FlightSearchForm />
      <TravelOffers />
      {/* <Footer /> */}
    </div>
  );
}