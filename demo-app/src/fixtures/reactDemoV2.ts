export const reactDemoV2 = {
  label: "React Demo (v2)",
  files: {
    "index.html": `
    <div id="root"></div>
    <script src='bundle.js'></script>
  `,
    "index.js": `
    import React, { useState } from 'react';
    import ReactDOM from 'react-dom';
    
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
    
    ReactDOM.render(
      <Counter />,
      document.getElementById('root')
    );
  `,
    "package.json": `{
    "dependencies": {
      "react": "18.2.0",
      "react-dom": "18.2.0"
    },
    "vizhub": {
      "libraries": {
        "react": {
          "global": "React",
          "path": "/umd/react.production.min.js"
        },
        "react-dom": {
          "global": "ReactDOM",
          "path": "/umd/react-dom.production.min.js"
        }
      }
    }
  }`,
  },
};
