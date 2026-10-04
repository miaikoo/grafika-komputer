# Computer Graphics Showcase Hub

A centralized, interactive learning portal and showcase for **Computer Graphics (Grafika Komputer)** lab assignments and projects, built with modern web technologies, HTML5 Canvas 2D, and WebGL 2.0.

---

## Team Information — **TIM UNRENDERED**

**Course:** Computer Graphics (Grafika Komputer) — Class B  
**Department:** Informatics / Computer Science

| Name                        | Student ID (NRP) | Role        |
| :-------------------------- | :--------------- | :---------- |
| **Randi Palguna Artayasa**  | `5025231020`     | Team Member |
| **Hikmia Sofia Nur Izzati** | `5025231147`     | Team Member |

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

### [Praktikum 04: Camera, Projection & 3D Depth (WebGL2)](praktikum-camera-04)

Exploring the 3D camera pipeline by rendering a rotating cube with perspective and orthographic projection modes, adjustable camera position, and live rendering metrics.

- **Key Highlights & Features:**
  - **Camera Transform:** Real-time camera movement using a `lookAt` view matrix with keyboard-driven position updates.
  - **Projection Modes:** Toggle between perspective and orthographic projection to compare visual behavior directly.
  - **FOV & Clipping Control:** Adjust field of view, switch among preset values, and cycle near/far clipping planes.
  - **Depth Testing:** Enable or disable `gl.DEPTH_TEST` to see how hidden-surface removal affects the scene.
  - **3D Cube Scene:** Multiple cubes rendered in the same view space with independent local transforms and animated rotation.
  - **Interactive HUD:** Live display of projection type, camera coordinates, FOV angle, clipping values, and depth test status.

- **Controls:** `Arrow Keys` move camera X/Y · `W` / `S` move camera Z · `PageUp` / `PageDown` adjust camera height · `P` toggle projection · `[` / `]` adjust FOV · `1` / `2` / `3` FOV presets · `N` cycle clipping preset · `D` toggle depth test · `R` reset scene

---

### [Praktikum 05: Lighting, Shading & Texture (WebGL2)](praktikum-lighting-texture-05)

A rotating textured cube lit with the Phong reflection model (ambient, diffuse, specular), with interactive control over the light, the material, and the texture sampling settings.

- **Key Highlights & Features:**
  - **Phong Lighting:** Toggle ambient, diffuse, and specular components to compare Ambient Only, Diffuse Only, Specular Only, Ambient + Diffuse, and All Components.
  - **Movable Light & Shininess:** Move the point light in X/Y/Z, choose an ambient strength of 0, 0.2, or 0.5, and set shininess from 2 to 128.
  - **Procedural Texture:** A 64×64 checkerboard generated on a canvas and sampled in the fragment shader.
  - **Filtering & Wrapping:** Switch between `LINEAR` and `NEAREST` filtering, cycle `REPEAT` / `CLAMP_TO_EDGE` / `MIRRORED_REPEAT`, and set the UV scale from 0.25 to 5.
  - **Normal Matrix Comparison:** Toggle flat/smooth shading and non-uniform scale, and compare the correct normal matrix with the plain model 3×3.
  - **Completed Challenges:** An unlit marker cube at the light position, and UV scrolling.

- **Controls:** `Arrow Keys` move light X/Y · `W` / `S` move light Z · `-` / `+` shininess · `T` toggle filtering · `G` cycle wrapping · `[` / `]` UV scale · `F` flat/smooth · `N` non-uniform scale · `M` normal matrix on/off · `P` pause rotation · `R` reset

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
├── praktikum-camera-04/        # Practicum 04: Camera, Projection & Depth
├── praktikum-lighting-texture-05/ # Practicum 05: Lighting, Shading & Texture
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
