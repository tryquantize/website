import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { testFirestoreConnection } from "./utils/test-firestore";

// Add test function to window for debugging
if (typeof window !== 'undefined') {
  (window as any).testFirestore = testFirestoreConnection;
}

createRoot(document.getElementById("root")!).render(<App />);
