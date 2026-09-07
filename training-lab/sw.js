const CACHE='training-lab-pages-v6-20';
const ASSETS=['./','./index.html','./manifest.webmanifest','./marevo-home-v618.svg','./marevo-mark.svg','./marevo-home-192-v618.png','./marevo-home-512-v618.png','./marevo-home-180-v618.png','./plantilla_plan.csv','./app.css?v=615','./marevo-brand.css?v=616','./app.js?v=602','./usability.js?v=615','./season-complements.js?v=604','./phase-sep2026.js?v=605','./phase-sep2026-integrity.js?v=606','./phase-sep2026-tracking.js?v=607','./phase-sep2026-report.js?v=608','./phase-sep2026-report-fix.js?v=609','./pending-workout-layout.js?v=613','./home-day-overview.js?v=612','./day-order-fix.js?v=613','./marevo-brand.js?v=616','./persistence.js?v=617','./push-config.js?v=620','./push-client.js?v=620','./ui-fixes.js?v=620'];

function canonicalNotificationTag(tag){
  const raw=String(tag||'').toLowerCase();
  if(raw.includes('rest')||raw.includes('descanso'))return 'marevo-rest';
  if(raw.includes('post-workout')||raw.includes('postworkout')||raw.includes('post-entreno'))return 'marevo-post-workout';
  if(raw.includes('workout')||raw.includes('entren'))return 'marevo-workout';
  if(raw.includes('checkin')||raw.includes('check-in'))return 'marevo-checkin';
  if(raw.includes('monthly'))return 'marevo-monthly';
  if(raw.includes('body')||raw.includes('weight')||raw.includes('peso'))return 'marevo-body';
  if(raw.includes('breakfast')||raw.includes('desayuno'))return 'marevo-breakfast';
  if(raw.includes('lunch')||raw.includes('almuerzo')||raw.includes('comida'))return 'marevo-lunch';
  if(raw.includes('snack')||raw.includes('merienda'))return 'marevo-snack';
  if(raw.includes('dinner')||raw.includes('cena'))return 'marevo-dinner';
  if(raw.includes('test'))return 'marevo-test';
  return raw?`marevo-${raw.replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48)}`:'marevo-general';
}

async function replaceNotification(title,options={}){
  const tag=canonicalNotificationTag(options.tag);
  try{
    const existing=await self.registration.getNotifications({tag});
    existing.forEach(notification=>notification.close());
  }catch(error){}
  return self.registration.showNotification(title,{...options,tag,renotify:false});
}

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
  try{payload=event.data?event.data.json():{}}catch(error){payload={body:event.data?event.data.text():''};}
  const title=payload.title||'MAREVO';
  event.waitUntil(replaceNotification(title,{
    body:payload.body||'Tienes una tarea pendiente.',
    tag:payload.tag||payload.type||'marevo-general',
    data:{url:payload.url||'./',type:payload.type||null,reminderId:payload.id||null}
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
