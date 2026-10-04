// main.js — Textured and Lit Cube Playground (Praktikum Pertemuan 5)

// ===== [A] IMPORT =====
import { Mat4, degToRad, normalMatrixFromMat4, mat3FromMat4 } from "./math3d.js";

// ===== [B] CANVAS DAN KONTEKS WEBGL2 =====
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL2 tidak tersedia.");
}

gl.enable(gl.DEPTH_TEST);

// ===== [C] DATA GEOMETRI: POSITION, NORMAL, UV =====
const positions = new Float32Array([
  // Front (z = +0.5)
  -0.5, -0.5,  0.5,    0.5, -0.5,  0.5,    0.5,  0.5,  0.5,
  -0.5, -0.5,  0.5,    0.5,  0.5,  0.5,   -0.5,  0.5,  0.5,
  // Back (z = -0.5)
   0.5, -0.5, -0.5,   -0.5, -0.5, -0.5,   -0.5,  0.5, -0.5,
   0.5, -0.5, -0.5,   -0.5,  0.5, -0.5,    0.5,  0.5, -0.5,
  // Left (x = -0.5)
  -0.5, -0.5, -0.5,   -0.5, -0.5,  0.5,   -0.5,  0.5,  0.5,
  -0.5, -0.5, -0.5,   -0.5,  0.5,  0.5,   -0.5,  0.5, -0.5,
  // Right (x = +0.5)
   0.5, -0.5,  0.5,    0.5, -0.5, -0.5,    0.5,  0.5, -0.5,
   0.5, -0.5,  0.5,    0.5,  0.5, -0.5,    0.5,  0.5,  0.5,
  // Top (y = +0.5)
  -0.5,  0.5,  0.5,    0.5,  0.5,  0.5,    0.5,  0.5, -0.5,
  -0.5,  0.5,  0.5,    0.5,  0.5, -0.5,   -0.5,  0.5, -0.5,
  // Bottom (y = -0.5)
  -0.5, -0.5, -0.5,    0.5, -0.5, -0.5,    0.5, -0.5,  0.5,
  -0.5, -0.5, -0.5,    0.5, -0.5,  0.5,   -0.5, -0.5,  0.5,
]);

const flatNormals = new Float32Array([
   0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1, // Front  → +z
   0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1, // Back   → -z
  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0, // Left   → -x
   1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0, // Right  → +x
   0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0, // Top    → +y
   0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0, // Bottom → -y
]);

function createSmoothNormals(positions) {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const length = Math.hypot(x, y, z); // panjang panah pusat → sudut (sekitar 0.866)
    normals[i] = x / length;
    normals[i + 1] = y / length;
    normals[i + 2] = z / length;
  }
  return normals;
}
const smoothNormals = createSmoothNormals(positions);

function createCubeUVs() {
  const faceUV = [
    0, 0,   1, 0,   1, 1, // segitiga 1: kiri bawah, kanan bawah, kanan atas
    0, 0,   1, 1,   0, 1, // segitiga 2: kiri bawah, kanan atas, kiri atas
  ];
  const uv = [];
  for (let face = 0; face < 6; face++) {
    uv.push(...faceUV); // urutan vertex tiap sisi sama, jadi UV-nya juga sama
  }
  return new Float32Array(uv);
}
const texCoords = createCubeUVs();


