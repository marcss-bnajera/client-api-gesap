import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "../styles/index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0A2647",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 600,
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
);
