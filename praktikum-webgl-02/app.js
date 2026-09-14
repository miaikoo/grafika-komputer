let gl;
let canvas;
let program;
let positionLocation, colorLocation;
let vao;

// Primitives Data
// 1. Colorful Triangle
const triangleBase = new Float32Array([
  -0.15, -0.15,
  0.15, -0.15,
  0.00, 0.15
]);
const triangleColors = new Float32Array([
  1.0, 0.0, 0.0, // Red
  0.0, 1.0, 0.0, // Green
  0.0, 0.0, 1.0  // Blue
]);
let triOffsetX = 0.0;
let triOffsetY = 0.0;
const triMoveSpeed = 0.02;
let trianglePositionBuffer;
let triangleColorBuffer;

// 2. Solid Rectangle
const rectBase = new Float32Array([
  -0.1, -0.1,
  0.1, -0.1,
  -0.1, 0.1,
  -0.1, 0.1,
  0.1, -0.1,
  0.1, 0.1
]);
const rectColors = new Float32Array([
  1.0, 1.0, 0.0, // Yellow
  1.0, 1.0, 0.0,
  1.0, 1.0, 0.0,
  1.0, 1.0, 0.0,
  1.0, 1.0, 0.0,
  1.0, 1.0, 0.0
]);
let rectOffsetX = -0.5;
let rectOffsetY = 0.5;
let rectSpeedX = 0.015;
let rectSpeedY = 0.012;
let rectPositionBuffer;
let rectColorBuffer;

// 3. Procedural Star
const numPoints = 10;
const outerRadius = 0.25;
const innerRadius = 0.1;
const starBase = [];
const starColorsArray = [];
for (let i = 0; i < numPoints * 2; i++) {
  const angle = (i * Math.PI) / numPoints;
  const r = (i % 2 === 0) ? outerRadius : innerRadius;
  starBase.push(Math.cos(angle) * r + 0.5, Math.sin(angle) * r - 0.5); // Offset position

  if (i % 2 === 0) {
    starColorsArray.push(1.0, 0.5, 0.0); // Orange outer
  } else {
    starColorsArray.push(0.0, 1.0, 1.0); // Cyan inner
  }
}
const starFloat = new Float32Array(starBase);
const starColorFloat = new Float32Array(starColorsArray);
let starPositionBuffer;
let starColorBuffer;
let starDrawMode;

// Shaders Source
const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec3 a_color;
out vec3 v_color;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = 10.0;
  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
