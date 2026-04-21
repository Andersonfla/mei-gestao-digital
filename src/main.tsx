import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addDebugBanner } from '@/lib/errorHandling';
import { setupPWA } from '@/lib/pwa';

addDebugBanner();

setupPWA();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