// ===== [D] SHADER =====
const vertexShaderSource = `#version 300 es
in vec3 a_position;   // posisi vertex (local space)
in vec3 a_normal;     // normal vertex (local space)
in vec2 a_texCoord;   // alamat UV

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat3 u_normalMatrix;
uniform float u_uvScale;
uniform vec2 u_uvOffset;

out vec3 v_worldPosition;
out vec3 v_normal;
out vec2 v_texCoord;

void main() {
  vec4 worldPosition = u_model * vec4(a_position, 1.0);

  v_worldPosition = worldPosition.xyz;    // posisi titik di world space
  v_normal = u_normalMatrix * a_normal;   // normal di world space
  v_texCoord = a_texCoord * u_uvScale + u_uvOffset;

  gl_Position = u_projection * u_view * worldPosition;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_worldPosition;
in vec3 v_normal;
in vec2 v_texCoord;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;
uniform float u_ambientStrength;
uniform float u_shininess;
uniform sampler2D u_texture;
uniform bool u_unlit;   // true saat menggambar kubus kecil penanda lampu
uniform bool u_useAmbient;
uniform bool u_useDiffuse;
uniform bool u_useSpecular;

out vec4 outColor;

void main() {
  if (u_unlit) {        // penanda lampu tidak kena lighting: warnanya warna lampu
    outColor = vec4(u_lightColor, 1.0);
    return;
  }

  // 1) Tiga panah utama: panjang 1, semuanya di world space
  vec3 N = normalize(v_normal);                            // arah hadap permukaan
  vec3 L = normalize(u_lightPosition - v_worldPosition);   // dari titik ke lampu
  vec3 V = normalize(u_cameraPosition - v_worldPosition);  // dari titik ke kamera

  // 2) Diffuse: seberapa lurus permukaan menghadap lampu
  float diff = max(dot(N, L), 0.0);

  // 3) Specular: seberapa pas pantulan cahaya masuk ke mata
  vec3 R = reflect(-L, N);
  float spec = 0.0;
  if (diff > 0.0) {   // sisi yang membelakangi lampu tidak boleh berkilau
    spec = pow(max(dot(R, V), 0.0), u_shininess);
  }

  // 4) Warna dasar dari texture
  vec3 texColor = texture(u_texture, v_texCoord).rgb;

  // 5) Gabungkan tiga lapis cahaya
  vec3 ambient  = u_ambientStrength * texColor;
  vec3 diffuse  = diff * u_lightColor * texColor;
  vec3 specular = spec * u_lightColor;   // tidak dikali texColor: kilau berwarna lampu

  vec3 color = vec3(0.0);
  if (u_useAmbient)  color += ambient;
  if (u_useDiffuse)  color += diffuse;
  if (u_useSpecular) color += specular;

  outColor = vec4(color, 1.0);
}
`;

// ===== [E] HELPER WEBGL =====
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile error:\n" + info);
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link error:\n" + info);
  }
  return program;
}

