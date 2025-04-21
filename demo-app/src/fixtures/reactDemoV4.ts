import { VizHubRuntimeFixture } from "./types";

export const reactDemoV4: VizHubRuntimeFixture = {
  label: "React Demo (v4)",
  status: "working",
  files: {
    "index.html": `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React 19 via jsDelivr + Import Maps</title>
    <script type="importmap">
      {
        "imports": {
          "react": "https://cdn.jsdelivr.net/npm/react@19.1.0/+esm",
          "react/jsx-runtime": "https://cdn.jsdelivr.net/npm/react@19.1.0/jsx-runtime/+esm",
          "react-dom/client": "https://cdn.jsdelivr.net/npm/react-dom@19.1.0/client/+esm"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.jsx"></script>
  </body>
</html>
  `,
    "index.jsx": `
    import React, { useState } from "react";
    import { createRoot } from "react-dom/client";

    const Counter = () => {
      const [count, setCount] = useState(0);

      return (
        <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '50px' }}>
          <h1>React Counter Demo</h1>
          <p>Current count: <strong>{count}</strong></p>
          <button
            onClick={() => setCount(count - 1)}
            style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Decrease
          </button>
          <button
            onClick={() => setCount(0)}
            style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#808080', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reset
          </button>
          <button
            onClick={() => setCount(count + 1)}
            style={{ margin: '5px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Increase
          </button>
        </div>
      );
    };

    const root = createRoot(document.getElementById("root"));
    root.render(<Counter />);
  `,
  },
};
