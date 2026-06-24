/* Self-healing service worker.
   Clears any old caches and never serves stale content (always loads fresh
   from the network). Keeps the app installable. */
var VERSION = "chef-v8";

self.addEventListener("install", function(e){
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil((async function(){
    var keys = await caches.keys();
    await Promise.all(keys.map(function(k){ return caches.delete(k); }));
    await self.clients.claim();
  })());
});

// Present (so the app stays installable) but does NOT intercept/caches —
// every request goes straight to the network. No more stale-cache blank pages.
self.addEventListener("fetch", function(e){ /* network passthrough */ });
