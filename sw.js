const CACHE_NAME = 'work-style-v1';
const ASSETS = [
    '/work-style/',
    '/work-style/index.html',
    '/work-style/js/i18n.js',
    '/work-style/js/app.js',
    '/work-style/js/locales/ko.json',
    '/work-style/js/locales/en.json',
    '/work-style/js/locales/ja.json',
    '/work-style/js/locales/zh.json',
    '/work-style/js/locales/hi.json',
    '/work-style/js/locales/ru.json',
    '/work-style/js/locales/es.json',
    '/work-style/js/locales/pt.json',
    '/work-style/js/locales/id.json',
    '/work-style/js/locales/tr.json',
    '/work-style/js/locales/de.json',
    '/work-style/js/locales/fr.json',
    '/work-style/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => cached);
        })
    );
});
