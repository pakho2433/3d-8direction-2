const CACHE='pixel-idle-rpg-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./assets/base.css','./assets/chrome.css','./assets/battle-ui.css','./assets/synth.css','./assets/pages.css','./assets/overlay-responsive.css','./src/main.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match('./index.html'))));});
