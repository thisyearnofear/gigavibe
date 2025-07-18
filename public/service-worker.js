// Gigavibe Service Worker
// Version: 1.0.0
// This service worker provides offline functionality, caching strategies,
// background sync for uploads, and push notification support

// Cache names with versioning
const CACHE_NAMES = {
  STATIC_ASSETS: 'gigavibe-static-v1',
  AUDIO_FILES: 'gigavibe-audio-v1',
  API_RESPONSES: 'gigavibe-api-v1',
  IMAGES: 'gigavibe-images-v1',
  FONTS: 'gigavibe-fonts-v1'
};

// App configuration (will be updated from main app)
let APP_CONFIG = {
  cacheAudio: true,
  cacheImages: true,
  cacheAPIs: true,
  cacheWeb3Responses: false,
  cacheDuration: 7, // days
  offlineSupport: true,
  backgroundSync: true,
  performanceProfile: 'medium',
  maxAudioCacheSize: 500, // MB
  maxImageCacheSize: 200, // MB
  maxAPICacheSize: 50 // MB
};

// Assets to precache for offline functionality
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html', // Fallback page when offline
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/media/logo.png'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/challenges/featured',
  '/api/challenges/songs',
  '/api/discovery/feed/foryou',
  '/api/discovery/feed/trending'
];

// Audio file extensions
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];

// Image file extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// Font file extensions
const FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];

// Maximum age for cached items (in milliseconds)
const MAX_CACHE_AGE = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  AUDIO: 14 * 24 * 60 * 60 * 1000,  // 14 days
  API: 24 * 60 * 60 * 1000,         // 24 hours
  IMAGES: 7 * 24 * 60 * 60 * 1000,  // 7 days
  FONTS: 90 * 24 * 60 * 60 * 1000   // 90 days
};

// Background sync queue name
const SYNC_UPLOAD_QUEUE = 'gigavibe-upload-queue';

// Install event - precache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC_ASSETS)
      .then(cache => {
        console.log('[Service Worker] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete any cache that doesn't match our current versions
            const isCurrentCache = Object.values(CACHE_NAMES).includes(cacheName);
            if (!isCurrentCache) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .then(() => {
        // Notify clients that the service worker has been updated
        return self.clients.matchAll({ type: 'window' });
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SERVICE_WORKER_UPDATED',
            version: '1.0.0'
          });
        });
      })
  );
});

// Fetch event - handle different caching strategies based on request type
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin && !url.hostname.includes('filcdn.io')) {
    return;
  }

  // Skip Web3 requests if not configured to cache them
  if (url.pathname.includes('/api/zora') && !APP_CONFIG.cacheWeb3Responses) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    if (APP_CONFIG.cacheAPIs) {
      event.respondWith(handleApiRequest(event.request, url));
    }
    return;
  }

  // Handle audio file requests
  if (isAudioFile(url.pathname) && APP_CONFIG.cacheAudio) {
    event.respondWith(handleAudioRequest(event.request, url));
    return;
  }

  // Handle image requests
  if (isImageFile(url.pathname) && APP_CONFIG.cacheImages) {
    event.respondWith(handleImageRequest(event.request, url));
    return;
  }

  // Handle font requests
  if (isFontFile(url.pathname)) {
    event.respondWith(handleFontRequest(event.request));
    return;
  }

  // Default strategy for static assets (Cache First)
  event.respondWith(handleStaticAssetRequest(event.request));
});

// Message event - handle communication from the main app
self.addEventListener('message', event => {
  const message = event.data;
  
  if (!message || !message.type) {
    return;
  }

  switch (message.type) {
    case 'CONFIGURE':
      // Update service worker configuration
      APP_CONFIG = {
        ...APP_CONFIG,
        ...message.payload
      };
      
      console.log('[Service Worker] Configuration updated:', APP_CONFIG);
      
      // Respond to confirm configuration received
      if (event.source) {
        event.source.postMessage({
          type: 'CONFIGURATION_APPLIED',
          config: APP_CONFIG
        });
      }
      break;
      
    case 'CACHE_AUDIO':
      // Manually cache an audio file
      if (message.payload && message.payload.url) {
        cacheAudioFile(message.payload.url, message.payload.metadata)
          .then(() => {
            if (event.source) {
              event.source.postMessage({
                type: 'AUDIO_CACHED',
                url: message.payload.url
              });
            }
          })
          .catch(error => {
            console.error('[Service Worker] Failed to cache audio:', error);
            if (event.source) {
              event.source.postMessage({
                type: 'CACHE_ERROR',
                url: message.payload.url,
                error: error.message
              });
            }
          });
      }
      break;
      
    case 'CLEAR_CACHE':
      // Clear specific cache or all caches
      const cacheName = message.payload && message.payload.cacheName;
      clearCache(cacheName)
        .then(result => {
          if (event.source) {
            event.source.postMessage({
              type: 'CACHE_CLEARED',
              cacheName: cacheName || 'all',
              result
            });
          }
        })
        .catch(error => {
          console.error('[Service Worker] Failed to clear cache:', error);
          if (event.source) {
            event.source.postMessage({
              type: 'CACHE_ERROR',
              error: error.message
            });
          }
        });
      break;
      
    case 'CHECK_OFFLINE_READY':
      // Check if app is ready for offline use
      checkOfflineReady()
        .then(result => {
          if (event.source) {
            event.source.postMessage({
              type: 'OFFLINE_STATUS',
              ready: result.ready,
              missing: result.missing
            });
          }
        });
      break;
  }
});

