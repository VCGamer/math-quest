// Service Worker for MATH QUEST PWA
const CACHE_NAME = 'mathquest-v7';
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

// フェッチ: ネットワーク優先、オフライン時はキャッシュ
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // 成功したらキャッシュを更新
      if (response.ok && event.request.url.startsWith('http')) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => {
      // オフライン → キャッシュから返す
      return caches.match(event.request).then(cached => {
        return cached || new Response('オフラインです', { status: 503 });
      });
    })
  );
});
