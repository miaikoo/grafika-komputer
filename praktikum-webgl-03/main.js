import { Mat3 } from "./matrix3.js";

// ===============================================================================
// Environment Setup
// =================
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) throw new Error("WebGL2 tidak tersedia.");

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.03, 0.05, 0.10, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const vertexShaderSource = `#version 300 es
in vec2 a_position;
uniform mat3 u_matrix;

void main() {
  vec3 p = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(p.xy, 0.0, 1.0);
  gl_PointSize = 12.0;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec4 u_color;
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
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

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link error:\n" + info);
  }

  return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);
// ===============================================================================


// ===============================================================================
// CPU Data
const vertices = new Float32Array([
  -0.18, -0.15,
   0.18, -0.15,
   0.00,  0.22,
]);

const colorA = new Float32Array([
  0.10,
  0.75,
  1.00,
  1.00
]);

const colorB = new Float32Array([
  1.00,
  0.55,
  0.10,
  1.00
]);

const objectA = {
  x: -0.4,
  y: 0.0,

  rotation: 0.0,

  scaleX: 1.0,
  scaleY: 1.0
};

let useSecondOrder = false;

const axisVertices = new Float32Array([
  -1.0, 0.0,
    1.0, 0.0,

    0.0, -1.0,
    0.0,  1.0
]);

const originPointVertices = new Float32Array([
  0, 0
])

const colorAxis = new Float32Array([0.45, 0.55, 0.70, 1.00]);
// ===============================================================================


// ===============================================================================
// Transoformation Function
function degToRad(degree) {
  return (degree * Math.PI) / 180;
}

function createTRSMatrix(transform) {
  const t = Mat3.translation(transform.x, transform.y);
  const r = Mat3.rotation(degToRad(transform.rotation));
  const s = Mat3.scaling(transform.scaleX, transform.scaleY);

  let matrix = Mat3.identity();
  matrix = Mat3.multiply(matrix, s);
  matrix = Mat3.multiply(matrix, r);
  matrix = Mat3.multiply(matrix, t);
  return matrix;
}

function createRTSMatrix(transform) {
  const t = Mat3.translation(transform.x, transform.y);
  const r = Mat3.rotation(degToRad(transform.rotation));
  const s = Mat3.scaling(transform.scaleX, transform.scaleY);

  let matrix = Mat3.identity();
  matrix = Mat3.multiply(matrix, s);
  matrix = Mat3.multiply(matrix, t);
  matrix = Mat3.multiply(matrix, r);
  return matrix;
}
// ===============================================================================


// ===============================================================================
// Send CPU data to GPU
const positionBuffer = gl.createBuffer();
const axisBuffer = gl.createBuffer();
const originPointBuffer = gl.createBuffer()
const positionLocation = gl.getAttribLocation(program, "a_position");
const matrixLocation = gl.getUniformLocation(program, "u_matrix");
const colorLocation = gl.getUniformLocation(program, "u_color");

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, originPointBuffer);
gl.bufferData(gl.ARRAY_BUFFER, originPointVertices, gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLocation);
// ===============================================================================


// ===============================================================================
// Input
const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "r") resetObjectA();
  if (key === "t") useSecondOrder = !useSecondOrder;
});
// ===============================================================================


// ===============================================================================
// Update
const moveSpeed = 0.65;

function updateTranslation(dt) {
  if (keys["arrowleft"]) objectA.x -= moveSpeed * dt;
  if (keys["arrowright"]) objectA.x += moveSpeed * dt;
  if (keys["arrowup"]) objectA.y += moveSpeed * dt;
  if (keys["arrowdown"]) objectA.y -= moveSpeed * dt;
}

const rotationSpeed = 100.0;

function updateRotation(dt) {
  if (keys["q"]) objectA.rotation -= rotationSpeed * dt;
  if (keys["e"]) objectA.rotation += rotationSpeed * dt;
}

const scaleSpeed = 0.8;

function updateUniformScale(dt) {
  if (keys["+"] || keys["="]) {
    objectA.scaleX += scaleSpeed * dt;
    objectA.scaleY += scaleSpeed * dt;
  }

  if (keys["-"] || keys["_"]) {
    objectA.scaleX -= scaleSpeed * dt;
    objectA.scaleY -= scaleSpeed * dt;
  }
}

function updateNonUniformScale(dt) {
  if (keys["z"]) objectA.scaleX -= scaleSpeed * dt;
  if (keys["x"]) objectA.scaleX += scaleSpeed * dt;
  if (keys["c"]) objectA.scaleY -= scaleSpeed * dt;
  if (keys["v"]) objectA.scaleY += scaleSpeed * dt;
}

function clampObjectA() {
  objectA.x = Math.max(-0.8, Math.min(0.8, objectA.x));
  objectA.y = Math.max(-0.75, Math.min(0.75, objectA.y));
  objectA.scaleX = Math.max(0.2, Math.min(2.5, objectA.scaleX));
  objectA.scaleY = Math.max(0.2, Math.min(2.5, objectA.scaleY));
}

function resetObjectA() {
  objectA.x = -0.4;
  objectA.y = 0.0;
  objectA.rotation = 0.0;
  objectA.scaleX = 1.0;
  objectA.scaleY = 1.0;
}

function update(dt) {
  updateTranslation(dt);
  updateRotation(dt);
  updateUniformScale(dt);
  updateNonUniformScale(dt);
  clampObjectA();
}
// ===============================================================================


// ===============================================================================
// HUD
const positionInfo = document.getElementById("positionInfo");
const rotationInfo = document.getElementById("rotationInfo");
const scaleInfo = document.getElementById("scaleInfo");
const orderInfo = document.getElementById("orderInfo");

function updateHUD() {
  positionInfo.textContent = `(${objectA.x.toFixed(2)}, ${objectA.y.toFixed(2)})`;
  rotationInfo.textContent = `${objectA.rotation.toFixed(1)}°`;
  scaleInfo.textContent = `(${objectA.scaleX.toFixed(2)}, ${objectA.scaleY.toFixed(2)})`;

  if (useSecondOrder) {
    orderInfo.textContent = "R x T x S (mengorbit)";
  } else {
    orderInfo.textContent = "T x R x S (berputar di tempat)";
  }
}
// ===============================================================================


// ===============================================================================
// Draw
function createObjectBMatrix(seconds) {
  const rotation = seconds * 70.0;
  const scale = 1.0 + Math.sin(seconds * 2.0) * 0.25;

  const transformB = {
    x: 0.4,
    y: 0.0,
    rotation,
    scaleX: scale,
    scaleY: scale,
  };

  return createTRSMatrix(transformB);
}

function drawObject(matrix, color) {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawAxes() {
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix3fv(matrixLocation, false, Mat3.identity());
  gl.uniform4fv(colorLocation, colorAxis);
  gl.drawArrays(gl.LINES, 0, 4);
}

function drawOriginPoint() {
  gl.bindBuffer(gl.ARRAY_BUFFER, originPointBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix3fv(matrixLocation, false, Mat3.identity());
  gl.uniform4fv(colorLocation, colorAxis);
  gl.drawArrays(gl.POINTS, 0, 1);
}

function drawScene(seconds) {
  drawAxes();
  drawOriginPoint();

  let matrixA;
  if (useSecondOrder) {
    matrixA = createRTSMatrix(objectA);
  } else {
    matrixA = createTRSMatrix(objectA);
  }
  const matrixB = createObjectBMatrix(seconds);
  drawObject(matrixA, colorA);
  drawObject(matrixB, colorB)
}
// ===============================================================================


// ===============================================================================
// Render Loop
let lastTime = 0;

function render(time) {
  const seconds = time * 0.001
  let dt = (time - lastTime) * 0.001;
  lastTime = time;

  dt = Math.min(dt, 0.05);

  update(dt);
  updateHUD()
  drawScene(seconds);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
// ===============================================================================