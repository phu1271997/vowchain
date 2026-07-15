// Patch MetaMask Snaps RPC BEFORE any wallet / genlayer code runs.
import { installEthereumSnapsPolyfill } from "./lib/snapsBypass";
installEthereumSnapsPolyfill();

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
