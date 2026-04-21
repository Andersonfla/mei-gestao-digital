import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addDebugBanner } from '@/lib/errorHandling';
import { registerSW } from 'virtual:pwa-register';

addDebugBanner();

// ----------------------------------------------------------------------------
// PWA / Service Worker — estratégia de atualização confiável
// ----------------------------------------------------------------------------
// Regras:
// 1. NUNCA registrar SW dentro de iframe (preview do Lovable) nem em hosts de
//    preview — evita cache poluído travando builds novos.
// 2. Em produção, registrar com autoUpdate: ao detectar nova versão, ativar
//    imediatamente (skipWaiting) e recarregar a página para o usuário.
// 3. Limpar SWs e caches legados (o antigo /sw.js manual com cache-first).
// ----------------------------------------------------------------------------

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const host = window.location.hostname;
const isPreviewHost =
  host.includes('id-preview--') ||
  host.includes('lovableproject.com') ||
  host === 'localhost' ||
  host === '127.0.0.1';

if ('serviceWorker' in navigator) {
  if (isInIframe || isPreviewHost) {
    // Preview/iframe: desregistra qualquer SW e limpa caches para nunca servir versão antiga.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  } else {
    // Produção: ativa autoUpdate e força reload quando houver nova versão.
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        updateSW(true);
      },
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          // Verifica atualização periodicamente (a cada 60s) enquanto a aba estiver aberta.
          setInterval(() => {
            registration.update().catch(() => {});
          }, 60_000);
        }
      },
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
