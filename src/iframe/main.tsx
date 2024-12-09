import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setupBackgroundService } from "~api/background/background-setup";
import { ArConnectEmbeddedAppRoot } from "./iframe";

import "../../assets/popup.css";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <ArConnectEmbeddedAppRoot />
//   </StrictMode>
// );

createRoot(document.getElementById("root")).render(
  <ArConnectEmbeddedAppRoot />
);

setupBackgroundService();
