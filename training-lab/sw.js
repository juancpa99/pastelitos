const CACHE='training-lab-pages-v6-17';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./marevo-mark.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./plantilla_plan.csv','./app.css?v=615','./marevo-brand.css?v=616','./app.js?v=602','./usability.js?v=615','./season-complements.js?v=604','./phase-sep2026.js?v=605','./phase-sep2026-integrity.js?v=606','./phase-sep2026-tracking.js?v=607','./phase-sep2026-report.js?v=608','./phase-sep2026-report-fix.js?v=609','./pending-workout-layout.js?v=613','./home-day-overview.js?v=612','./day-order-fix.js?v=613','./marevo-brand.js?v=616','./persistence.js?v=617'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('training-lab-')&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?event.data.json():{}}catch(e){payload={body:event.data?event.data.text():''}}
  const title=payload.title||'MAREVO';
  event.waitUntil(self.registration.showNotification(title,{
    body:payload.body||'Tienes una tarea pendiente.',
    tag:payload.tag||'training-lab-push',
    renotify:false,
    data:{url:payload.url||'./'}
  }));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification?.data?.url||'./';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if('focus' in client){
        if('navigate' in client)client.navigate(target).catch(()=>{});
        return client.focus();
      }
    }
    return clients.openWindow?clients.openWindow(target):undefined;
  }));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>{
    if(cached)return cached;
    return fetch(event.request).then(response=>{
      if(response&&response.ok&&response.type==='basic'){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    });
  }));
});
