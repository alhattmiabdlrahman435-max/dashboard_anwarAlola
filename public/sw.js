/*
 * Anwar Al-Ola dashboard - minimal service worker.
 *
 * Purpose: make the dashboard installable (PWA) and show a friendly offline
 * page when a navigation fails. It is intentionally network-first and does
 * NOT cache API calls, auth requests, or any non-GET request, so data and
 * login behaviour are exactly the same as without the worker.
 */
const CACHE_NAME = 'anwar-shell-v1';
const OFFLINE_ICON = '/android-chrome-192x192.png';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_ICON))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const OFFLINE_HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#062A5A" />
<title>لا يوجد اتصال بالإنترنت</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#062A5A;color:#fff;font-family:Tajawal,Cairo,system-ui,sans-serif;text-align:center;padding:16px}
  img{width:96px;height:96px;border-radius:20px;margin-bottom:16px}
  h1{font-size:1.3rem;margin:0 0 8px}
  p{opacity:.85;margin:0 0 20px}
  button{font:inherit;font-weight:700;border:0;border-radius:10px;padding:10px 22px;cursor:pointer;background:#fff;color:#062A5A}
</style>
</head>
<body>
  <div>
    <img src="${OFFLINE_ICON}" alt="" />
    <h1>لا يوجد اتصال بالإنترنت</h1>
    <p>تعذّر تحميل لوحة التحكم. تحقّق من الاتصال ثم أعد المحاولة.</p>
    <button onclick="location.reload()">إعادة المحاولة</button>
  </div>
</body>
</html>`;

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Never touch cross-origin requests, API calls, Sanctum/auth endpoints or uploaded files.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/sanctum/')) return;
  if (url.pathname.startsWith('/storage/') || url.pathname.startsWith('/uploads/')) return;

  if (req.mode === 'navigate') {
    // Network-first: always go to the server; only fall back when offline.
    event.respondWith(
      fetch(req).catch(() =>
        new Response(OFFLINE_HTML, {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      )
    );
    return;
  }

  if (url.pathname === OFFLINE_ICON) {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_ICON).then((r) => r || Response.error()))
    );
  }
  // Everything else: default browser handling (plain network).
});