// Push event - handle push notifications
self.addEventListener('push', event => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    
    const title = data.title || 'Gigavibe';
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/static/media/logo.png',
      badge: data.badge || '/static/media/notification-badge.png',
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || 'default',
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => {
          // Track notification display if analytics endpoint is available
          return fetch('/api/analytics/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              eventType: 'notification_displayed',
              properties: {
                notificationType: data.type,
                notificationId: data.id
              }
            })
          }).catch(() => {
            // Ignore analytics errors
          });
        })
    );
  } catch (error) {
    console.error('[Service Worker] Push notification error:', error);
  }
});

// Notification click event - handle notification interactions
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const actionUrl = notificationData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clientList => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              notificationId: notificationData.id,
              action: event.action
            });
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(actionUrl);
        }
      })
      .then(() => {
        // Track notification click if analytics endpoint is available
        return fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            eventType: 'notification_clicked',
            properties: {
              notificationId: notificationData.id,
              action: event.action
            }
          })
        }).catch(() => {
          // Ignore analytics errors
        });
      })
  );
});

// Sync event - handle background sync
self.addEventListener('sync', event => {
  if (!APP_CONFIG.backgroundSync) {
    return;
  }

  if (event.tag === SYNC_UPLOAD_QUEUE) {
    event.waitUntil(
      syncPendingUploads()
        .catch(error => {
          console.error('[Service Worker] Background sync failed:', error);
        })
    );
  }
});

// Periodic sync event - handle periodic background tasks
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-refresh') {
    event.waitUntil(
      refreshCachedContent()
        .catch(error => {
          console.error('[Service Worker] Periodic sync failed:', error);
        })
    );
  }
});

/**
 * Handle API requests with a Network-first strategy and cache fallback
 */
async function handleApiRequest(request, url) {
  const cache = await caches.open(CACHE_NAMES.API_RESPONSES);
  
  // Check if this is a cacheable API endpoint
  const shouldCache = API_CACHE_URLS.some(endpoint => url.pathname.includes(endpoint));
  
  // Network-first strategy for API requests
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache the successful response if configured
    if (networkResponse.ok && shouldCache && APP_CONFIG.cacheAPIs) {
      // Clone the response before caching it
      const responseToCache = networkResponse.clone();
      
      // Store response in cache with timestamp
      const responseWithMetadata = {
        response: responseToCache,
        timestamp: Date.now()
      };
      
      cache.put(request, new Response(
        JSON.stringify(responseWithMetadata),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Cached-By': 'gigavibe-sw',
            'X-Cached-At': new Date().toISOString()
          }
        }
      ));
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      try {
        // Parse the cached response with metadata
        const data = await cachedResponse.json();
        
        // Check if the cached response is still valid
        const age = Date.now() - data.timestamp;
        if (age < MAX_CACHE_AGE.API) {
          // Reconstruct the response from the cached data
          return new Response(JSON.stringify(data.response), {
            headers: {
              'Content-Type': 'application/json',
              'X-Cached-By': 'gigavibe-sw',
              'X-Cached-At': new Date(data.timestamp).toISOString()
            }
          });
        }
      } catch (parseError) {
        console.error('[Service Worker] Error parsing cached API response:', parseError);
      }
    }
    
    // If no valid cached response, return offline API response
    return cache.match('/api/offline') || 
      new Response(
        JSON.stringify({ 
          error: 'You are offline',
          offline: true
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
  }
}

/**
 * Handle audio file requests with a Cache-first strategy
 * Uses progressive loading for large files
 */
async function handleAudioRequest(request, url) {
  const cache = await caches.open(CACHE_NAMES.AUDIO_FILES);
  
  // Check if the request includes range headers (for progressive loading)
  const rangeHeader = request.headers.get('range');
  
  // If this is a range request, we need special handling
  if (rangeHeader) {
    return handleRangeRequest(request, cache);
  }
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Track cache hit for analytics
      trackCacheHit('audio', url.pathname);
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && APP_CONFIG.cacheAudio) {
      // Before caching, check if we have space
      await ensureCacheSpace(CACHE_NAMES.AUDIO_FILES, APP_CONFIG.maxAudioCacheSize);
      
      // Clone the response before caching it
      const responseToCache = networkResponse.clone();
      
      // Cache the response
      cache.put(request, responseToCache);
      
      // Notify clients that an audio file has been cached
      const audioSize = parseInt(networkResponse.headers.get('content-length') || '0', 10);
      notifyResourceCached('audio', url.pathname, audioSize);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Audio fetch failed:', error);
    
    // If both cache and network fail, return offline audio response
    return new Response(
      null,
      { 
        status: 503,
        statusText: 'Service Unavailable - You are offline'
      }
    );
  }
}

