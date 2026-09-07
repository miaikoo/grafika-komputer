/*
Praktikum Grafika Komputer - Pertemuan 1
Graphics Playground

Nama Anggota 1 : Randi Palguna Artayasa
NRP Anggota 1  : 5025231020
Nama Anggota 2 : Hikmia Sofia Nur Izzati
NRP Anggota 2  : 5025231147
Kelas: B

Challenge:
- Challenge A — Bouncing Object
- Challenge C — Click to Change Color
- Challenge D — Keyboard Movement
- Challenge E — Mouse Coordinate
- Trail Mode
*/


const canvas = document.getElementById("graphicsCanvas");
const ctx = canvas.getContext("2d");

// =========== Data ===========
const colors = [
    "#4285F4",
    "#EA4335",
    "#FBBC05",
    "#34A853",
    "#5F6368"
];

let colorIndex = 0

const rectangle = {
    x: 300,
    y: 80,
    width: 200,
    height: 100,
    color: "#3498db"
};

const circle = {
  x: 400,
  y: 250,
  radius: 100,
  start_angle: 0,
  end_angle: Math.PI * 2,
  color: colors[1]
}

const line = {
  x1: 40,
  y1: 80,
  x2: 180,
  y2: 150,
  linewidth: 5,
  color: colors[2]
}

const triangle = {
    x1: 190, y1: 300,
    x2: 50, y2: 400,
    x3: 300, y3: 430,
    lineWidth: 2,
    color: colors[3],
}

const movingBall = {
    x: 350,
    y: 300,
    radius: 25,
    speedX: 5,
    speedY: 5,
    color: colors[4]
};

const player = {
    x: 600,
    y: 350,
    width: 50,
    height: 50,
    speed: 5,
    color: colors[2]
};

const mouse = {
    x: 0,
    y: 0
};

const keys = {};

let trailMode = false

// =========== Draw Function ===========
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawRectangle() {
    ctx.fillStyle = rectangle.color;
    ctx.fillRect(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height,
    );
}

function drawCircle() {
    ctx.beginPath();

    ctx.arc(
        circle.x,
        circle.y,
        circle.radius,
        circle.start_angle,
        circle.end_angle
    );

    ctx.fillStyle = circle.color;
    ctx.fill();
}

function drawLine() {
    ctx.beginPath();

    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);

    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.linewidth;

    ctx.stroke();
}

function drawTriangle() {
    ctx.beginPath();

    ctx.moveTo(triangle.x1, triangle.y1);
    ctx.lineTo(triangle.x2, triangle.y2);
    ctx.lineTo(triangle.x3, triangle.y3);

    ctx.closePath();

    ctx.fillStyle = triangle.color;
    ctx.fill();

    ctx.strokeStyle = colors[4];
    ctx.lineWidth = triangle.lineWidth;
    ctx.stroke();
}