// Menyalin array JavaScript ke memori GPU.
function createArrayBuffer(data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

// Memberi tahu GPU: attribute di `location` dibaca dari `buffer`, `size` angka per vertex.
function setupAttribute(buffer, location, size) {
  if (location < 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

// ===== [F] PROGRAM DAN LOKASI =====
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

const positionLocation = gl.getAttribLocation(program, "a_position");
const normalLocation = gl.getAttribLocation(program, "a_normal");
const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

const modelLocation = gl.getUniformLocation(program, "u_model");
const viewLocation = gl.getUniformLocation(program, "u_view");
const projectionLocation = gl.getUniformLocation(program, "u_projection");
const normalMatrixLocation = gl.getUniformLocation(program, "u_normalMatrix");
const uvScaleLocation = gl.getUniformLocation(program, "u_uvScale");
const textureLocation = gl.getUniformLocation(program, "u_texture");
const ambientLocation = gl.getUniformLocation(program, "u_ambientStrength");
const lightPositionLocation = gl.getUniformLocation(program, "u_lightPosition");
const lightColorLocation = gl.getUniformLocation(program, "u_lightColor");
const cameraPositionLocation = gl.getUniformLocation(program, "u_cameraPosition");
const shininessLocation = gl.getUniformLocation(program, "u_shininess");
const unlitLocation = gl.getUniformLocation(program, "u_unlit");
const useAmbientLocation = gl.getUniformLocation(program, "u_useAmbient");
const useDiffuseLocation = gl.getUniformLocation(program, "u_useDiffuse");
const useSpecularLocation = gl.getUniformLocation(program, "u_useSpecular");
const uvOffsetLocation = gl.getUniformLocation(program, "u_uvOffset");

// ===== [G] BUFFER =====
const positionBuffer = createArrayBuffer(positions);
const flatNormalBuffer = createArrayBuffer(flatNormals);
const smoothNormalBuffer = createArrayBuffer(smoothNormals);
const texCoordBuffer = createArrayBuffer(texCoords);


// ===== [H] TEXTURE =====
function createCheckerTexture() {
  const size = 64;
  const source = document.createElement("canvas");
  source.width = size;
  source.height = size;
  const ctx = source.getContext("2d");

  const cells = 8;
  const cellSize = size / cells; // 8 piksel per kotak
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const even = (x + y) % 2 === 0;
      ctx.fillStyle = even ? "#f8fafc" : "#0ea5e9";
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  gl.generateMipmap(gl.TEXTURE_2D); // wajib: filter bawaan WebGL memakai mipmap
  return texture;
}

const texture = createCheckerTexture();

// Colokkan texture ke slot 0, lalu beri tahu sampler u_texture untuk membaca slot 0.
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.uniform1i(textureLocation, 0);

let filterMode = "LINEAR";

function applyFiltering() {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const mode = filterMode === "NEAREST" ? gl.NEAREST : gl.LINEAR;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mode); // saat texture tampil lebih kecil
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mode); // saat texture tampil lebih besar
}

const wrapModes = ["REPEAT", "CLAMP_TO_EDGE", "MIRRORED_REPEAT"];
let wrapIndex = 0;

function applyWrapping() {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const mode = gl[wrapModes[wrapIndex]]; // gl["REPEAT"] sama dengan gl.REPEAT
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mode); // S = arah u (horizontal)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mode); // T = arah v (vertikal)
}

applyFiltering();
applyWrapping();

// ===== [I] STATE SCENE =====
const cube = {
  rotationX: 20, // derajat
  rotationY: 30,
  scaleX: 1.0,
  scaleY: 1.0,
  scaleZ: 1.0,
};

const camera = {
  position: [0.0, 1.4, 4.0], // sedikit di atas, di depan kubus
  target: [0.0, 0.0, 0.0],   // melihat ke pusat kubus
  up: [0.0, 1.0, 0.0],
};

let shadingMode = "FLAT";
let isPaused = false;
let uvScale = 1.0;
let ambientStrength = 0.2;

for (const radio of document.querySelectorAll('input[name="ambientStrength"]')) {
  radio.addEventListener("change", () => {
    ambientStrength = parseFloat(radio.value);
  });
}

const light = {
  position: [1.5, 1.5, 1.5], // kanan, atas, depan kubus (masih terlihat kamera)
  color: [1.0, 1.0, 1.0],    // putih
};

let shininess = 32.0;

let normalMode = "NORMAL_MATRIX";

const uvScrollCheckbox = document.getElementById("useUVScroll");
const uvOffset = [0.0, 0.0];          
const uvScrollSpeed = [0.2, 0.0];    

const ambientCheckbox = document.getElementById("useAmbient");
const diffuseCheckbox = document.getElementById("useDiffuse");
const specularCheckbox = document.getElementById("useSpecular");
function lightingModeName() {
  const a = ambientCheckbox.checked;
  const d = diffuseCheckbox.checked;
  const s = specularCheckbox.checked;
  if (a && d && s) return "All Components";
  if (a && d) return "Ambient + Diffuse";
  if (a && s) return "Ambient + Specular";
  if (d && s) return "Diffuse + Specular";
  if (a) return "Ambient Only";
  if (d) return "Diffuse Only";
  if (s) return "Specular Only";
  return "None";
}

// ===== [J] INPUT KEYBOARD =====
const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.code] = true;
  if (event.code.startsWith("Arrow")) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