in vec3 v_color;
out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1.0);
}
`;

// Input State
const keys = {};

// HUD Elements
let fpsDisplay, mouseNdcDisplay, activeModeDisplay;

function initializeWebGL() {
  canvas = document.getElementById("glCanvas");
  gl = canvas.getContext("webgl2");

  if (!gl) {
    throw new Error("WebGL2 tidak tersedia");
  }

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.03, 0.05, 0.10, 1.0); // Background color

  fpsDisplay = document.getElementById("fpsDisplay");
  mouseNdcDisplay = document.getElementById("mouseNdcDisplay");
  activeModeDisplay = document.getElementById("activeModeDisplay");

  starDrawMode = gl.TRIANGLE_FAN;

  setupEvents();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createShaders() {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  return { vertexShader, fragmentShader };
}

function createProgram(vertexShader, fragmentShader) {
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
}

function createBuffers() {
  // Triangle Buffers
  trianglePositionBuffer = gl.createBuffer();
  triangleColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleColors, gl.STATIC_DRAW);

  // Rectangle Buffers
  rectPositionBuffer = gl.createBuffer();
  rectColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rectColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, rectColors, gl.STATIC_DRAW);

  // Star Buffers
  starPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, starFloat, gl.STATIC_DRAW);
  starColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, starColorFloat, gl.STATIC_DRAW);
}

function setupAttributes() {
  positionLocation = gl.getAttribLocation(program, "a_position");
  colorLocation = gl.getAttribLocation(program, "a_color");
}

function updateKeyboard() {
  // State-based keyboard controls for Triangle
  if (keys["ArrowLeft"]) triOffsetX -= triMoveSpeed;
  if (keys["ArrowRight"]) triOffsetX += triMoveSpeed;
  if (keys["ArrowUp"]) triOffsetY += triMoveSpeed;
  if (keys["ArrowDown"]) triOffsetY -= triMoveSpeed;
}

function updateAutoMovement() {
  // Auto bounce for Rectangle
  rectOffsetX += rectSpeedX;
  rectOffsetY += rectSpeedY;

  if (rectOffsetX > 0.9 || rectOffsetX < -0.9) rectSpeedX *= -1;
  if (rectOffsetY > 0.9 || rectOffsetY < -0.9) rectSpeedY *= -1;
}

function updateBuffers() {
  // Update Triangle
  const updatedTriVertices = new Float32Array(triangleBase.length);
  for (let i = 0; i < triangleBase.length; i += 2) {
    updatedTriVertices[i] = triangleBase[i] + triOffsetX;
    updatedTriVertices[i + 1] = triangleBase[i + 1] + triOffsetY;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, updatedTriVertices, gl.DYNAMIC_DRAW);

  // Update Rectangle
  const updatedRectVertices = new Float32Array(rectBase.length);
  for (let i = 0; i < rectBase.length; i += 2) {
    updatedRectVertices[i] = rectBase[i] + rectOffsetX;
    updatedRectVertices[i + 1] = rectBase[i + 1] + rectOffsetY;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, rectPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, updatedRectVertices, gl.DYNAMIC_DRAW);
}

function setupEvents() {
  // Keyboard Events
  window.addEventListener("keydown", (event) => {
    const controlledKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    if (controlledKeys.includes(event.key)) {
      event.preventDefault(); // Prevent scrolling
    }

    // Event-based action for reset
    if (event.key.toLowerCase() === "r" && !event.repeat) {
      triOffsetX = 0.0;
      triOffsetY = 0.0;
    }

    keys[event.key] = true;
  });

  window.addEventListener("keyup", (event) => {
    keys[event.key] = false;
  });

  // Mouse Move Event (Calculate NDC)
  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ndcX = (x / canvas.width) * 2 - 1;
    const ndcY = 1 - (y / canvas.height) * 2;

    mouseNdcDisplay.innerText = `Mouse NDC: (${ndcX.toFixed(2)}, ${ndcY.toFixed(2)})`;
  });

  // Selector for Star Draw Mode
  document.getElementById("drawMode").addEventListener("change", (e) => {
    const val = e.target.value;
    activeModeDisplay.innerText = `Draw Mode: ${val}`;

    if (val === "TRIANGLE_FAN") starDrawMode = gl.TRIANGLE_FAN;
    else if (val === "LINE_LOOP") starDrawMode = gl.LINE_LOOP;
    else if (val === "POINTS") starDrawMode = gl.POINTS;
  });
}

function drawPrimitive(positionBuffer, colorBuffer, drawMode, vertexCount) {
  // Setup Position
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Setup Color
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  // Draw
  gl.drawArrays(drawMode, 0, vertexCount);
}

function drawScene() {
  // Draw 1. Triangle
  drawPrimitive(trianglePositionBuffer, triangleColorBuffer, gl.TRIANGLES, 3);

  // Draw 2. Rectangle
  drawPrimitive(rectPositionBuffer, rectColorBuffer, gl.TRIANGLES, 6);

  // Draw 3. Procedural Star
  drawPrimitive(starPositionBuffer, starColorBuffer, starDrawMode, numPoints * 2);
}

let lastTime = 0;

function render(time) {
  // HUD update for FPS
  const deltaTime = time - lastTime;
  if (deltaTime > 0) {
    const fps = 1000 / deltaTime;
    fpsDisplay.innerText = `FPS: ${Math.round(fps)}`;
  }
  lastTime = time;

  // Update object positions
  updateKeyboard();
  updateAutoMovement();
  updateBuffers();

  // Clear and Draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawScene();

  requestAnimationFrame(render);
}

function main() {
  initializeWebGL();

  const shaders = createShaders();
  createProgram(shaders.vertexShader, shaders.fragmentShader);

  createBuffers();
  setupAttributes();

  requestAnimationFrame(render);
}

// Jalankan program
main();