function drawMovingBall() {
    ctx.beginPath();

    ctx.arc(
        movingBall.x,
        movingBall.y,
        movingBall.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = movingBall.color;
    ctx.fill();
}

function drawPlayer() {
    ctx.fillStyle = player.color;

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
}

function drawMouseCoordinate() {
    ctx.fillStyle = "#222";
    ctx.font = "16px Arial";

    ctx.fillText(
        `Mouse: (${Math.round(mouse.x)}, ${Math.round(mouse.y)})`,
        20,
        30
    );
}

// =========== Update Function ===========
function updateBall() {
  movingBall.x += movingBall.speedX;
  movingBall.y += movingBall.speedY;

  if (
    movingBall.x + movingBall.radius >= canvas.width ||
    movingBall.x - movingBall.radius <= 0
  ) {
    movingBall.speedX *= -1;
  }

  if (
      movingBall.y + movingBall.radius >= canvas.height ||
      movingBall.y - movingBall.radius <= 0
  ) {
      movingBall.speedY *= -1;
  }
}

function updatePlayer() {
    player.x = Math.max(
        0, Math.min(canvas.width - player.width, player.x)
    );

    player.y = Math.max(
        0,
        Math.min(
            canvas.height - player.height,
            player.y
        )
    );

    if (keys["a"]) {
        player.x -= player.speed;
    }

    if (keys["d"]) {
        player.x += player.speed;
    }

    if (keys["w"]) {
        player.y -= player.speed;
    }

    if (keys["s"]) {
        player.y += player.speed;
    }
}

// =========== Helper Function ===========
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =========== Event Listener ===========
// State-based keyboard ===========
window.addEventListener("keydown", function(event) {
    const controlledKeys = [
        "w",
        "s",
        "a",
        "d"
    ];

    if (controlledKeys.includes(event.key)) {
      event.preventDefault()
    }

    keys[event.key] = true;
});

window.addEventListener("keyup", function(event) {
  keys[event.key] = false;
});


// Event-based keyboard ===========
window.addEventListener("keydown", function(event) {
    const controlledKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown"
    ];

    if (controlledKeys.includes(event.key)) {
      event.preventDefault()
    }

    if (event.key === "ArrowLeft") {
        player.x -= player.speed;
    }
    if (event.key === "ArrowRight") {
        player.x += player.speed;
    }
    if (event.key === "ArrowUp") {
        player.y -= player.speed;
    }
    if (event.key === "ArrowDown") {
        player.y += player.speed;
    }

    if (event.key === "c") {
        colorIndex = (colorIndex + 1) % colors.length;
        player.color = colors[colorIndex];
    }

    if (event.key === "r") {
    rectangle.x = getRandomInt(
        0,
        canvas.width - rectangle.width
    );

    rectangle.y = getRandomInt(
        0,
        canvas.height - rectangle.height
    );

    circle.x = getRandomInt(
        circle.radius,
        canvas.width - circle.radius
    );

    circle.y = getRandomInt(
        circle.radius,
        canvas.height - circle.radius
    );

    line.x1 = getRandomInt(0, canvas.width);
    line.y1 = getRandomInt(0, canvas.height);
    line.x2 = getRandomInt(0, canvas.width);
    line.y2 = getRandomInt(0, canvas.height);

    triangle.x1 = getRandomInt(0, canvas.width);
    triangle.y1 = getRandomInt(0, canvas.height);

    triangle.x2 = getRandomInt(0, canvas.width);
    triangle.y2 = getRandomInt(0, canvas.height);

    triangle.x3 = getRandomInt(0, canvas.width);
    triangle.y3 = getRandomInt(0, canvas.height);

    movingBall.x = getRandomInt(
        movingBall.radius,
        canvas.width - movingBall.radius
    );

    movingBall.y = getRandomInt(
        movingBall.radius,
        canvas.height - movingBall.radius
    );

    player.x = getRandomInt(
        0,
        canvas.width - player.width
    );

    player.y = getRandomInt(
        0,
        canvas.height - player.height
    );
    }

    if (event.key === "t") {
        if (trailMode == false) {
            trailMode = true
        } else {
            trailMode = false
        }
    }
});

canvas.addEventListener("click", function() {
  colorIndex = (colorIndex + 1) % colors.length;
  movingBall.color = colors[colorIndex];
  player.color = colors[colorIndex];
  rectangle.color = colors[(colorIndex + 1) % colors.length]
  line.color = colors[(colorIndex + 2) % colors.length]
  triangle.color = colors[(colorIndex + 3) % colors.length]
  circle.color = colors[(colorIndex + 4) % colors.length]
});

canvas.addEventListener("mousemove", function(event) {
  const rect = canvas.getBoundingClientRect();

  mouse.x = 
    (event.clientX - rect.left) * (canvas.width / rect.width)

  mouse.y =
    (event.clientY - rect.top) * (canvas.height / rect.height);
});

// =========== Animate Function and Call ===========
function animate() {
    if (trailMode == false) {
        clearCanvas();
    }

    updateBall();
    updatePlayer();

    drawLine()
    drawRectangle()
    drawCircle()
    drawTriangle()
    drawMouseCoordinate();
    drawPlayer();
    drawMovingBall();


    requestAnimationFrame(animate);
}

animate()