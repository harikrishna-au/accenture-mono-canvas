// Polyfill for requestIdleCallback
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function (cb) {
    const start = Date.now();
    return window.setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  } as any;
}

if (!window.cancelIdleCallback) {
  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  } as any;
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
