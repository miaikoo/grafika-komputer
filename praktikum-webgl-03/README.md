# Praktikum 03 — Interactive Transformation Playground

## Identitas Kelompok

Kelompok: 9

| No | Nama | NRP |
|----|------|-----|
| 1  | RANDI PALGUNA ARTAYASA  | 5025231020 |
| 2  | HIKMIA SOFIA NUR IZZATI  | 5025231147 |

## Deskripsi Aplikasi

Aplikasi WebGL2 sederhana yang menerapkan translation, rotation, uniform scaling, dan non-uniform scaling memakai Model Matrix 3×3. Ada dua object (Object A dan Object B) yang memakai geometry/vertex buffer yang sama, hanya beda Model Matrix.

- Object A — dikontrol lewat keyboard.
- Object B — animasi otomatis (rotasi + scaling).

## Kontrol

| Tombol | Fungsi |
|--------|--------|
| Arrow Keys | Translation |
| Q / E | Rotation |
| + / − | Uniform scale |
| Z / X | Scale X |
| C / V | Scale Y |
| R | Reset transform |
| T | Toggle transform order |

## Transform Order yang Dibandingkan

1. **T × R × S** — Scale → Rotate → Translate. Object berputar di tempat.
2. **R × T × S** — Scale → Translate → Rotate. Object mengorbit origin (0,0).

Tekan `T` untuk berganti order dan lihat perbedaannya.

## Fitur Pilihan yang Dikerjakan

- Reset transform (tombol R)
- Toggle transform order (tombol T)

## Cara Menjalankan

Karena `main.js` pakai ES module, harus dijalankan lewat local server.

```bash
cd praktikum-03
http-server
```

Buka `http://localhost:8000` di browser.

## Video Demo

Link: [https://youtu.be/A-hdsZOyrJE](https://youtu.be/A-hdsZOyrJE)
