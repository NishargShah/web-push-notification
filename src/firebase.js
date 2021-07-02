import firebase from 'firebase/app';
import { url, vapidKey, firebaseConfig } from './config';
import 'firebase/messaging';

const isTokenSentToServer = () => window.localStorage.getItem('sentToServer') === '1';

const setTokenSentToServer = sent => window.localStorage.setItem('sentToServer', sent ? '1' : '0');

const sendTokenToServer = currentToken => {
  if (!isTokenSentToServer()) {
    console.debug('Sending token to server...', currentToken);
    setTokenSentToServer(true);
  } else {
    console.debug("Token already sent to server so won't send it again unless it changes");
  }
};

const init = async () => {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();
  console.debug('Supported?', firebase.messaging.isSupported());

  try {
    const registration = await navigator.serviceWorker.register(url);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.debug('Notification permission granted.');
      try {
        const currentToken = await messaging.getToken({
          vapidKey,
          serviceWorkerRegistration: registration,
        });
        if (currentToken) {
          await sendTokenToServer(currentToken);
          localStorage.setItem('current_token', currentToken);
          console.debug('General Token', currentToken);
        } else {
          console.debug('No Instance ID token available. Request permission to generate one.');
          setTokenSentToServer(false);
        }
      } catch (e) {
        console.debug('[ERROR] Token not received', e);
      }
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
  messaging.onMessage(payload => {
    console.log('Message received', payload);
  });
};

export default { init };
