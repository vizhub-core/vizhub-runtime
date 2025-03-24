export const svelte = {
  "App.svelte": `
        <script>
          const name = "World";
        </script>

        <h1>Hello {name}!</h1>
      `,
  "index.js": `
        import App from './App.svelte';

        export const main = (container) => {
          const app = new App({
            target: container,
          });
        };
      `,
};
