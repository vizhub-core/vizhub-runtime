export const typeScriptSupport = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>TypeScript Test</title>
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="index.ts"></script>
    </body>
  </html>`,
  "index.ts": `import { Person } from './person';

const person: Person = {
  name: 'John Doe',
  age: 30
};

document.getElementById('app')!.innerHTML = \`
  <h1>Hello, \${person.name}!</h1>
  <p>You are \${person.age} years old.</p>
\`;

console.log('TypeScript is working');`,
  "person.ts": `export interface Person {
  name: string;
  age: number;
}`,
};
