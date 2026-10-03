// Guarda o painel para abrir rápido e funcionar sem internet com o último dado baixado.
const CACHE = "mieruka-v1";
const BASE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Sempre tenta a rede primeiro (dados novos); sem internet, usa a cópia guardada.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  const chave = url.pathname.endsWith("dados.json") ? new Request(url.origin + url.pathname) : e.request;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(chave, copia)); }
      return r;
    }).catch(() => caches.match(chave))
  );
});
