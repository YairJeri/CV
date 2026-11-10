---
title: "Flow Field 2D Tower Defense Engine"
description: "High-performance 2D game engine simulating hundreds of concurrent entities using asynchronous flow field pathfinding via Web Workers, spatial partitioning, and object pooling."
image: "../assets/TowerDefense.png"
github: "https://github.com/YairJeri/phaser-game-towerdefense"
url: "https://yairjeri.github.io/phaser-game-towerdefense/"
tags: ["JavaScript", "Web Workers", "Spatial Hash", "WebGL", "Algorithms"]
lang: "en"
---

### Project Overview

A high-performance 2D Tower Defense game engine built with vanilla JavaScript (ES6+), WebGL shaders, and Phaser 3. 

Rather than relying purely on generic physics libraries, this project implements computer science architectures designed to simulate hundreds of concurrent entities smoothly: **asynchronous flow field pathfinding via Web Workers**, **spatial partitioning**, **custom memory pooling**, and **custom GLSL post-processing pipelines**.

### Technical Highlights

- **Asynchronous Flow Field Pathfinding**: Pathfinding computations are delegated to a dedicated background Web Worker executing a multi-target Breadth-First Search (BFS) over a grid graph, keeping the main render thread at an unblocked 60 FPS.
- **TypedArray Vector Smoothing**: Uses flat `Uint16Array` and `Float32Array` buffers to store vector directions and cost fields, smoothed with bilinear sampling to eliminate jittering.
- **Spatial Hash Grid**: Reduces proximity searches and projectile targeting checks from $O(N^2)$ to amortized $O(1)$.
- **Zero-Allocation Object Pooling**: Pre-allocates sprites and reuses inactive instances to completely eliminate Garbage Collection (GC) latency spikes.

