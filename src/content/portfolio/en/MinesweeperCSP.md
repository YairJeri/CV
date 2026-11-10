---
title: "Autonomous Minesweeper AI & Computer Vision Engine"
description: "High-performance autonomous Minesweeper solver in C++17, leveraging real-time OpenCV perception and exact constraint satisfaction (CSP) with Bayesian probability inference."
image: "../assets/MinesweeperCSP.png"
github: "https://github.com/YairJeri/minesweeper-csp"
tags: ["C++17", "OpenCV", "CSP", "Bayesian Inference", "ImGui"]
lang: "en"
---

### Project Overview

An autonomous, high-performance Minesweeper solver written in **C++17**, leveraging **OpenCV** for non-invasive real-time screen perception and **Dear ImGui (OpenGL)** for interactive telemetry overlays.

The core algorithm models the game as a **Constraint Satisfaction Problem (CSP)** with exact **Bayesian probability inference** powered by Dynamic Programming and combinatorial reduction, paired with a heuristic **chording click-efficiency optimizer**.

### Technical Highlights

- **Deterministic Subset Reductions**: Resolves unambiguous safe cells and mines directly via subset difference reductions without expensive backtracking.
- **Connected Component Decomposition**: Partitions active frontiers into isolated subproblems using graph BFS traversal, avoiding combinatorial state explosion.
- **Prefix/Suffix Dynamic Programming**: Aggregates disjoint component combinations with interior cells using combinatorial convolution ($n\text{C}r$), yielding mathematically exact mine probabilities.
- **Chording Efficiency Optimizer**: Strategically places tactical flags if and only if doing so minimizes the overall physical click action count.
- **High-Rate Vision Pipeline**: Multi-scale template matching with frame-to-frame diff caching for non-invasive perception at 120+ FPS.

