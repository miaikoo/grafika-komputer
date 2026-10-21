// Pertemuan 7: Interactive 3D Prototype dengan Three.js

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// 1. Scene
const app = document.getElementById("app");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);

// 2. HUD reference
const hoverInfo = document.getElementById("hoverInfo");
const selectedInfo = document.getElementById("selectedInfo");
const animationInfo = document.getElementById("animationInfo");
const loadingInfo = document.getElementById("loadingInfo");
const environmentInfo = document.getElementById("environmentInfo");

const nameInfo = document.getElementById("nameInfo");
const positionInfo = document.getElementById("positionInfo");
const rotationInfo = document.getElementById("rotationInfo");
const scaleInfo = document.getElementById("scaleInfo");
const materialInfo = document.getElementById("materialInfo");

const camSwitchButton = document.getElementById("cam-switch-button");
const resetButton = document.getElementById("reset-button");

// 3. Camera (Perspective + Orthographic dari Pertemuan 6)
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const perspectiveCam = new THREE.PerspectiveCamera(
  60,
  sizes.width / sizes.height,
  0.1,
  100
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
camera.position.set(5, 3.5, 7);

// 4. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

// 5. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(4, 7, 4);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 6. Ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
groundGeometry.rotateX(-Math.PI / 2);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x263449,
  roughness: 0.85,
  metalness: 0.0
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
scene.add(ground);

// 7. Daftar object interaktif
const interactiveObjects = [];

function registerSelectable(object, label) {
  object.userData.selectable = true;
  object.userData.label = label;
  object.userData.baseScale = object.scale.clone();
  interactiveObjects.push(object);
}

// 8. Scene Graph: Hierarchy Demo
//    Scene
//    └── hierarchyGroup
//        └── body
//            ├── child
//            └── antenna
const hierarchyGroup = new THREE.Group();
hierarchyGroup.name = "Hierarchy Demo";
scene.add(hierarchyGroup);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 0.6, 1.0),
  new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.45,
    metalness: 0.15
  })
);
body.name = "Body";
body.position.y = 0.8;
body.castShadow = true;
hierarchyGroup.add(body);

const child = new THREE.Mesh(
  new THREE.BoxGeometry(0.45, 0.45, 0.45),
  new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.1
  })
);
child.name = "Child Object";
child.position.set(1.0, 0, 0);
child.castShadow = true;
body.add(child);

const antenna = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12),
  new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 1.0
  })
);
antenna.name = "Antenna";
antenna.position.set(-0.5, 0.6, 0);
antenna.castShadow = true;
body.add(antenna);

// transform parent: translation + rotation + scale
hierarchyGroup.position.x = -2.5;
hierarchyGroup.rotation.y = Math.PI / 6;
hierarchyGroup.scale.setScalar(1.1);

// transform lokal child
child.rotation.z = Math.PI / 4;

registerSelectable(hierarchyGroup, "Hierarchy Group");

// 9. Local vs World position
const worldPosition = new THREE.Vector3();

scene.updateMatrixWorld(true);
child.getWorldPosition(worldPosition);

console.log("Child local:", child.position);
console.log("Child world:", worldPosition);

// 10. PBR Sphere (MeshStandardMaterial)
const pbrGeometry = new THREE.SphereGeometry(0.7, 48, 24);

const pbrMaterial = new THREE.MeshStandardMaterial({
  color: 0x22c55e,
  roughness: 0.25,
  metalness: 0.1
});

const pbrSphere = new THREE.Mesh(pbrGeometry, pbrMaterial);
pbrSphere.name = "PBR Sphere";
pbrSphere.position.set(0, 0.8, 0);
pbrSphere.castShadow = true;
scene.add(pbrSphere);

registerSelectable(pbrSphere, "PBR Sphere");

// 11. Environment map (RoomEnvironment)
const pmremGenerator = new THREE.PMREMGenerator(renderer);

const environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// background tetap warna, environment dipakai material PBR
scene.environment = environment;

// 12. Memuat GLB + AnimationMixer
const loader = new GLTFLoader();

