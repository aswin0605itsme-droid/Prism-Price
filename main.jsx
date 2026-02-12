
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("App is mounting from main.jsx...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CRITICAL ERROR: Root element not found in DOM");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React root successfully rendered.");
} catch (error) {
  console.error("Error rendering React application:", error);
}
