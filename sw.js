const CACHE='chechu-dashboard-v11';
const BASE='/chechuarmenia/';
const ASSETS=[BASE,BASE+'sync.js',BASE+'manifest.webmanifest',BASE+'app-icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('message',e=>{if(e.data==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('chechu-dashboard-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){e.respondWith(caches.open(CACHE).then(c=>c.match(BASE)).then(c=>c||fetch(req)));return}
 // Keep HTML and its matching sync module in the same installed cache version.
 e.respondWith(caches.match(req).then(c=>c||fetch(req)));
});

