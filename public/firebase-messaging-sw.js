importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyDjpoJLCQsqZnaXaV8R92IGVbMJ_4X8isU",
  authDomain: "linklanes-notifications.firebaseapp.com",
  projectId: "linklanes-notifications",
  storageBucket: "linklanes-notifications.appspot.com",
  messagingSenderId: "985777084915",
  appId: "1:985777084915:web:ccc97431860ee971011a86",
  measurementId: "G-T9F2ZPMZJ9"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
