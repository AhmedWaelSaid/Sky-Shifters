// src/router/index.js
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';

import HeroSection from '../pages/Home/HeroSection';
import FlightSearchForm from '../pages/Home/FlightSearchForm';
import TravelOffers from '../pages/Home/TravelOffers';
import SelectedFlights from "../pages/SelectedFlights/Container";

import Auth from '../components/Auth/Auth';
import ForgotPassword from '../components/Auth/ForgotPassword';
import ResetPassword from '../components/Auth/ResetPassword';
import VerifyEmail from '../components/Auth/VerifyEmail';
import UserProfile from '../components/UserProfile/UserProfile';
import FlightDetails from '../pages/FlightDetails/FlightDetails'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,  // MainLayout includes Header, Footer, and an <Outlet />
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
        path: 'auth/reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'auth/verify-email',
        element: <VerifyEmail />,
      },
      {
        path: 'selected-flights',
        element: <SelectedFlights />,
      },
      {
        path: 'FlightDetails',
        element: <FlightDetails/>,
      },
    ],
  },
]);

export default router;
