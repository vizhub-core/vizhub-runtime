export const reactJsx = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React 19 via jsDelivr + Import Maps</title>
    <script type="importmap">
      {
        "imports": {
          "react": "https://cdn.jsdelivr.net/npm/react@19.0.0/+esm",
          "react/jsx-runtime": "https://cdn.jsdelivr.net/npm/react@19.0.0/jsx-runtime/+esm",
          "react-dom/client": "https://cdn.jsdelivr.net/npm/react-dom@19.0.0/client/+esm"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.jsx"></script>
  </body>
</html>`,
  "index.jsx": `
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App.jsx';

    ReactDOM.createRoot(document.getElementById('root')).render(
      <App />
    );
  `,
  "App.jsx": `
    import React from 'react';

    function App() {
      return <div>Hello React JSX!</div>;
    }

    export default App;
  `,
};
