export const reactJsx = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>React JSX Test</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="index.jsx"></script>
    </body>
  </html>`,
  "index.jsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  "App.jsx": `import React from 'react';

function App() {
  return <div>Hello React JSX!</div>;
}

export default App;`,
  "package.json": `{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
};
