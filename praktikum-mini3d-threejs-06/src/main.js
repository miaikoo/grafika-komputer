// =====================================================
// Pertemuan 6: Mini 3D Scene dengan Three.js
// =====================================================

import * as THREE from "three";
import { OrbitControls  } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


// -----------------------------------------------------
// 1. Elemen HTML
// -----------------------------------------------------
const app = document.getElementById("app");
const resetButton = document.getElementById("reset-button");
const info = document.getElementById("info");
const pauseButton = document.getElementById("pause-button");
const camSwitchButton = document.getElementById("cam-switch-button");

// -----------------------------------------------------
// 2. Scene
// -----------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);

// -----------------------------------------------------
// 3. Kamera
// -----------------------------------------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const perspectiveCam = new THREE.PerspectiveCamera(
  60, // fov
  sizes.width / sizes.height, // aspect
  0.1, // near
  100 // far
);

const VIEW_HEIGHT = 8;
const aspect = sizes.width / sizes.height; 
const orthographicCam = new THREE.OrthographicCamera(
  -VIEW_HEIGHT * aspect / 2, 
  VIEW_HEIGHT * aspect / 2, 
  VIEW_HEIGHT / 2, 
  -VIEW_HEIGHT / 2, 
  0.1, 
  100
);

let camera = perspectiveCam;
camera.position.set(4, 3, 6);
camera.lookAt(0, 0.5, 0);

// -----------------------------------------------------
// 4. Renderer
// -----------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

// -----------------------------------------------------
// 5. Objek
// -----------------------------------------------------
// Kubus
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x22d3ee });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(-2, 2.5, 0);
cube.castShadow = true;
scene.add(cube);

// Bola
const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 16);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x4488ff, shininess: 200});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(1.4, 0.9, 0);
sphere.castShadow = true;
scene.add(sphere);

// Lantai
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x334155 });
groundGeometry.rotateX(-Math.PI / 2);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
scene.add(ground);

// TorusKnot
const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.4, 64, 8, 20, 10);
const textureLoader = new THREE.TextureLoader();
const torusTexture = textureLoader.load("./textures/batu.png");
torusTexture.colorSpace = THREE.SRGBColorSpace;
const torusKnotMaterial = new THREE.MeshStandardMaterial({ map: torusTexture });
const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
torusKnot.position.set(1.4, 2, -2);
torusKnot.castShadow = true;
scene.add(torusKnot);

// Kerucut
const coneGeometry = new THREE.ConeGeometry(0.6, 1.5, 32);
const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
cone.position.set(-2.5, 0.75, -4);
cone.castShadow = true;
cone.receiveShadow = true;
scene.add(cone);

const loader = new GLTFLoader();
function loadModel(file, x, y, z, scale) {
  loader.load("./models/glTF/" + file, function (gltf) {
    const model = gltf.scene;
    model.position.set(x, y, z);
    model.scale.set(scale, scale, scale);

    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });

    scene.add(model);
  });
}

loadModel("Key_Metal.gltf",        0,    1.82, 3,   10);
loadModel("Workbench.gltf",        0,    0,    3,   2);
loadModel("Vase_4.gltf",           1.2,    1.82,    2.5,   2);
loadModel("FarmCrate_Carrot.gltf", -1.2, 1.82, 3.4, 2);


// -----------------------------------------------------
// 6. Cahaya dan bayangan
// -----------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(3, 5, 2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -5;
directionalLight.shadow.camera.near = -5;
directionalLight.shadow.camera.far = 10;
scene.add(directionalLight);

// -----------------------------------------------------
// 7. Kontrol kamera (OrbitControls)
// -----------------------------------------------------
function createControls(targetCamera, target) {
  const newcontrols = new OrbitControls(targetCamera, renderer.domElement);
  newcontrols.target.copy(target);
  newcontrols.enableDamping = true;
  newcontrols.update();
  return newcontrols;
}

let controls = createControls(camera, new THREE.Vector3(0, 0.5, 0));

function changeCamera() {
  let nextCamera = orthographicCam;
  if (camera === orthographicCam) {
    nextCamera = perspectiveCam
  }

  nextCamera.position.copy(camera.position);
  const target = controls.target.clone();
  controls.dispose();

  camera = nextCamera;
  controls = createControls(camera, target);
}
camSwitchButton.addEventListener("click", changeCamera)

function resetCamera() {
  perspectiveCam.position.set(4, 3, 6);
  perspectiveCam.fov = 60;
  perspectiveCam.updateProjectionMatrix();

  orthographicCam.zoom = 1;
  orthographicCam.updateProjectionMatrix();

  controls.dispose();
  camera = perspectiveCam;
  controls = createControls(camera, new THREE.Vector3(0, 0.5, 0))
}
resetButton.addEventListener("click", resetCamera);

// -----------------------------------------------------
// 8.1 Menyesuaikan ukuran jendela
// -----------------------------------------------------
function onResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  const aspect = sizes.width / sizes.height; 

  perspectiveCam.aspect = aspect;
  perspectiveCam.updateProjectionMatrix();

  orthographicCam.left = -VIEW_HEIGHT * aspect / 2;
  orthographicCam.right = VIEW_HEIGHT * aspect / 2;
  orthographicCam.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener("resize", onResize);

// -----------------------------------------------------
// 8.2 Toggle Pause Animasi
// -----------------------------------------------------
let pause = false;
function pauseLoop() {
  pause = !pause;
  pauseButton.textContent = pause === false ? "Jeda Animasi" : "Lanjutkan Animasi";
}
pauseButton.addEventListener("click", pauseLoop);

// -----------------------------------------------------
// 9. HUD
// -----------------------------------------------------
function updateHUD() {
  const pos = camera.position;
  let camName = "Perspective";
  if (camera === orthographicCam) {
    camName = "Orthographic";
  }

  info.textContent = 
    "Objek di scene: " + scene.children.length +
    " | Kamera " + camName + ": " + pos.x.toFixed(1) + ", " + pos.y.toFixed(1) + ", " + pos.z.toFixed(1);

}

// -----------------------------------------------------
// 10. Animasi
// -----------------------------------------------------
const timer = new THREE.Timer();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);

  timer.update();
  let delta;
  if (!pause) {
    delta = Math.min(timer.getDelta(), 0.05);
  } else {
    delta = 0;
  }

  elapsed += delta;

  cube.rotation.x += 0.35 * delta;
  cube.rotation.y += 0.8 * delta;
  cube.scale.z = 2 + Math.sin(elapsed * 2) * 1;
  cube.scale.y = 2 + Math.sin(elapsed * 2) * 1;
  cube.scale.x = 2 + Math.sin(elapsed * 2) * 1;
  sphere.position.y = 0.9 + Math.sin(elapsed * 2) * 0.15;
  sphere.scale.x = 1.5 + Math.sin(elapsed * 2) * 0.5

  directionalLight.position.x = Math.sin(elapsed * 0.5) * 4;
  directionalLight.position.z = Math.cos(elapsed * 0.5) * 4;

  controls.update();
  updateHUD()
  renderer.render(scene, camera);
}

animate()

