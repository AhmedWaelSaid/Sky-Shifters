import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient , QueryClientProvider} from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './services/ScrollToTop.jsx';
import { AuthProvider } from './components/context/AuthContext';
 // استورد الـ MenuProvider
const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
    <ScrollToTop />
    <AuthProvider>
    <App />
    </AuthProvider>
    
    </QueryClientProvider>
    </BrowserRouter>
    
  </StrictMode>,
)
