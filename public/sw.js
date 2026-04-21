// Service Worker legado desativado.
// O PWA agora é totalmente gerenciado pelo vite-plugin-pwa.
// Este arquivo permanece apenas para se auto-desregistrar em clientes que
// ainda tenham a versão antiga instalada (cache-first agressivo).

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((c) => c.navigate(c.url));
    } catch (e) {
      // noop
    }
  })());
});

// Não intercepta nenhum fetch — deixa a rede passar direto.
self.addEventListener('fetch', () => {});
