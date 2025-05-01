import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/context/AuthContext';
import { DataProvider } from './components/context/DataContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      
      <AuthProvider>
        <DataProvider>
        <App />
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
