import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addDebugBanner } from '@/lib/errorHandling';
import { registerSW } from 'virtual:pwa-register';

addDebugBanner();

// ----------------------------------------------------------------------------
// PWA / Service Worker — estratégia de atualização confiável (mobile incluído)
// ----------------------------------------------------------------------------
// Regras:
// 1. NUNCA registrar SW dentro de iframe (preview do Lovable) nem em hosts de
//    preview — evita cache poluído travando builds novos.
// 2. Em produção: autoUpdate + skipWaiting. Ao detectar nova versão, ativar
//    imediatamente e recarregar a aba.
// 3. Verificar atualização periodicamente E em eventos do ciclo de vida
//    (visibilitychange, focus, online) — crítico para PWA instalado no mobile,
//    onde o app fica suspenso e raramente é "reiniciado" do zero.
// 4. Limpar SWs e caches legados.
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

// Helper: limpa todos os caches conhecidos (legado + atuais)
async function nukeAllCaches() {
  if (!('caches' in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    /* noop */
  }
}

if ('serviceWorker' in navigator) {
  if (isInIframe || isPreviewHost) {
    // Preview/iframe: desregistra qualquer SW e limpa caches.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    nukeAllCaches();
  } else {
    // Produção
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Nova versão pronta: ativa skipWaiting e recarrega.
        updateSW(true);
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        const checkForUpdate = () => {
          registration.update().catch(() => {});
        };

        // 1) Polling a cada 60s enquanto a aba está aberta
        setInterval(checkForUpdate, 60_000);

        // 2) Quando o app volta ao primeiro plano (CRÍTICO no mobile/PWA instalado)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdate();
        });

        // 3) Quando a janela ganha foco
        window.addEventListener('focus', checkForUpdate);

        // 4) Quando a conexão volta
        window.addEventListener('online', checkForUpdate);

        // 5) Quando o controller muda (novo SW assumiu) — força reload uma única vez
        let reloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (reloaded) return;
          reloaded = true;
          window.location.reload();
        });
      },
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