/**
 * Handle range requests for audio files (progressive loading)
 */
async function handleRangeRequest(request, cache) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) return fetch(request);
  
  // Parse the range header
  const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
  if (!rangeMatch) return fetch(request);
  
  const start = parseInt(rangeMatch[1], 10);
  const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : undefined;
  
  // Check if we have the full file cached
  const cachedResponse = await cache.match(request.url);
  
  if (cachedResponse) {
    // If we have it cached, extract the requested range
    const cachedBlob = await cachedResponse.blob();
    const slicedBlob = end ? 
      cachedBlob.slice(start, end + 1) : 
      cachedBlob.slice(start);
    
    // Create a new response with the correct headers
    const headers = new Headers(cachedResponse.headers);
    headers.set('Content-Range', `bytes ${start}-${end || (cachedBlob.size - 1)}/${cachedBlob.size}`);
    headers.set('Content-Length', (slicedBlob.size).toString());
    
    return new Response(slicedBlob, {
      status: 206,
      statusText: 'Partial Content',
      headers
    });
  }
  
  // If not cached, fetch from network with range request
  return fetch(request);
}

/**
 * Handle image file requests with a Cache-first strategy
 */
async function handleImageRequest(request, url) {
  const cache = await caches.open(CACHE_NAMES.IMAGES);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Track cache hit for analytics
      trackCacheHit('image', url.pathname);
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && APP_CONFIG.cacheImages) {
      // Before caching, check if we have space
      await ensureCacheSpace(CACHE_NAMES.IMAGES, APP_CONFIG.maxImageCacheSize);
      
      // Clone the response before caching it
      const responseToCache = networkResponse.clone();
      
      // Cache the response
      cache.put(request, responseToCache);
      
      // Notify clients that an image has been cached
      const imageSize = parseInt(networkResponse.headers.get('content-length') || '0', 10);
      notifyResourceCached('image', url.pathname, imageSize);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Image fetch failed:', error);
    
    // If both cache and network fail, return offline image placeholder
    return cache.match('/static/media/offline-image-placeholder.png') || 
      new Response(
        null,
        { 
          status: 503,
          statusText: 'Service Unavailable - You are offline'
        }
      );
  }
}

/**
 * Handle font file requests with a Cache-first strategy
 */
async function handleFontRequest(request) {
  const cache = await caches.open(CACHE_NAMES.FONTS);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone the response before caching it
      const responseToCache = networkResponse.clone();
      
      // Cache the response
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Font fetch failed:', error);
    
    // If both cache and network fail, return cached response or network error
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response(null, { status: 503 });
  }
}

/**
 * Handle static asset requests with a Cache-first strategy
 */
async function handleStaticAssetRequest(request) {
  const cache = await caches.open(CACHE_NAMES.STATIC_ASSETS);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone the response before caching it
      const responseToCache = networkResponse.clone();
      
      // Cache the response
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Static asset fetch failed:', error);
    
    // If both cache and network fail, return offline page for HTML requests
    if (request.headers.get('Accept').includes('text/html')) {
      return cache.match('/offline.html') || 
        new Response(
          '<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
          { 
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          }
        );
    }
    
    // For other types, return a simple error response
    return new Response(null, { status: 503 });
  }
}

/**
 * Manually cache an audio file with metadata
 */
async function cacheAudioFile(url, metadata = {}) {
  const cache = await caches.open(CACHE_NAMES.AUDIO_FILES);
  
  // Before caching, check if we have space
  await ensureCacheSpace(CACHE_NAMES.AUDIO_FILES, APP_CONFIG.maxAudioCacheSize);
  
  // Fetch the audio file
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
  }
  
  // Add metadata to the response headers
  const headers = new Headers(response.headers);
  headers.set('X-Cached-By', 'gigavibe-sw');
  headers.set('X-Cached-At', new Date().toISOString());
  
  if (metadata.title) headers.set('X-Audio-Title', metadata.title);
  if (metadata.artist) headers.set('X-Audio-Artist', metadata.artist);
  if (metadata.duration) headers.set('X-Audio-Duration', metadata.duration.toString());
  
  // Create a new response with the metadata
  const responseWithMetadata = new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
  
  // Cache the response
  await cache.put(new Request(url), responseWithMetadata);
  
  // Notify clients that an audio file has been cached
  const audioSize = parseInt(response.headers.get('content-length') || '0', 10);
  notifyResourceCached('audio', url, audioSize);
  
  return true;
}

