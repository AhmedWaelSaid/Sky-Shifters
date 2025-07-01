// src/router/index.js
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';

import HeroSection from '../pages/Home/HeroSection';
import FlightSearchForm from '../pages/Home/FlightSearchForm';
import TravelOffers from '../pages/Home/TravelOffers';
import SelectedFlights from "../pages/SelectedFlights/Container";
import Flights from '../pages/SelectedFlights/Flights';
import Auth from '../components/Auth/Auth';
import ForgotPassword from '../components/Auth/ForgotPassword';
import VerifyEmail from '../components/Auth/VerifyEmail';
import UserProfile from '../components/UserProfile/UserProfile';
import FlightDetails from '../pages/FlightDetails/FlightDetails';
import ErrorPage from '../components/ErrorPage';
import BookingList from '../pages/MyBookings/BookingList';
import AirplaneSeatMap from '../pages/MyBookings/AirplaneSeatMap/AirplaneSeatMap';
import Settings from '../components/UserProfile/profilepage/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,  // MainLayout includes Header, Footer, and an <Outlet />
    errorElement: <ErrorPage/>,
    children: [
      {
        index: true,
        element: (
          <>
            <HeroSection />
            <FlightSearchForm />
            <TravelOffers />
          </>
        ),
      },
      {
        path: 'UserProfile',
        element: <UserProfile />,
      },
      // Auth routes under MainLayout so Header/Footer show on auth pages too
      {
        path: 'auth',
        element: <Auth />,
      },
      
      {
        path: 'auth/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'auth/verify-email',
        element: <VerifyEmail />,
      },
      {
        path: 'selected-flights',
        element: <Flights/>,
        children: [
          {
            index: true,
            element: <SelectedFlights />,
          },
          {
            path: 'flight-details',
            element: <FlightDetails/>,
          },
                  ]
      },
      {
        path: 'my-bookings',
        element: <BookingList />,
      },
      {
        path: 'seat-map',
        element: <AirplaneSeatMap />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'profile',
        element: <Settings />,
      },
    ],
  },
]);

export default router;
