import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";

const firebaseConfig = { // public keys
  apiKey: "AIzaSyB1iLAo877x2AYGnr13BImqewOMLJsBPXU",
  authDomain: "my-react-blog-d1b6d.firebaseapp.com",
  projectId: "my-react-blog-d1b6d",
  storageBucket: "my-react-blog-d1b6d.appspot.com",
  messagingSenderId: "888338746876",
  appId: "1:888338746876:web:21732159f16a42a4f0b679"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
