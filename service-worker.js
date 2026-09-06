const CACHE="budget-planner-v7";
const APP_PAGE="./index.html";
const CORE=["./",APP_PAGE,"./user-guide.html","./manifest.webmanifest","./Budget-Planner-App-Icon.svg","./Budget-Planner-App-Icon-192.png","./Budget-Planner-App-Icon-512.png","./ff1277350113b895c3e20ad27f01a362.jpg","./jszip.min.js"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>event.request.mode==="navigate"?caches.match(APP_PAGE):Response.error())))});
