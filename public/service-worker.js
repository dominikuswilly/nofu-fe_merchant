const CACHE_NAME = 'merchant-cache-v1';
const urlsToCache = [
    './',
    'index.html',
    'manifest.json'
    // Add other assets like CSS, JS, images here
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Activate immediately
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return Promise.all(
                    urlsToCache.map(url =>
                        cache.add(url).catch(err => console.warn('SW: Failed to cache', url, err))
                    )
                );
            })
    );
});

self.addEventListener('activate', event => {
    self.clients.claim(); // Take control of all pages immediately
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Skip non-GET or non-http(s) requests
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Cache hit
                }

                // Cache miss: fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Pass through non-200 or non-basic responses
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Cache successful same-origin responses
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallback for navigations
                        if (event.request.mode === 'navigate') {
                            return caches.match('index.html');
                        }
                    });
            })
    );
});