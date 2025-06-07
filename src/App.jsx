import { useEffect, useState } from 'react';
import { ThemeProvider } from './components/context/ThemeContext'; 
import { MenuProvider } from './components/context/menuContext';
import MobileBlocker from './services/MobileBlocker/MobileBlocker';
import { RouterProvider } from 'react-router-dom';
import appRoutes from './Router/router.jsx';

// 1. استيراد مكتبات Stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// 2. تحميل Stripe باستخدام مفتاحك العام من ملف .env
// تأكد من أن المفتاح صحيح في ملف .env الخاص بك
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [checkedDevice, setCheckedDevice] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice = /android|iphone|ipad|mobile/i.test(userAgent.toLowerCase());
    setIsMobile(isMobileDevice);
    setCheckedDevice(true);
  }, []);

  if (!checkedDevice) return null;
  if (isMobile) return <MobileBlocker />;

  return (
    <div className="app">
      {/* 3. تغليف التطبيق بـ Elements Provider */}
      <Elements stripe={stripePromise}>
        <ThemeProvider>
          <MenuProvider>
            <RouterProvider router={appRoutes} />
          </MenuProvider>
        </ThemeProvider>
      </Elements>
    </div>
  );
}