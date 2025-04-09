export const reactDemo = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>React Hooks Demo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
          color: #333;
        }
        #root {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: #333;
        }
        button {
          padding: 8px 16px;
          margin: 5px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .primary {
          background-color: #61dafb;
          color: black;
        }
        .primary:hover {
          background-color: #4fa8c7;
        }
        .secondary {
          background-color: #282c34;
          color: white;
        }
        .secondary:hover {
          background-color: #3e4451;
        }
        .danger {
          background-color: #e74c3c;
          color: white;
        }
        .danger:hover {
          background-color: #c0392b;
        }
      </style>
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
  "App.jsx": `import React, { useState } from 'react';
import Counter from './Counter.jsx';
import TodoList from './TodoList.jsx';

function App() {
  const [activeComponent, setActiveComponent] = useState('counter');
  
  return (
    <div>
      <h1>React Hooks Demo</h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button 
          className={activeComponent === 'counter' ? 'primary' : 'secondary'}
          onClick={() => setActiveComponent('counter')}
        >
          Counter Demo
        </button>
        <button 
          className={activeComponent === 'todo' ? 'primary' : 'secondary'}
          onClick={() => setActiveComponent('todo')}
        >
          Todo List Demo
        </button>
      </div>
      
      {activeComponent === 'counter' ? <Counter /> : <TodoList />}
    </div>
  );
}

export default App;`,
  "Counter.jsx": `import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    if (count === 0) {
      setMessage('Click to start counting!');
    } else if (count === 10) {
      setMessage('You reached 10!');
    } else if (count === 20) {
      setMessage('Wow, you reached 20!');
    } else if (count < 0) {
      setMessage('Going negative!');
    } else {
      setMessage(\`Current count: \${count}\`);
    }
    
    console.log('Counter updated:', count);
  }, [count]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Counter Example</h2>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{count}</p>
      <p>{message}</p>
      <div>
        <button className="primary" onClick={() => setCount(count + 1)}>
          Increment
        </button>
        <button className="secondary" onClick={() => setCount(count - 1)}>
          Decrement
        </button>
        <button className="danger" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default Counter;`,
  "TodoList.jsx": `import React, { useState, useEffect } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React Hooks', completed: true },
    { id: 2, text: 'Build a Todo App', completed: false },
    { id: 3, text: 'Master useEffect', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  
  useEffect(() => {
    // Update stats whenever todos change
    const completed = todos.filter(todo => todo.completed).length;
    setStats({
      total: todos.length,
      completed: completed,
      remaining: todos.length - completed
    });
    
    console.log('Todo list updated');
  }, [todos]);
  
  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const newItem = {
      id: Date.now(),
      text: newTodo,
      completed: false
    };
    
    setTodos([...todos, newItem]);
    setNewTodo('');
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Todo List Example</h2>
      
      <div style={{ marginBottom: '20px', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
        <p>Stats: {stats.completed} completed / {stats.total} total</p>
        <div style={{ height: '10px', background: '#e9ecef', borderRadius: '5px' }}>
          <div 
            style={{ 
              height: '100%', 
              width: \`\${todos.length ? (stats.completed / stats.total) * 100 : 0}%\`, 
              background: '#61dafb',
              borderRadius: '5px',
              transition: 'width 0.3s ease'
            }} 
          />
        </div>
      </div>
      
      <form onSubmit={addTodo} style={{ display: 'flex', marginBottom: '20px' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          style={{ 
            flex: 1, 
            padding: '8px', 
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
        <button 
          type="submit" 
          className="primary"
          style={{ marginLeft: '10px' }}
        >
          Add
        </button>
      </form>
      
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li 
            key={todo.id} 
            style={{ 
              padding: '10px',
              margin: '5px 0',
              background: todo.completed ? '#e8f4f8' : 'white',
              borderRadius: '4px',
              border: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.3s ease'
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ marginRight: '10px' }}
            />
            <span style={{ 
              flex: 1,
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#666' : '#333'
            }}>
              {todo.text}
            </span>
            <button 
              onClick={() => removeTodo(todo.id)}
              className="danger"
              style={{ padding: '4px 8px' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;`,
  "package.json": `{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
};
