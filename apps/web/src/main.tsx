/**
 * @file main.tsx
 * @module ReactApp
 * @description Entry point for the Quantize Website React application
 * 
 * This file:
 * - Initializes the React application
 * - Mounts the root App component to the DOM
 * - Imports global CSS styles
 * - Sets up the React 18 concurrent features
 * 
 * @requires react-dom/client
 * @requires ./App
 * @requires ./index.css
 * @since 1.0.0
 * 
 * @example
 * // The application is automatically started when this file is loaded
 * // See App.tsx for routing and provider configuration
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
