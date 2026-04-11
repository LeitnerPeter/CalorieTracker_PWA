const CACHE_NAME = "calories-tracker-v2";

const FILES_TO_CACHE = [
  "/calories-tracker/",
  "/calories-tracker/index.html",
  "/calories-tracker/css/style.css",
  "/calories-tracker/app.js",
  "/calories-tracker/manifest.json",

  "/js/chart.js",
  "/js/supabase.js",

  "/modules/scanner/scanner.js",
  "/modules/cache/cache.js",
  "/modules/ui/progressRing.js",

  "/screens/dashboard.js",
  "/screens/addMealScreen.js",

  "/services/entryService.js",
  "/services/calorieService.js",
  "/services/userService.js",
  "/services/foodService.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("app-cache").then(async cache => {
      const urls = [
        "/",
        "/index.html",
        "/app.js"
      ];

      for (const url of urls) {
        try {
          await cache.add(url);
        } catch (err) {
          console.error("Cache failed:", url);
        }
      }
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
