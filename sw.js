// Service Worker for MATH QUEST PWA
const CACHE_NAME = 'mathquest-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Bungee&family=Noto+Sans+JP:wght@400;700;900&display=swap'
];

// インストール: キャッシュにファイルを保存
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// アクティベート: 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// フェッチ: キャッシュ優先、なければネットワーク
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // フォントなど外部リソースもキャッシュ
        if (response.ok && event.request.url.startsWith('http')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // オフラインでキャッシュもない場合
        return new Response('オフラインです', { status: 503 });
      });
    })
  );
});
