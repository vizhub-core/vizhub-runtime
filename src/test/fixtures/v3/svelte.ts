export const svelte = {
  "App.svelte": `
    <script>
      const name = 'Svelte';
      console.log(name);
    </script>
    <h1>Hello {name}!</h1>
  `,
  "index.js": `
    import App from './App.svelte';

    export const main = (container) => {
      new App({
        target: container,
      });
    };
  `,
};