window.addEventListener("blur", () => {
  for (const code in keys) keys[code] = false;
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;

  switch (event.code) {
    case "KeyF":
      shadingMode = shadingMode === "FLAT" ? "SMOOTH" : "FLAT";
      break;
    case "KeyP":
      isPaused = !isPaused;
      break;
    case "KeyT":
      filterMode = filterMode === "LINEAR" ? "NEAREST" : "LINEAR";
      applyFiltering();
      break;
    case "KeyG":
      wrapIndex = (wrapIndex + 1) % wrapModes.length;
      applyWrapping();
      break;
    case "KeyN":
      cube.scaleY = cube.scaleY === 1.0 ? 2.0 : 1.0; // tarik kubus 2× lebih tinggi (scale tidak rata)
      break;
    case "KeyM":
      normalMode = normalMode === "NORMAL_MATRIX" ? "MODEL_3X3" : "NORMAL_MATRIX";
      break;
    case "KeyR":
      resetScene();
      break;
  }
});

// ===== [K] UPDATE STATE =====
function updateCube(dt) {
  cube.rotationX += 20.0 * dt; // 20 derajat per detik
  cube.rotationY += 35.0 * dt;
}

const uvScaleSpeed = 1.5;

function updateUVScale(dt) {
  if (keys["BracketLeft"]) uvScale -= uvScaleSpeed * dt;
  if (keys["BracketRight"]) uvScale += uvScaleSpeed * dt;
  uvScale = Math.max(0.25, Math.min(5.0, uvScale)); // batasi 0.25 sampai 5
}

const lightSpeed = 2.0; // satuan per detik

function updateLight(dt) {
  if (keys["ArrowLeft"]) light.position[0] -= lightSpeed * dt;
  if (keys["ArrowRight"]) light.position[0] += lightSpeed * dt;
  if (keys["ArrowUp"]) light.position[1] += lightSpeed * dt;
  if (keys["ArrowDown"]) light.position[1] -= lightSpeed * dt;
  if (keys["KeyW"]) light.position[2] -= lightSpeed * dt; // menjauh dari kamera
  if (keys["KeyS"]) light.position[2] += lightSpeed * dt; // mendekat ke kamera
}

const shininessSpeed = 50.0;

function updateShininess(dt) {
  if (keys["Minus"] || keys["NumpadSubtract"]) shininess -= shininessSpeed * dt;
  if (keys["Equal"] || keys["NumpadAdd"]) shininess += shininessSpeed * dt;
  shininess = Math.max(2.0, Math.min(128.0, shininess));
}

function updateUVScroll(dt) {
  if (!uvScrollCheckbox.checked) return;
  uvOffset[0] = (uvOffset[0] + uvScrollSpeed[0] * dt) % 1.0;
  uvOffset[1] = (uvOffset[1] + uvScrollSpeed[1] * dt) % 1.0;
}

function resetScene() {
  light.position[0] = 1.5;
  light.position[1] = 1.5;
  light.position[2] = 1.5;
  shininess = 32.0;
  uvScale = 1.0;
  shadingMode = "FLAT";
  filterMode = "LINEAR";
  wrapIndex = 0;
  cube.scaleX = 1.0;
  cube.scaleY = 1.0;
  cube.scaleZ = 1.0;
  normalMode = "NORMAL_MATRIX";
  cube.rotationX = 20;
  cube.rotationY = 30;
  applyFiltering();
  applyWrapping();
}

// ===== [L] MENGGAMBAR =====
function createModelMatrix() {
  const rx = Mat4.rotationX(degToRad(cube.rotationX));
  const ry = Mat4.rotationY(degToRad(cube.rotationY));
  const s = Mat4.scaling(cube.scaleX, cube.scaleY, cube.scaleZ);

  // model = S × Rx × Ry, dibaca dari kanan: putar Y, putar X, lalu scale
  let model = Mat4.identity();
  model = Mat4.multiply(model, s);
  model = Mat4.multiply(model, rx);
  model = Mat4.multiply(model, ry);
  return model;
}

