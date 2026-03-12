import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
//import './index.css'
import App from "./App.tsx";
import { DoctorProvider } from "./components/DoctorProvider.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DoctorProvider>
      <App />
    </DoctorProvider>
  </StrictMode>,
);
