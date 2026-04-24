import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/hooks/use-toast';
import { registerSW } from 'virtual:pwa-register';

const LEGACY_CACHE_PREFIXES = [
  'mei-financas-v1',
  'mei-financas-v2',
  'mei-financas-v3',
  'mei-financas-v4',
  'mei-static-',
  'mei-dynamic-',
];

const LEGACY_CACHE_NAMES = new Set([
  'supabase-cache',
  'supabase-cache-v1',
  'supabase-cache-v2',
  'supabase-cache-v3',
  'supabase-cache-v4',
  'images-cache',
  'images-cache-v1',
  'images-cache-v2',
  'images-cache-v3',
  'images-cache-v4',
]);

const UPDATE_POLL_INTERVAL = 60_000;
const AUTO_APPLY_DELAY = 1_500;

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

let hasReloadedForController = false;
let hasShownUpdateToast = false;
let autoApplyTimeout: number | null = null;

function isLegacyCacheKey(key: string) {
  return LEGACY_CACHE_NAMES.has(key) || LEGACY_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

async function clearCaches(filter: (key: string) => boolean) {
  if (!('caches' in window)) return;

  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter(filter).map((key) => caches.delete(key)));
  } catch {
    // noop
  }
}

async function clearLegacyCaches() {
  await clearCaches(isLegacyCacheKey);
}

async function clearAllCaches() {
  await clearCaches(() => true);
}

async function unregisterServiceWorkers(match?: (registration: ServiceWorkerRegistration) => boolean) {
  const registrations = await navigator.serviceWorker.getRegistrations();

  await Promise.all(
    registrations
      .filter((registration) => (match ? match(registration) : true))
      .map(async (registration) => {
        try {
          registration.active?.postMessage({ type: 'LEGACY_SW_CLEAR' });
        } catch {
          // noop
        }

        await registration.unregister();
      })
  );
}

async function disableServiceWorkersForPreview() {
  await unregisterServiceWorkers();
  await clearAllCaches();
}

async function cleanupLegacyPWA() {
  await unregisterServiceWorkers((registration) => {
    const scriptUrl = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || '';
    return scriptUrl.endsWith('/sw.js');
  });

  await clearLegacyCaches();
}

function reloadAppOnce() {
  if (hasReloadedForController) return;
  hasReloadedForController = true;
  window.location.reload();
}

function showUpdateToast(applyUpdate: () => Promise<void>) {
  if (autoApplyTimeout) {
    window.clearTimeout(autoApplyTimeout);
  }

  if (!hasShownUpdateToast) {
    hasShownUpdateToast = true;
    toast({
      title: 'Atualizando…',
      description: 'Carregando a versão mais recente do app.',
      duration: 4000,
    });
  }

  // Aplica imediatamente — com skipWaiting+clientsClaim o controllerchange
  // dispara reload automático, sem depender de clique do usuário.
  autoApplyTimeout = window.setTimeout(() => {
    void applyUpdate();
  }, 300);
}

function attachUpdateListeners(registration: ServiceWorkerRegistration, applyUpdate: () => Promise<void>) {
  const checkForUpdate = () => {
    registration.update().catch(() => {
      // noop
    });
  };

  window.setTimeout(checkForUpdate, 3000);
  window.setInterval(checkForUpdate, UPDATE_POLL_INTERVAL);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdate();
    }
  });

  window.addEventListener('focus', checkForUpdate);
  window.addEventListener('online', checkForUpdate);
  window.addEventListener('pageshow', checkForUpdate);

  if (registration.waiting) {
    showUpdateToast(applyUpdate);
  }

  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        showUpdateToast(applyUpdate);
      }
    });
  });

  navigator.serviceWorker.addEventListener('controllerchange', reloadAppOnce);
}

export function setupPWA() {
  if (!('serviceWorker' in navigator)) return;

  if (isInIframe || isPreviewHost) {
    void disableServiceWorkersForPreview();
    return;
  }

  void cleanupLegacyPWA();

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      showUpdateToast(() => updateSW(true));
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      attachUpdateListeners(registration, () => updateSW(true));
    },
  });
}