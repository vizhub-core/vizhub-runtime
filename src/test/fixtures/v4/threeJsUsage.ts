export const threeJsUsage = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>Three.js Test</title>
      <style>
        body { margin: 0; }
        canvas { display: block; }
      </style>
    </head>
    <body>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
  "index.js": `import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();
console.log('Three.js cube rendered successfully');`,
  "package.json": `{
  "dependencies": {
    "three": "^0.158.0"
  }
}`,
};
