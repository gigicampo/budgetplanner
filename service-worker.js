const CACHE="budget-planner-v3";
const CORE=["./","./budget_planner_mobile_app_ready(2)(1).html","./user-guide.html","./manifest.webmanifest","./Budget-Planner-App-Icon.svg","./ff1277350113b895c3e20ad27f01a362.jpg","https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url))))));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match("./budget_planner_mobile_app_ready(2)(1).html"))))});