let importedModel = null;
let mixer = null;
let activeAction = null;
let animations = [];

loadingInfo.textContent = "loading model...";

loader.load(
  "./models/model.glb",

  gltf => {
    importedModel = gltf.scene;
    importedModel.name = "Imported GLB";

    importedModel.position.set(2.4, 0, 0);
    importedModel.scale.setScalar(0.5);

    // memeriksa hierarchy model
    importedModel.traverse(object => {
      console.log(object.name, object.type);
    });

    // shadow pada semua mesh hasil import
    importedModel.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(importedModel);

    registerSelectable(importedModel, "Imported GLB");

    // animation clip
    console.log(gltf.animations);
    animations = gltf.animations;

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(importedModel);

      const idleClip = THREE.AnimationClip.findByName(animations, "Idle") || animations[0];

      activeAction = mixer.clipAction(idleClip);
      activeAction.play();

      animationInfo.textContent = idleClip.name || "Clip 0";
    }

    loadingInfo.textContent = "model loaded";
  },

  progress => {
    if (progress.total > 0) {
      const percent = progress.loaded / progress.total * 100;
      loadingInfo.textContent = `${percent.toFixed(0)}%`;
    }
  },

  error => {
    console.error("GLTF loading error:", error);
    loadingInfo.textContent = "load failed";
  }
);

// 13. OrbitControls + batas navigasi
function createControls(targetCamera, target) {
  const newControls = new OrbitControls(targetCamera, renderer.domElement);
  newControls.target.copy(target);
  newControls.enableDamping = true;

  newControls.minDistance = 3;
  newControls.maxDistance = 25;
  newControls.minZoom = 0.5;
  newControls.maxZoom = 3;
  newControls.maxPolarAngle = Math.PI / 2 - 0.05;

  newControls.update();
  return newControls;
}

let controls = createControls(camera, new THREE.Vector3(0, 1, 0));

function changeCamera() {
  let nextCamera = orthographicCam;
  if (camera === orthographicCam) {
    nextCamera = perspectiveCam;
  }

  // salin posisi dan target sebelum dispose()
  nextCamera.position.copy(camera.position);
  const target = controls.target.clone();
  controls.dispose();

  camera = nextCamera;
  controls = createControls(camera, target);
}
camSwitchButton.addEventListener("click", changeCamera);

function resetCamera() {
  perspectiveCam.position.set(5, 3.5, 7);
  perspectiveCam.fov = 60;
  perspectiveCam.updateProjectionMatrix();

  orthographicCam.zoom = 1;
  orthographicCam.updateProjectionMatrix();

  controls.dispose();
  camera = perspectiveCam;
  controls = createControls(camera, new THREE.Vector3(0, 1, 0));
}
resetButton.addEventListener("click", resetCamera);

// 14. Membedakan click dan drag
let selectionGesture = null;
let suppressSelection = false;

renderer.domElement.addEventListener("pointerdown", (event) => {
  suppressSelection = event.button !== 0 || selectionGesture !== null;
  selectionGesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
});

window.addEventListener("pointermove", (event) => {
  if (!selectionGesture || event.pointerId !== selectionGesture.id) return;
  if (Math.hypot(event.clientX - selectionGesture.x,
                 event.clientY - selectionGesture.y) > 5)
    suppressSelection = true;
}, true);

window.addEventListener("pointerup", (event) => {
  if (event.pointerId === selectionGesture?.id) selectionGesture = null;
});

window.addEventListener("pointercancel", () => {
  selectionGesture = null;
  suppressSelection = true;
});

// 15. Raycaster + pointer NDC
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function findSelectableRoot(object) {
  let current = object;

  while (current) {
    if (current.userData.selectable) {
      return current;
    }
    current = current.parent;
  }

  return null;
}

// 16. Hover dan selection state + visual feedback
let hoveredObject = null;
let selectedObject = null;

