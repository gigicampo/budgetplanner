const CACHE="budget-planner-v13";
const APP_PAGE="./index.html";
const CORE=["./",APP_PAGE,"./user-guide.html","./manifest.webmanifest","./Budget-Planner-App-Icon.svg","./Budget-Planner-App-Icon-192.png","./Budget-Planner-App-Icon-512.png","./ff1277350113b895c3e20ad27f01a362.jpg","./jszip.min.js"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;if(event.request.mode==="navigate"){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(APP_PAGE,copy));return response}).catch(()=>caches.match(APP_PAGE)));return}event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response})))});
