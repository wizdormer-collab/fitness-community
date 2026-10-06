/*
 * Show Up — service worker.
 *
 * Strategy: network-first for documents and navigations (so a prototype
 * always shows the latest build when online), cache-first for hashed
 * static assets, stale-while-revalidate for everything else same-origin.
 * Offline navigations fall back to the prerendered /offline shell.
 */

const CACHE = "showup-v1";
const OFFLINE_URL = "/offline";

const PRECACHE = ["/", OFFLINE_URL, "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // A failed precache must never block the worker from activating.
      .then((cache) =>
        Promise.allSettled(PRECACHE.map((url) => cache.add(url))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/development")) return;

  const isNavigation = request.mode === "navigate";
  const isHashedStatic = url.pathname.startsWith("/_next/static/");

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL)) || Response.error();
        }),
    );
    return;
  }

  if (isHashedStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches
              .open(CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => {});
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches
              .open(CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    }),
  );
});
