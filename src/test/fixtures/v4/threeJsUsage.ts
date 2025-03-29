export const threeJsUsage = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>Three.js Test</title>
      <script type="importmap">
        {
          "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.175.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.175.0/examples/jsm/"
          }
        }
      </script>
    </head>
    <body>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
  "index.js": `
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    console.log('Three.js imports:', typeof THREE, typeof OrbitControls);
  `,
};
