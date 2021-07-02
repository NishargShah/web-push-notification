import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import firebase from "firebase";
import { vapidKey } from "./config";
import notification from './firebase';
import icon from './assets/icon.png';
import './index.css';

const App = () => {
  useEffect(() => {
    (async () => notification.init())();
  }, []);

  const askForToken = async () => {
    try {
      const messaging = firebase.messaging();
      const token = await messaging.getToken({ vapidKey });
      console.log(token);
      return token;
    } catch (error) {
      console.error('ERROR', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={icon} className="App-logo" alt="icon"/>
        <h1 className="App-title">Welcome to the web push notification demo!</h1>
      </header>
      <button onClick={askForToken}>
        Click here to get your token
      </button>
    </div>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'));
