/* Service worker - offline support for The Self-Taught Chef Program */
var VERSION = "chef-v5";
var CORE = [
  "./",
  "./index.html",
  "./app.css?v=5",
  "./app.js?v=5",
  "./data.js?v=5",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(VERSION).then(function(cache){ return cache.addAll(CORE); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==VERSION; })
        .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // let cross-origin (videos) hit network

  // Navigation: network first, fall back to cached app shell (offline)
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req).catch(function(){ return caches.match("./index.html"); })
    );
    return;
  }

  // Everything else (css/js/pdf/pptx/icons): cache first, then network + cache it
  e.respondWith(
    caches.match(req).then(function(cached){
      if(cached) return cached;
      return fetch(req).then(function(res){
        if(res && res.status===200 && res.type==="basic"){
          var copy = res.clone();
          caches.open(VERSION).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
    })
  );
});
