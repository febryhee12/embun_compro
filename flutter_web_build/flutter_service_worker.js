'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "26ba053190e1b2eccd9ea1c53c51d6b7",
"version.json": "fd668e8cd03c4b36c1b119a646f3c461",
"index.html": "8b57bd134cc3f9247c8f3a223287df6b",
"/": "8b57bd134cc3f9247c8f3a223287df6b",
"main.dart.js": "6ccaad55f75519b9178aecd84db77a0d",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "3996d875e4cddd6d8a37ec0d0b197d82",
"assets/AssetManifest.json": "c9b586dad8e77bc1aa2ad7d27749aa6e",
"assets/NOTICES": "a7d0c44af2a54c1b11fc59043b87e3cf",
"assets/FontManifest.json": "1ee00d31df7d0b30bfafc1cf4922abf8",
"assets/AssetManifest.bin.json": "3ac6f3eb5e8745aea95317716516d9ed",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/flutter_map/lib/assets/flutter_map_logo.png": "208d63cc917af9713fc9572bd5c09362",
"assets/packages/lucide_icons/assets/lucide.ttf": "03f254a55085ec6fe9a7ae1861fda9fd",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin": "38d8c0f77ceb6d4aacf4e05b10073bce",
"assets/fonts/MaterialIcons-Regular.otf": "85d89b4542cbdd17793d9d9be7b540fd",
"assets/assets/images/fi_help-circle.svg": "fd47e893ecac1c676a75f7479e0c8b39",
"assets/assets/images/fi_clock.svg": "80b929eaf8cb4384c7ac4150c9823c4f",
"assets/assets/images/fi_rotate-ccw.svg": "6f6a37e524489355ca1891335b93d4d8",
"assets/assets/images/fi_globe.svg": "09988c15d576255a75e1ee5016f2d871",
"assets/assets/images/embun_logogram_blue_adaptive.png": "80fcff72dbe6287c2507ba07f922bd4b",
"assets/assets/images/fi_log-out.svg": "96f9ee090755c09384cf263eccd6c28c",
"assets/assets/images/embun_logogram_blue.png": "deb5d9f36e22843933dd7709e521e604",
"assets/assets/images/icon_cart.svg": "67533b86bbe25b9523209879fdddcbf2",
"assets/assets/images/fi_log-in.svg": "58ebfea384dde4c4a37460c1d41c411f",
"assets/assets/images/icon_bell.svg": "9a1f960217e2fb644a3568ba124b75c9",
"assets/assets/images/fi_bell.svg": "4fcb2df37bc147cb4f61ef6b30b46845",
"assets/assets/images/fi_shield.svg": "afa509428226ef42a5b0218d19936e3c",
"assets/assets/images/nav/nav_profile.svg": "a579286f9db2983d37b4823eabe62f98",
"assets/assets/images/nav/nav_wishlist.svg": "332640443429878ec9ffb320db4bc0e8",
"assets/assets/images/nav/nav_explore.svg": "e77b82ae73dc4af85d70ea8a6c2d4020",
"assets/assets/images/nav/nav_reservation.svg": "7d828ee7c682461372e7f58435c5bf35",
"assets/assets/images/google_logo.svg": "9bd11143525dc00d6e01d373bca80a0f",
"assets/assets/images/fi_file-text.svg": "2afe579aabd7c367cdf02895fbc93c95",
"assets/assets/images/fi_edit-2.svg": "93f8ca508b94b8b6731ba5a17d08b170",
"assets/assets/images/embun_wordmark_blue.svg": "361d5c5dbc6dee2bfb3d1dbb9efd2101",
"assets/assets/images/embun_splash.png": "d44cce1484ddc5bb11af8f374c919958",
"assets/assets/images/embun_primary_blue.svg": "361d5c5dbc6dee2bfb3d1dbb9efd2101",
"assets/assets/images/embun_logogram_blue.svg": "ce01cd47d201029a804a3daf754a598c",
"assets/assets/banks/bsi.svg": "ec5c39ab20bc14c2e53338a7359c032d",
"assets/assets/banks/btpn.svg": "31a9a994a1a58436f2488e80149484e2",
"assets/assets/banks/gopay.png": "ab4435fff7d2bf1c608e97d7448bbbe2",
"assets/assets/banks/jago.png": "dd30fc7a581ab6ec78f99217300c66c7",
"assets/assets/banks/danamon.svg": "f1847bd8d4fe21c6d426a9d48f43f242",
"assets/assets/banks/mega.png": "e848acea84c55126cc8409ac2cb62ad8",
"assets/assets/banks/bri.svg": "72869746ab58221fdabd3e063e338160",
"assets/assets/banks/qris.png": "e53f457bc066fecbeedd797c9826e0bf",
"assets/assets/banks/btn.svg": "b02c41ec2c3b36a3ab1cef5208c29867",
"assets/assets/banks/shopeepay.png": "8fb2dd17dd3f93b9460bd440d8472b0c",
"assets/assets/banks/neo.png": "54a1193924403646c7da1295d3b7512a",
"assets/assets/banks/bca.svg": "b5ddc5331bc46c9070b11d8d005521b1",
"assets/assets/banks/permata.svg": "1098a71972daf24e59a9a5a23456fbfc",
"assets/assets/banks/bni.svg": "685d3b088532fccd54bdb23fb47d4ae6",
"assets/assets/banks/ocbc.png": "9b660315d96952873b5fae29a265e705",
"assets/assets/banks/cimb.svg": "0a903a64a0afe19e84f41d3d0dba0e6e",
"assets/assets/banks/panin.svg": "08eda4ee9cdd2161cf57e86bac9f14eb",
"assets/assets/banks/maybank.png": "faf983d94e30b3957fde875119758687",
"assets/assets/banks/seabank.png": "d953c481bd884c66249c82b03f01ac2a",
"assets/assets/banks/mandiri.svg": "a70ece4fd51e4f89d95c0f0537535475",
"assets/assets/banks/jenius.svg": "c7163c8c7c5d7d04e6defe9792a4f683",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/skwasm.js.symbols": "e72c79950c8a8483d826a7f0560573a1",
"canvaskit/canvaskit.js.symbols": "bdcd3835edf8586b6d6edfce8749fb77",
"canvaskit/skwasm.wasm": "39dd80367a4e71582d234948adc521c0",
"canvaskit/chromium/canvaskit.js.symbols": "b61b5f4673c9698029fa0a746a9ad581",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.wasm": "f504de372e31c8031018a9ec0a9ef5f0",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.wasm": "7a3f4ae7d65fc1de6a6e7ddd3224bc93"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
