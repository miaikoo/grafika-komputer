# Praktikum 04: Camera, Projection & 3D Depth

This project explores the core camera pipeline in WebGL 2.0 by rendering a 3D cube scene with a movable camera, adjustable projection, and depth testing.

## Team

Kelompok: 9

| No | Nama | NRP |
|----|------|-----|
| 1  | RANDI PALGUNA ARTAYASA  | 5025231020 |
| 2  | HIKMIA SOFIA NUR IZZATI  | 5025231147 |

## Overview

The application demonstrates how a 3D object is transformed through the graphics pipeline:

- model transform for the cube
- view transform using camera position and `lookAt`
- projection transform using perspective or orthographic settings
- depth testing for proper visible surface rendering

## Features

- Rotating 3D cube with colorful face materials
- Perspective and orthographic projection switching
- Adjustable field of view (FOV)
- Near/far clipping presets
- Keyboard-driven camera movement
- Depth test toggle
- HUD showing current camera, projection, and clipping information

## Controls

- Arrow keys: move camera in X/Y
- W / S: move camera in Z
- Page Up / Page Down: adjust camera height
- P: toggle projection mode
- [ / ]: adjust FOV
- 1 / 2 / 3: select FOV preset
- N: cycle clipping presets
- D: toggle depth test
- R: reset scene

## Files

- `index.html`: page structure and HUD layout
- `main.js`: WebGL rendering logic, camera controls, and animation loop
- `math3d.js`: custom 3D math utilities for matrix and vector operations
- `style.css`: visual styling for the app

## Notes

This practicum is intended to help visualize how camera positioning and projection parameters affect the appearance of 3D scenes in WebGL.
