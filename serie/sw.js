const CACHE='serie-public-v7';
const ASSETS=['./','./index.html','./style.css?v=4','./app.js?v=4','./install.js?v=4','./updates.js?v=1','./catalog.js?v=3','./plans.js?v=3','./coach.js?v=3','./icon.svg','./icon.svg?v=4','./icon-192.png?v=4','./icon-512.png?v=4','./manifest.webmanifest?v=4'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key.startsWith('serie-public-')&&key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
// Network-first ensures future code publishes become available even if the
// asset URL or cache version was not manually incremented. Offline falls back
// to the most recently cached working file; other apps and origins are untouched.
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==location.origin||!url.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;
  event.respondWith((async()=>{
    const navigation=request.mode==='navigate';
    const key=navigation?'./index.html':request;
    try {
      const response=await fetch(request,{cache:'no-store'});
      if(response.ok && response.type!=='opaque'){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(key,copy)).catch(()=>{}));
      }
      return response;
    } catch(error) {
      const cached=await caches.match(key);
      if(cached)return cached;
      throw error;
    }
  })());
});
