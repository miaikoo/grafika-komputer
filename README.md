# Computer Graphics Showcase Hub

A centralized, interactive learning portal and showcase for **Computer Graphics (Grafika Komputer)** lab assignments and projects, built with modern web technologies, HTML5 Canvas 2D, and WebGL 2.0.

---

## Team Information — **TIM UNRENDERED**

**Course:** Computer Graphics (Grafika Komputer) — Class B  
**Department:** Informatics / Computer Science  

| Name | Student ID (NRP) | Role |
| :--- | :--- | :--- |
| **Randi Palguna Artayasa** | `5025231020` | Team Member |
| **Hikmia Sofia Nur Izzati** | `5025231147` | Team Member |

---

## Overview & Key Features

This repository contains both the **Showcase Dashboard Hub** and individual weekly practicum projects:

- **Unified Showcase Hub (`index.html`)**:
  - Sleek dark-mode interface powered by vanilla CSS & modern glassmorphism aesthetics.
  - Dynamic module cards generated programmatically from (`js/data.js`).
  - Seamless in-app iframe viewer to preview and test each practicum project without leaving the dashboard.
  - Interactive sidebar navigation with Phosphor Icons.

---

## Practicum Modules

### [Praktikum 01: Graphics Playground (HTML5 Canvas 2D)](praktikum-grafika-p1)
An interactive 2D graphics canvas exploring coordinate transformations, primitive rendering, animation loops, and event handling.

- **Key Highlights & Completed Challenges:**
  - **Challenge A — Bouncing Object:** Autonomous animated shapes with edge collision detection and bounce physics.
  - **Challenge C — Click to Change Color:** Dynamic color palette cycling upon user click interaction.
  - **Challenge D — Keyboard Movement:** Responsive object translation controlled via arrow / WASD keyboard inputs.
  - **Challenge E — Mouse Coordinate Tracking:** Real-time pointer position mapping on the canvas space.
  - **Trail Mode:** Visual movement trail effects using alpha blend clearing.

---

### [Praktikum 02: WebGL Fundamentals & Primitives (WebGL2)](praktikum-webgl-02)
Introduction to low-level graphics programming using **WebGL2** and **GLSL ES 3.00** shader pipelines.

- **Key Highlights & Features:**
  - **Custom Shader Pipeline:** Vertex and Fragment shaders compiled and linked on GPU using modern WebGL2 VAOs (Vertex Array Objects) and VBOs.
  - **Interpolated Colorful Triangle:** Per-vertex RGB color interpolation with interactive keyboard-based translation controls.
  - **Dynamic Bouncing Rectangle:** Two-triangle solid primitive with screen-boundary collision detection.
  - **Procedural 10-Point Star:** Algorithmic vertex generation calculating inner and outer radii with configurable draw modes:
    - `TRIANGLE_FAN` (Filled star geometry)
    - `LINE_LOOP` (Star wireframe outline)
    - `POINTS` (Vertex points rendering)
  - **Real-time Diagnostic HUD:**
    - Live **FPS (Frames Per Second)** performance monitor.
    - **Mouse NDC Display:** Live conversion from canvas screen pixels to Normalized Device Coordinates `[-1.0, 1.0]`.
    - Active primitive count and draw mode indicator.

---

### [Praktikum 03: Interactive Transformation Playground (WebGL2)](praktikum-webgl-03)
Moving, rotating, and resizing objects purely through a 3×3 **Model Matrix** passed to the vertex shader as a `mat3` uniform — the original vertex data is never modified.

- **Key Highlights & Features:**
  - **Matrix-Driven Rendering:** Geometry stays in local coordinates inside one static GPU buffer; Object A and Object B reuse the same vertex buffer and differ only by their Model Matrix.
  - **Complete Transform Set:** Translation, rotation, uniform and non-uniform scaling, composed through matrix multiplication in homogeneous coordinates.
  - **Interactive & Automatic Motion:** Object A uses state-based keyboard input scaled by `deltaTime`; Object B self-rotates with a sinusoidal pulsing scale.
  - **Transform Order Comparison:** `T × R × S` (spins in place) versus `R × T × S` (orbits the world origin), built from identical parameters.
  - **Visual Reference & HUD:** X/Y axes and world origin drawn under an identity matrix, with a live readout of position, rotation, scale, and active transform order.
  - **Completed Optional Challenges:** Reset transform (`R`) and toggle transform order (`T`).

- **Controls:** `Arrow Keys` translate · `Q` / `E` rotate · `+` / `-` uniform scale · `Z` / `X` scale X · `C` / `V` scale Y · `R` reset · `T` toggle order

---

## Project Structure

```text
2026 Grafika Komputer/
├── index.html                  # Main showcase dashboard
├── css/                        # Dashboard stylesheets
│   ├── components.css
│   ├── layout.css
│   └── style.css
├── js/                         # Dashboard logic & module configuration
│   ├── data.js                 # Practicum metadata registry
│   └── main.js                 # Dashboard renderer & iframe controller
├── praktikum-grafika-p1/       # Practicum 01: HTML5 Canvas 2D
├── praktikum-webgl-02/         # Practicum 02: WebGL2 Fundamentals
├── praktikum-webgl-03/         # Practicum 03: Transformation & Coordinate System
└── README.md
```

---

## Built With

- **HTML5 & Vanilla CSS3** — Responsive layout, CSS variables, flexbox/grid, and modern glassmorphic styling.
- **JavaScript (ES6+)** — Modular DOM manipulation, animation loops (`requestAnimationFrame`), and event handling.
- **HTML5 Canvas 2D Context** — Immediate mode 2D graphics rendering.
- **WebGL 2.0 & GLSL ES 3.00** — Hardware-accelerated GPU pipeline, buffers, shaders, attributes, and matrix uniforms.
- **[Phosphor Icons](https://phosphoricons.com/)** — Crisp and versatile icon library.
- **[Inter Font](https://fonts.google.com/specimen/Inter)** — Typography by Rasmus Andersson.

---

## 📄 License

This repository is maintained for educational purposes as part of the Computer Graphics course coursework.