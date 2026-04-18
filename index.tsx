
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add WebMCP Tool definitions
if (typeof navigator !== 'undefined' && 'modelContext' in navigator) {
  (navigator as any).modelContext?.provideContext({
    tools: [
      {
        name: "count_words",
        description: "Counts words in a text",
        inputSchema: {
          type: "object",
          properties: {
            text: { type: "string" }
          },
          required: ["text"]
        },
        execute: async (args: any) => {
          const text = args.text || "";
          const count = text.trim() ? text.trim().split(/\s+/).length : 0;
          return { wordCount: count };
        }
      }
    ]
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
