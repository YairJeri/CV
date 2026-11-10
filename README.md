# Personal Portfolio & Algorithms Laboratory — Yair Jeri

Interactive portfolio, curriculum vitae, and computer science laboratory built with **Astro 7**, **Preact**, and **TailwindCSS 4**.

- **Live Deployment:** [https://yairjeri.github.io/CV](https://yairjeri.github.io/CV)
- **Author:** Guido Yair Abel Jeri Saldaña ([@YairJeri](https://github.com/YairJeri))

---

## Overview

A fast, content-driven portfolio presenting engineering projects, interactive algorithms, and a complete bilingual curriculum vitae with verified credentials.

- **Interactive Playground / Laboratories:**
  - **Sorting Lab:** Bubble, Selection, Insertion, Merge, Quick, and Heap Sort with step-by-step visual metrics, comparison tracking, and speed controls.
  - **Graph & Pathfinding Lab:** Grid-based BFS, DFS, Dijkstra, A*, Greedy BFS, and Bidirectional BFS paired with procedural maze generators (Recursive Backtracker, Prim's).
  - **Physics Lab:** Verlet integration cloth simulation, Warren truss bridge stress analysis, rigid body collisions, and spatial hashing.
  - **Automata Lab:** Conway's Game of Life with sparse hash grids and classic pattern presets (Glider Gun, Pulsar, Acorn).
- **Featured Projects Showcase:** Deep-dive case studies covering deep learning engines (CPPNN with Vulkan Compute), distributed systems (NeuroOps in Go), autonomous game solvers (Minesweeper CSP), asynchronous network engines, and spatial simulation engines.
- **Bilingual CV & PDF Generation:** Built-in routes for English (`/en/cv`) and Spanish (`/es/cv`) with downloadable single-page resumes and full-page landscape certificate attachments.

---

## Tech Stack

- **Framework:** [Astro 7](https://astro.build/) (Static Site Generation & Content Collections)
- **UI Components:** [Preact](https://preactjs.com/) (Lightweight interactive islands)
- **Styling:** [TailwindCSS 4](https://tailwindcss.com/)
- **PDF Engine:** Pure Node.js script using `jspdf` for build-time generation
- **CI/CD Deployment:** Automated GitHub Actions workflow to GitHub Pages

---

## Getting Started

### Prerequisites

Node.js 22 or higher and `npm` or `pnpm`.

### Installation

```bash
git clone https://github.com/YairJeri/CV_Website.git
cd CV_Website
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:4321/CV/` in your browser.

### Build & Static Generation

```bash
npm run build
```

This compiles static routes, optimizes images, and generates output in `./dist`.

---

## License

This project is open-source under the [MIT License](LICENSE).
