import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { FAVICON } from './config';
import * as serviceWorkerRegistration from "./services/serviceWorkerRegistration";

const setFavicon = () => {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = `${process.env.PUBLIC_URL}/${FAVICON}`;
  document.head.appendChild(link);
};

setFavicon();

const container = document.getElementById('root');
// Создаем root
const root = createRoot(container);

// Используем новый API
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

serviceWorkerRegistration.register();