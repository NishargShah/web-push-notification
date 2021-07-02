/* eslint-disable */
importScripts('https://www.gstatic.com/firebasejs/8.6.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.2/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyC_rH4aQic8PDM63rKEmusgM4q74oWKaGI",
  authDomain: "fir-web-push-notificatio-a1af8.firebaseapp.com",
  projectId: "fir-web-push-notificatio-a1af8",
  storageBucket: "fir-web-push-notificatio-a1af8.appspot.com",
  messagingSenderId: "1088383858101",
  appId: "1:1088383858101:web:ca4c1f87c1fa89998495fc",
  measurementId: "G-TQ0LREPX15"
};

firebase.initializeApp(firebaseConfig);

class CustomPushEvent extends Event {
  constructor(data) {
    super('push');
    Object.assign(this, data);
    this.custom = true;
  }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 * Note: notification key trigger the notification, that is why we must need to remove it
 */
self.addEventListener('push', e => {
  // Skip if event is our own custom event
  if (e.custom) return;

  // Kep old event data to override
  const oldData = e.data;

  // Create a new event to dispatch, pull values from notification key and put it in data key,
  // and then remove notification key
  const newEvent = new CustomPushEvent({
    data: {
      old: oldData.json(),
      json() {
        const newData = oldData.json();
        newData.data = {
          ...newData.data,
          notification: newData.notification,
        };
        delete newData.notification;
        return newData;
      },
    },
    waitUntil: e.waitUntil.bind(e),
  });

  // Stop event propagation
  e.stopImmediatePropagation();

  // Dispatch the new wrapped event
  dispatchEvent(newEvent);
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.debug('[firebase-messaging-sw.js] Received background message ', payload); // debug info

  const { notification, ...restPayload } = payload.data;
  const { title, body, icon } = notification;

  const notificationOptions = {
    body: body.replace(/<[^>]+>/g, ''),
    icon,
    data: restPayload,
  };

  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', event => {
  console.debug('[firebase-messaging-sw.js] notificationclick ', event);

  if (event.notification.data && event.notification.data.click_action) {
    self.clients.openWindow(event.notification.data.click_action);
  } else {
    self.clients.openWindow(event.currentTarget.origin);
  }

  // close notification after click
  event.notification.close();
});
