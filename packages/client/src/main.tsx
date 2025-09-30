/* File Overview
  Path: client/src/main.tsx
  Purpose: Entry point for the React application. Selects the #root element in index.html
  and mounts the top-level <App /> component. Also imports global CSS.

  Reading tip for newcomers:
  - Look at App.tsx to see how providers and routes are composed
*/

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
