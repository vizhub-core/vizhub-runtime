export const reactHooks = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>React Hooks Test</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="index.jsx"></script>
    </body>
  </html>`,
  "index.jsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import Counter from './Counter.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Counter />
  </React.StrictMode>
);`,
  "Counter.jsx": `import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('React Hooks working: count is ' + count);
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;`,
  "package.json": `{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
};