function applyVisualState(object) {
  if (!object) {
    return;
  }

  const base = object.userData.baseScale;
  if (!base) {
    return;
  }

  let factor = 1.0;

  if (object === selectedObject) {
    factor = 1.12;
  } else if (object === hoveredObject) {
    factor = 1.06;
  }

  object.scale.set(base.x * factor, base.y * factor, base.z * factor);
}

function restoreScale(object) {
  if (!object || !object.userData.baseScale) {
    return;
  }

  object.scale.copy(object.userData.baseScale);
}

// 17. Hover interaction
renderer.domElement.addEventListener("pointermove", event => {
  if (selectionGesture) return;

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(interactiveObjects, true);

  const nextHover = hits.length > 0
    ? findSelectableRoot(hits[0].object)
    : null;

  if (nextHover !== hoveredObject) {
    const previousHover = hoveredObject;
    restoreScale(previousHover);

    hoveredObject = nextHover;

    // object lama yang masih selected kembali ke scale 1.12
    applyVisualState(previousHover);
    applyVisualState(hoveredObject);
  }

  hoverInfo.textContent = hoveredObject
    ? hoveredObject.userData.label
    : "-";
});

// 18. Click interaction
renderer.domElement.addEventListener("click", event => {
  if (suppressSelection || event.button !== 0) return;

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(interactiveObjects, true);

  restoreScale(selectedObject);

  selectedObject = hits.length > 0
    ? findSelectableRoot(hits[0].object)
    : null;

  applyVisualState(hoveredObject);
  applyVisualState(selectedObject);

  selectedInfo.textContent = selectedObject
    ? selectedObject.userData.label
    : "-";

  updateInfoPanel();
});

// 19. Challenge C: Information Panel
function formatVector(v) {
  return `${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`;
}

function updateInfoPanel() {
  if (!selectedObject) {
    nameInfo.textContent = "-";
    positionInfo.textContent = "-";
    rotationInfo.textContent = "-";
    scaleInfo.textContent = "-";
    materialInfo.textContent = "-";
    return;
  }

  // material dari mesh pertama di dalam object terpilih
  let materialType = "-";
  selectedObject.traverse(object => {
    if (object.isMesh && materialType === "-") {
      materialType = object.material.type;
    }
  });

  nameInfo.textContent = selectedObject.userData.label;
  positionInfo.textContent = formatVector(selectedObject.position);
  rotationInfo.textContent = formatVector(selectedObject.rotation);
  scaleInfo.textContent = formatVector(selectedObject.scale);
  materialInfo.textContent = materialType;
}

// 20. Challenge A: Multiple Animation Clips (1, 2, 3)
//     Challenge H: Environment Toggle (E)
const clipKeys = {
  1: "Idle",
  2: "Walking",
  3: "Running"
};

function playClip(name) {
  if (!mixer) return;

  const clip = THREE.AnimationClip.findByName(animations, name);
  if (!clip) return;

  const nextAction = mixer.clipAction(clip);
  if (nextAction === activeAction) return;

  // fade action lama, jalankan action baru
  activeAction.fadeOut(0.3);
  nextAction.reset().fadeIn(0.3).play();

  activeAction = nextAction;
  animationInfo.textContent = clip.name;
}

let environmentOn = true;

function toggleEnvironment() {
  environmentOn = !environmentOn;
  scene.environment = environmentOn ? environment : null;
  environmentInfo.textContent = environmentOn ? "ON" : "OFF";
}

window.addEventListener("keydown", event => {
  if (clipKeys[event.key]) {
    playClip(clipKeys[event.key]);
  }

  if (event.key === "e" || event.key === "E") {
    toggleEnvironment();
  }
});

// 21. Responsive rendering
window.addEventListener("resize", () => {
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
});

// 22. Animation loop
const timer = new THREE.Timer();

function animate() {
  requestAnimationFrame(animate);

  timer.update();
  const delta = Math.min(timer.getDelta(), 0.05);

  if (mixer) {
    mixer.update(delta);
  }

  hierarchyGroup.rotation.y += 0.25 * delta;
  child.rotation.x += 1.2 * delta;

  controls.update();
  renderer.render(scene, camera);
}

animate();
