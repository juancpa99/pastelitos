(function(){
  'use strict';

  const BACKEND=(window.MAREVO_PUSH_BACKEND||localStorage.getItem('marevo_push_backend')||'').replace(/\/$/,'');
  const SCHEDULE_STORAGE_KEY='marevo_push_schedule_v1';
  const HORIZON_DAYS=8;
  const SYNC_DEBOUNCE_MS=900;
  let syncTimer=null;
  let syncInFlight=false;
  let syncAgain=false;
  let lastReminderFingerprint='';

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
  window.marevoCanonicalNotificationTag=canonicalNotificationTag;

  if(typeof window.showAppNotification==='function'){
    const fallbackShow=window.showAppNotification;
    window.showAppNotification=async function(title,body,tag='marevo-general',data={}){
      if(!state?.settings?.notifications?.enabled||notificationPermission()!=='granted')return false;
      const stableTag=canonicalNotificationTag(tag);
      try{
        const reg=await navigator.serviceWorker.ready;
        if(reg.getNotifications){
          const existing=await reg.getNotifications({tag:stableTag});
          existing.forEach(notification=>notification.close());
        }
        await reg.showNotification(title,{body,tag:stableTag,renotify:false,data:{url:'./',...data}});
        return true;
      }catch(error){
        return fallbackShow(title,body,stableTag,data);
      }
    };
  }

  function backendReady(){
    return !!BACKEND&&/^https:\/\//i.test(BACKEND);
  }

  function urlBase64ToUint8Array(base64String){
    const padding='='.repeat((4-base64String.length%4)%4);
    const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
    const raw=atob(base64);
    return Uint8Array.from([...raw].map(ch=>ch.charCodeAt(0)));
  }

  async function fetchJSON(path,options={}){
    const response=await fetch(`${BACKEND}${path}`,{
      ...options,
      headers:{'Content-Type':'application/json',...(options.headers||{})}
    });
    if(!response.ok)throw new Error(`Push backend ${response.status}`);
    return await response.json();
  }

  async function ensureRemoteSubscription(){
    if(!backendReady())return null;
    if(notificationPermission()!=='granted'||!state?.settings?.notifications?.enabled)return null;
    if(!('serviceWorker' in navigator)||!('PushManager' in window))return null;
    const reg=await navigator.serviceWorker.ready;
    let subscription=await reg.pushManager.getSubscription();
    if(subscription)return subscription;
    const config=await fetchJSON('/api/config',{method:'GET',headers:{}});
    if(!config?.publicKey)throw new Error('Missing VAPID public key');
    subscription=await reg.pushManager.subscribe({
      userVisibleOnly:true,
      applicationServerKey:urlBase64ToUint8Array(config.publicKey)
    });
    return subscription;
  }

  function localDateAt(date,time){
    const [y,m,d]=String(date).split('-').map(Number);
    const [hh,mm]=String(time||'00:00').split(':').map(Number);
    return new Date(y,m-1,d,hh||0,mm||0,0,0).getTime();
  }

  function addDays(date,amount){
    const [y,m,d]=String(date).split('-').map(Number);
    const value=new Date(y,m-1,d+amount,12,0,0,0);
    const pad=n=>String(n).padStart(2,'0');
    return `${value.getFullYear()}-${pad(value.getMonth()+1)}-${pad(value.getDate())}`;
  }

  function reminder(id,type,at,title,body,url='./'){
    return {id,type,at,title,body,tag:canonicalNotificationTag(type),url};
  }

  function buildRemoteReminders(){
    if(!state?.settings?.notifications?.enabled)return [];
    const notifications=state.settings.notifications||{};
    const now=Date.now();
    const reminders=[];

    const rest=state.restTimer;
    if(notifications.rest&&rest&&!rest.paused&&!rest.done&&Number(rest.endAt)>now+1000){
      reminders.push(reminder(
        `rest:${Number(rest.endAt)}`,
        'rest',
        Number(rest.endAt),
        'Descanso terminado',
        `${rest.exercise||'Siguiente serie'} lista.`
      ));
    }

    const start=typeof todayISO==='function'?todayISO():addDays(new Date().toISOString().slice(0,10),0);
    for(let offset=0;offset<HORIZON_DAYS;offset+=1){
      const date=addDays(start,offset);
      let plan=null;
      try{plan=planFor(date);}catch(error){plan=null;}

      if(notifications.workout&&plan&&plan.type!=='rest'){
        let done=false;
        try{done=sessionDone(date,plan);}catch(error){done=false;}
        const at=localDateAt(date,notifications.workoutTime||'18:00');
        if(!done&&at>now+1000){
          reminders.push(reminder(`workout:${date}`,'workout',at,'Entrenamiento pendiente',`${plan.title}${plan.subtitle?` · ${plan.subtitle}`:''}`));
        }
      }

      if(notifications.checkin){
        let done=false;
        try{done=dailyDone(date);}catch(error){done=false;}
        const at=localDateAt(date,`${String(state.settings.checkHour||20).padStart(2,'0')}:00`);
        if(!done&&at>now+1000)reminders.push(reminder(`checkin:${date}`,'checkin',at,'Check-in pendiente','Cierra el día en MAREVO.'));
      }

      const sunday=typeof isSunday==='function'?isSunday(date):new Date(`${date}T12:00:00`).getDay()===0;
      if(sunday&&notifications.weeklyBody){
        let done=false;
        try{done=measurementDone(date);}catch(error){done=false;}
        const at=localDateAt(date,notifications.weeklyBodyTime||'10:00');
        if(!done&&at>now+1000)reminders.push(reminder(`body:${date}`,'body',at,'Peso y cintura','Toca registrar las mediciones semanales.'));
      }

      if(sunday&&notifications.monthlyReview){
        let done=false;
        try{done=monthlyReviewDone(date);}catch(error){done=false;}
        const at=localDateAt(date,notifications.monthlyReviewTime||'10:15');
        if(!done&&at>now+1000)reminders.push(reminder(`monthly:${date}`,'monthly',at,'Revisión corporal','Perímetros y fotos mensuales pendientes.'));
      }
    }

    return reminders
      .filter(item=>Number.isFinite(item.at)&&item.at>now)
      .sort((a,b)=>a.at-b.at)
      .slice(0,32);
  }

  function readScheduledMessageIds(){
    try{
      const parsed=JSON.parse(localStorage.getItem(SCHEDULE_STORAGE_KEY)||'{}');
      return Array.isArray(parsed.messageIds)?parsed.messageIds.filter(Boolean):[];
    }catch(error){return [];}
  }

  function storeScheduledMessageIds(messageIds){
    try{localStorage.setItem(SCHEDULE_STORAGE_KEY,JSON.stringify({messageIds:[...new Set(messageIds.filter(Boolean))],updatedAt:Date.now()}));}catch(error){}
  }

  function reminderFingerprint(reminders){
    return JSON.stringify(reminders.map(({id,type,at,title,body,tag})=>({id,type,at,title,body,tag})));
  }

  async function syncRemotePush(force=false){
    if(!backendReady()||notificationPermission()!=='granted'||!state?.settings?.notifications?.enabled)return false;
    if(syncInFlight){syncAgain=true;return false;}
    const reminders=buildRemoteReminders();
    const fingerprint=reminderFingerprint(reminders);
    if(!force&&fingerprint===lastReminderFingerprint)return true;
    syncInFlight=true;
    try{
      const subscription=await ensureRemoteSubscription();
      if(!subscription)return false;
      const result=await fetchJSON('/api/sync',{
        method:'POST',
        body:JSON.stringify({
          subscription:subscription.toJSON?subscription.toJSON():subscription,
          reminders,
          cancelMessageIds:readScheduledMessageIds(),
          timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Madrid'
        })
      });
      storeScheduledMessageIds(Array.isArray(result.messageIds)?result.messageIds:[]);
      lastReminderFingerprint=fingerprint;
      return true;
    }catch(error){
      console.warn('[MAREVO push] Remote sync failed:',error);
      return false;
    }finally{
      syncInFlight=false;
      if(syncAgain){syncAgain=false;queueRemotePushSync(true);}
    }
  }

  function queueRemotePushSync(force=false){
    if(!backendReady())return;
    clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>syncRemotePush(force),SYNC_DEBOUNCE_MS);
  }
  window.marevoSyncRemotePush=syncRemotePush;

  if(typeof window.saveState==='function'){
    const previousSaveState=window.saveState;
    window.saveState=function marevoPushAwareSave(silent=false){
      const result=previousSaveState(silent);
      queueRemotePushSync(false);
      return result;
    };
  }

  if(typeof window.requestAppNotifications==='function'){
    const previousRequest=window.requestAppNotifications;
    window.requestAppNotifications=async function marevoRequestNotifications(){
      const result=await previousRequest();
      if(notificationPermission()==='granted'&&state?.settings?.notifications?.enabled){
        try{await ensureRemoteSubscription();await syncRemotePush(true);}catch(error){console.warn('[MAREVO push] Subscription failed:',error);}
      }
      return result;
    };
  }

  window.addEventListener('online',()=>queueRemotePushSync(true),{passive:true});
  window.addEventListener('pageshow',()=>queueRemotePushSync(false),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')queueRemotePushSync(false);},{passive:true});
  setTimeout(()=>queueRemotePushSync(true),1400);
})();
