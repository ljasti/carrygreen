// Service Worker for Amrot Website
const CACHE_NAME = 'amrot-cache-v1';
const OFFLINE_PAGE = '/offline.html';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/utilities.css',
  '/js/script.js',
  '/images/svg/amrot_logo.svg',
  '/images/svg/amrot_logo_white.svg',
  '/images/banner.jpg',
  '/videos/banner.mp4',
  '/images/amrot-classic.png',
  '/images/amrot-chocolate.png',
  '/images/amrot-guava.png',
  '/images/amrot-coffee.png',
  '/images/amrot-spicy.png',
  '/images/amrot-lemon.png',
  '/images/amrot-elachi.png',
  '/images/amrot-beetroot.png',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  '/offline.html',
  '/css/accessibility.css',
  '/images/fallback-image.svg'
];

// Handle service worker errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Failed to cache all resources:', error);
            // Continue with partial caching rather than failing completely
            return Promise.resolve();
          });
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    }).then(() => {
      // Ensure the service worker takes control of all clients as soon as it's activated
      return self.clients.claim();
    }).catch(error => {
      console.error('Cache cleanup failed:', error);
    })
  );
});

// Fetch event - serve from cache, fall back to network, then offline page
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://fonts.') && 
      !event.request.url.startsWith('https://cdnjs.')) {
    return;
  }

  // HTML navigation requests - network-first strategy with offline fallback
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Valid response - clone and cache it
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.error('Failed to cache HTML response:', err));
          }
          return response;
        })
        .catch(() => {
          // Network failed - try from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              // Return cached response or offline page
              return cachedResponse || caches.match(OFFLINE_PAGE);
            });
        })
    );
    return;
  }

  // For other requests - cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.error('Failed to cache response:', err));

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // For image requests, return a fallback image
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/images/fallback-image.svg');
            }
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});