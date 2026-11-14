const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('public PWA caches all assets offline and preserves other apps caches',async()=>{
 const events={},stores=new Map([['training-lab-pages-personal',new Map()],['serie-public-old',new Map()]]);
 const caches={open:async key=>{if(!stores.has(key))stores.set(key,new Map());const map=stores.get(key);return {addAll:async assets=>{for(const a of assets){const file=a==='./'?'index.html':a.slice(2).split('?')[0];map.set(a,fs.readFileSync(path.join(__dirname,'..',file),'utf8'));}}};},keys:async()=>[...stores.keys()],delete:async k=>stores.delete(k),match:async request=>{const key=typeof request==='string'?request:request.url;for(const m of stores.values())if(m.has(key))return m.get(key);}};
 const context={self:{addEventListener:(n,cb)=>events[n]=cb,skipWaiting:async()=>{},clients:{claim:async()=>{}}},location:{origin:'https://example.test'},caches,fetch:async()=>{throw Error('offline')},URL,Promise};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),context);let work;events.install({waitUntil:p=>work=p});await work;events.activate({waitUntil:p=>work=p});await work;assert.ok(stores.has('training-lab-pages-personal'));assert.ok(!stores.has('serie-public-old'));
 const respondWith=p=>work=p;events.fetch({request:{url:'https://example.test/serie/',method:'GET',mode:'navigate'},respondWith});assert.match(await work,/SERIE/);
 for(const file of ['catalog.js','plans.js','coach.js','install.js','style.css'])assert.ok((await caches.match('./'+file+'?v=3')).length>100);assert.ok((await caches.match('./app.js?v=4')).length>100);
});