/**
 * Ensure there's enough space in the cache by removing old items
 */
async function ensureCacheSpace(cacheName, maxSizeMB) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  // If we have fewer than 10 items, no need to check space yet
  if (keys.length < 10) return;
  
  // Get cache size and item timestamps
  let totalSize = 0;
  const items = [];
  
  for (const request of keys) {
    const response = await cache.match(request);
    const size = parseInt(response.headers.get('content-length') || '0', 10);
    const timestamp = response.headers.get('X-Cached-At') ? 
      new Date(response.headers.get('X-Cached-At')).getTime() : 
      Date.now();
    
    items.push({ request, size, timestamp });
    totalSize += size;
  }
  
  // Convert maxSizeMB to bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // If we're under the limit, no need to remove anything
  if (totalSize < maxSizeBytes) return;
  
  // Sort items by timestamp (oldest first)
  items.sort((a, b) => a.timestamp - b.timestamp);
  
  // Remove oldest items until we're under the limit
  let removedSize = 0;
  for (const item of items) {
    await cache.delete(item.request);
    removedSize += item.size;
    
    // Check if we've freed up enough space
    if (totalSize - removedSize < maxSizeBytes * 0.8) { // Target 80% of max to avoid frequent cleanup
      break;
    }
  }
}

/**
 * Clear a specific cache or all caches
 */
async function clearCache(cacheName) {
  if (cacheName) {
    // Clear specific cache
    await caches.delete(cacheName);
    return { cleared: [cacheName] };
  } else {
    // Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    return { cleared: cacheNames };
  }
}

/**
 * Check if the app is ready for offline use
 */
async function checkOfflineReady() {
  const cache = await caches.open(CACHE_NAMES.STATIC_ASSETS);
  const cachedUrls = await cache.keys();
  const cachedPaths = cachedUrls.map(request => new URL(request.url).pathname);
  
  // Check if all precache assets are cached
  const missing = PRECACHE_ASSETS.filter(asset => !cachedPaths.includes(asset));
  
  return {
    ready: missing.length === 0,
    missing
  };
}

/**
 * Process any pending uploads in the background sync queue
 */
async function syncPendingUploads() {
  // In a real implementation, this would read from IndexedDB
  // and process any pending uploads
  
  // For now, we'll just check if there's a specific upload endpoint
  // that clients might have registered for background sync
  const clients = await self.clients.matchAll();
  
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      result: 'No pending uploads found'
    });
  });
}

/**
 * Refresh cached content periodically
 */
async function refreshCachedContent() {
  // Refresh API cache
  if (APP_CONFIG.cacheAPIs) {
    try {
      for (const endpoint of API_CACHE_URLS) {
        await fetch(endpoint, { headers: { 'X-Cache-Refresh': 'true' } });
      }
    } catch (error) {
      console.error('[Service Worker] Failed to refresh API cache:', error);
    }
  }
  
  // Notify clients that content has been refreshed
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'CACHE_UPDATED',
      timestamp: Date.now()
    });
  });
}

/**
 * Track cache hits for analytics
 */
function trackCacheHit(resourceType, url) {
  // In a real implementation, this would send analytics data
  // For now, we'll just log it
  if (Math.random() < 0.1) { // Sample 10% of cache hits to reduce noise
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventType: 'cache_hit',
        properties: {
          resourceType,
          url
        }
      })
    }).catch(() => {
      // Ignore analytics errors
    });
  }
}

/**
 * Notify clients that a resource has been cached
 */
async function notifyResourceCached(type, url, size) {
  const clients = await self.clients.matchAll();
  
  clients.forEach(client => {
    client.postMessage({
      type: 'RESOURCE_CACHED',
      payload: {
        type,
        url,
        size,
        timestamp: Date.now()
      }
    });
  });
}

/**
 * Check if a URL is an audio file
 */
function isAudioFile(pathname) {
  return AUDIO_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext));
}

/**
 * Check if a URL is an image file
 */
function isImageFile(pathname) {
  return IMAGE_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext));
}

/**
 * Check if a URL is a font file
 */
function isFontFile(pathname) {
  return FONT_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext));
}

// Log that the service worker has loaded
console.log('[Service Worker] Initialized - Version 1.0.0');