function drawScene() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.025, 0.04, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);

  // 1) Attribute: dari buffer mana tiap data per vertex dibaca
  setupAttribute(positionBuffer, positionLocation, 3);
  setupAttribute(texCoordBuffer, texCoordLocation, 2);
  const activeNormalBuffer = shadingMode === "FLAT" ? flatNormalBuffer : smoothNormalBuffer;
  setupAttribute(activeNormalBuffer, normalLocation, 3);

  // 2) Matriks
  const model = createModelMatrix();
  const view = Mat4.lookAt(camera.position, camera.target, camera.up);
  const projection = Mat4.perspective(degToRad(60), canvas.width / canvas.height, 0.1, 100.0);
  const normalMatrix =
    normalMode === "NORMAL_MATRIX"
      ? normalMatrixFromMat4(model) // benar: inverse transpose
      : mat3FromMat4(model);        // salah: diperlakukan sama seperti posisi

  gl.uniformMatrix4fv(modelLocation, false, model);
  gl.uniformMatrix4fv(viewLocation, false, view);
  gl.uniformMatrix4fv(projectionLocation, false, projection);
  gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

  // 3) Texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(textureLocation, 0);
  gl.uniform1f(uvScaleLocation, uvScale);
  gl.uniform2fv(uvOffsetLocation, uvOffset);

  // 4) Lighting
  gl.uniform1f(ambientLocation, ambientStrength);
  gl.uniform3fv(lightPositionLocation, light.position);
  gl.uniform3fv(lightColorLocation, light.color);
  gl.uniform3fv(cameraPositionLocation, camera.position);
  gl.uniform1f(shininessLocation, shininess);
  gl.uniform1i(useAmbientLocation, ambientCheckbox.checked ? 1 : 0);
  gl.uniform1i(useDiffuseLocation, diffuseCheckbox.checked ? 1 : 0);
  gl.uniform1i(useSpecularLocation, specularCheckbox.checked ? 1 : 0);
  
  // 5) Gambar: 36 vertex = 12 segitiga = 6 sisi
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // 6) Penanda lampu: kubus kecil di posisi lampu, digambar tanpa lighting
  const markerModel = Mat4.multiply(
    Mat4.translation(light.position[0], light.position[1], light.position[2]),
    Mat4.scaling(0.08, 0.08, 0.08)
  );
  gl.uniformMatrix4fv(modelLocation, false, markerModel);
  gl.uniform1i(unlitLocation, 1); // true
  gl.drawArrays(gl.TRIANGLES, 0, 36);
  gl.uniform1i(unlitLocation, 0); // false lagi untuk frame berikutnya
}

// ===== [M] HUD DAN RENDER LOOP =====
function setHUD(id, text) {
  document.getElementById(id).textContent = text;
}

function updateHUD() {
  setHUD("shadingInfo", shadingMode);
  setHUD("filterInfo", filterMode);
  setHUD("wrapInfo", wrapModes[wrapIndex]);
  setHUD("uvInfo", uvScale.toFixed(2));
  setHUD("shininessInfo", shininess.toFixed(1));
  setHUD("scaleInfo", `(${cube.scaleX.toFixed(1)}, ${cube.scaleY.toFixed(1)}, ${cube.scaleZ.toFixed(1)})`);
  setHUD("normalInfo", normalMode === "NORMAL_MATRIX" ? "NORMAL MATRIX" : "MODEL 3x3 (salah)");
  setHUD("modeInfo", lightingModeName());
  setHUD("markerInfo", "(" + light.position.map((v) => v.toFixed(2)).join(", ") + ")");
}

let lastTime = 0;

function render(time) {
  let dt = (time - lastTime) * 0.001; // milidetik → detik
  lastTime = time;
  dt = Math.min(dt, 0.05);            // cegah lompatan besar setelah tab tidak aktif

  if (!isPaused) updateCube(dt);
  updateUVScale(dt);
    updateUVScroll(dt);
  updateLight(dt);
  updateShininess(dt);

  drawScene();
  updateHUD();
  requestAnimationFrame(render); // minta browser memanggil render lagi di frame berikutnya
}

requestAnimationFrame(render);