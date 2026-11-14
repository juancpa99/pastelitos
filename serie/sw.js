const CACHE='serie-public-v5';
const ASSETS=['./','./index.html','./style.css?v=3','./app.js?v=4','./install.js?v=3','./catalog.js?v=3','./plans.js?v=3','./coach.js?v=3','./icon.svg','./icon.svg?v=4','./icon-192.png?v=4','./icon-512.png?v=4','./manifest.webmanifest?v=4'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('serie-public-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));return;}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});
