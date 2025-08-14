// public/service-worker.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // Кэширование или установка ресурсов можно выполнять здесь
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  // Обработка запросов можно выполнять здесь
});
