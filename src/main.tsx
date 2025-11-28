import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Safari and some old browsers are missing requestIdleCallback; provide a tiny polyfill.
if (typeof window !== "undefined" && !("requestIdleCallback" in window)) {
  window.requestIdleCallback = (callback: IdleRequestCallback, options?: IdleRequestOptions): number => {
    const start = Date.now();
    return window.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, options?.timeout ?? 1);
  };
  window.cancelIdleCallback = (id: number) => window.clearTimeout(id);
}

createRoot(document.getElementById("root")!).render(<App />);
