const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('public PWA caches all assets offline and preserves other apps caches',async()=>{
 const events={},stores=new Map([['training-lab-pages-personal',new Map()],['serie-public-old',new Map()]]);
 const caches={open:async key=>{if(!stores.has(key))stores.set(key,new Map());const map=stores.get(key);return {addAll:async assets=>{for(const a of assets){const file=a==='./'?'index.html':a.slice(2).split('?')[0];map.set(a,fs.readFileSync(path.join(__dirname,'..',file),'utf8'));}}};},keys:async()=>[...stores.keys()],delete:async k=>stores.delete(k),match:async request=>{const key=typeof request==='string'?request:request.url;for(const m of stores.values())if(m.has(key))return m.get(key);}};
 const context={self:{addEventListener:(n,cb)=>events[n]=cb,skipWaiting:async()=>{},clients:{claim:async()=>{}},registration:{scope:'https://example.test/serie/'}},location:{origin:'https://example.test'},caches,fetch:async()=>{throw Error('offline')},URL,Promise};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),context);let work;events.install({waitUntil:p=>work=p});await work;events.activate({waitUntil:p=>work=p});await work;assert.ok(stores.has('training-lab-pages-personal'));assert.ok(!stores.has('serie-public-old'));
 const respondWith=p=>work=p;events.fetch({request:{url:'https://example.test/serie/',method:'GET',mode:'navigate'},respondWith});assert.match(await work,/SERIE/);
 // Check the actual versioned URLs referenced by the HTML, not obsolete hardcoded versions.
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const assets=[...html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^"]*)?)"/g)].map(m=>m[1]);
 assert.ok(assets.some(a=>a.startsWith('app.js?')));
 for(const asset of assets){const content=await caches.match('./'+asset);assert.equal(typeof content,'string',asset+' missing from offline cache');assert.ok(content.length>100,asset);}
});

test('online assets refresh their cached copy and keep the new version offline',async()=>{
 const handlers={},stored=new Map(),pending=[];
 let online=true;
 const response=value=>({ok:true,type:'basic',body:value,clone(){return response(value);}});
 const caches={
  open:async()=>({put:async(key,value)=>stored.set(typeof key==='string'?key:key.url,value),addAll:async()=>{}}),
  match:async key=>stored.get(typeof key==='string'?key:key.url)
 };
 const scope='https://example.test/serie/';
 const context={
  self:{addEventListener:(name,fn)=>handlers[name]=fn,registration:{scope},skipWaiting:async()=>{},clients:{claim:async()=>{}}},
  location:{origin:'https://example.test'},caches,URL,Promise,
  fetch:async(request,options)=>{assert.equal(options.cache,'no-store');if(!online)throw Error('offline');return response('latest-javascript');}
 };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),context);
 const request={url:scope+'app.js?v=4',method:'GET',mode:'cors'};
 const invoke=async(req)=>{
  let work=null;
  handlers.fetch({request:req,respondWith:promise=>{work=promise;},waitUntil:promise=>pending.push(promise)});
  return work?await work:null;
 };
 const fresh=await invoke(request);
 assert.equal(fresh.body,'latest-javascript');
 await Promise.all(pending);
 assert.equal(stored.get(request.url).body,'latest-javascript');
 online=false;
 const offline=await invoke(request);
 assert.equal(offline.body,'latest-javascript');
 assert.equal(await invoke({url:'https://example.test/training-lab/app.js',method:'GET',mode:'cors'}),null);
 assert.equal(await invoke({url:'https://outside.test/serie/app.js',method:'GET',mode:'cors'}),null);
});
