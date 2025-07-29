export const svelte = {
  "App.svelte": `
    <script>
      const name = 'Svelte';
      console.log(name);
    </script>
    <h1>Hello {name}!</h1>
  `,
  "index.js": `
    import { mount } from 'svelte';
    import App from './App.svelte';

    export const main = (container) => {
      mount(App, {
        target: container,
      });
    };
  `,
};
