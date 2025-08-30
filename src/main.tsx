import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { addDebugBanner } from '@/lib/errorHandling';

// Adicionar banner de debug em desenvolvimento
addDebugBanner();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
