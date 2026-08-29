const CACHE_NAME = 'qr-msforms-shell-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/vendor/html5-qrcode.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Stale-while-revalidate 전략:
// 1) 캐시에 있으면 즉시 캐시로 응답해서 지금처럼 빠르게 열립니다.
// 2) 동시에 네트워크로 최신 버전을 요청해서 캐시를 갱신합니다 (Vercel에 새 배포가 있으면 다음에 열 때 반영됨).
// 3) 오프라인이라 네트워크 요청이 실패하면 조용히 무시하고 캐시 응답을 그대로 씁니다 → 인터넷이 막혀도 카메라 스캔 라이브러리(vendor/html5-qrcode.min.js) 포함 앱 전체가 동작합니다.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request, { cache: 'no-store' })
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // 오프라인 등 네트워크 실패 시 캐시로 폴백

        return cachedResponse || networkFetch;
      })
    )
  );
});
