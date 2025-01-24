// نسخة الكاش (يجب تحديث النسخة عند إجراء تغييرات على الموقع)
const CACHE_NAME = "offline-cache-v2"; // غيّر الرقم للإشارة إلى النسخة الجديدة
const OFFLINE_URLS = [
  "/students/",          // الصفحة الرئيسية
  "/students/index.html" // ملف HTML
];

// تثبيت Service Worker وتخزين الملفات في الكاش
self.addEventListener("install", (event) => {
  // تخزين الملفات في الكاش
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(OFFLINE_URLS);
    })
  );

  // اجعل الـ Service Worker يعمل فورًا
  self.skipWaiting();
});

// تفعيل Service Worker وإزالة الكاش القديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // فرض التحديث فورًا على جميع العملاء
  self.clients.claim();
});

// الرد على الطلبات باستخدام الكاش أو جلب النسخة الجديدة
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا كان الملف موجودًا في الكاش، ارجعه. وإذا لم يكن موجودًا، اجلبه من الشبكة وقم بتحديث الكاش.
      return (
        response ||
        fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // تخزين النسخة الجديدة في الكاش
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});
