import { useEffect, useState } from 'react';
import { ThemeProvider } from './components/context/ThemeContext'; 
import { MenuProvider } from './components/context/menuContext';
import MobileBlocker from './services/MobileBlocker/MobileBlocker';
import { RouterProvider } from 'react-router-dom';
import appRoutes from './Router/router.jsx';

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
      <ThemeProvider>
        <MenuProvider>
          <RouterProvider router={appRoutes} />
        </MenuProvider>
      </ThemeProvider>
    </div>
  );
}
