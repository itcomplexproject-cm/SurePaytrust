import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

class RootErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("SurePay could not render the application.", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" style={{ maxWidth: 448, margin: "15vh auto", padding: 24, fontFamily: "sans-serif" }}>
          <h1>SurePay couldn’t load</h1>
          <p>Something went wrong while opening the app. Check your connection, then reload to try again.</p>
          <button type="button" onClick={() => window.location.reload()}>Reload SurePay</button>
        </main>
      );
    }
    return this.props.children;
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("SurePay offline shell could not be registered.", error);
    });
  });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RootErrorBoundary>
  </React.StrictMode>
);
