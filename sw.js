// 有網路時拿最新版，沒網路時用快取。這裡只存 APP 程式，不存日記。
const CACHE='daily-diary-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('daily-diary-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{
    if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)))}
    return r;
  }).catch(async()=>(await caches.match(e.request,{ignoreSearch:true}))||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
