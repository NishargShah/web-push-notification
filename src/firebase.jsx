import firebase from 'firebase/app';
import { url, serverKey, vapidKey, firebaseConfig } from './config';
import 'firebase/messaging';

firebase.initializeApp(firebaseConfig);

const isTokenSentToServer = () => window.localStorage.getItem('sentToServer') === '1';

const setTokenSentToServer = sent => window.localStorage.setItem('sentToServer', sent ? '1' : '0');

const sendTokenToServer = currentToken => {
  if (!isTokenSentToServer()) {
    console.debug('Sending token to server...', currentToken);
    setTokenSentToServer(true);
  } else {
    console.debug("Token already sent to server so won't send it again unless it changes");
  }
}

const messaging = firebase.messaging();
// console.debug('Supported?', firebase.messaging.isSupported());

// below function is to subscribe to all notification.
const subscribeTokenToTopic = async(token, topic) => {
  const notification = {
    title: 'Hello Title',
    body: 'My Body',
    // 'icon': logo,
    click_action: 'https://google.com',
  };

  try {
    const response = await fetch(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`, {
      method: 'POST',
      headers: new Headers({Authorization: 'key=' + serverKey}),
      body: JSON.stringify({notification, to: token}),
    });
    if (response.status < 200 || response.status >= 400) return new Error('Error subscribing to topic');
    console.debug(`Subscribed to ${topic}`);
    return true;
  } catch (e) {
    console.error('[ERROR] Failed to subscribe' + e);
  }
}

(async() => {
  try {
    const registration = await navigator.serviceWorker.register(url);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.debug('Notification permission granted.');
      try {
        const currentToken = await messaging.getToken({vapidKey, serviceWorkerRegistration: registration})
        if (currentToken) {
          await sendTokenToServer(currentToken);
          await subscribeTokenToTopic(currentToken, 'allDevices');
          localStorage.setItem('current_token', currentToken);
          console.debug('General Token', currentToken);
        } else {
          console.debug('No Instance ID token available. Request permission to generate one.');
          setTokenSentToServer(false);
        }
      } catch (e) {
        console.debug('[ERROR] Token not received', e);
      }

      messaging.onMessage(payload => {
        console.debug('Message received', payload);
      });
    } else {
      console.debug('Unable to get permission to notify.');
    }
    console.debug('Registration successful, scope is:', registration.scope);
  } catch (e) {
    console.debug('[ERROR] Service worker registration failed', e);
  }

  // Handle incoming messages. Called when:
  // - a message is received while the app has focus
  // - the user clicks on an app notification created by a service worker
  //   `messaging.setBackgroundMessageHandler` handler.
  // console.debug('Message received.&&&&&&&&&^^^^^^^^^^^^^^^^^^^ ');
  messaging.onMessage(payload => {
    console.debug('Message received', payload);
  });
})();

export default firebase;
