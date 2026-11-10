---
title: "CPPNN: C++ Neural Network & Vulkan Compute Engine"
description: "A modular deep learning engine and interactive studio written in C++17 from scratch, featuring hardware acceleration via Vulkan Compute shaders, Eigen multithreading, and a Dear ImGui dashboard."
image: "../assets/CPPNN.png"
github: "https://github.com/YairJeri/CPPNN"
tags: ["C++17", "Vulkan", "GLSL Compute", "Eigen", "Dear ImGui"]
lang: "en"
---

### Project Overview

**CPPNN** implements deep learning primitives and backpropagation completely from scratch without high-level machine learning frameworks like PyTorch or TensorFlow.

Computation can be dispatched either to multi-threaded CPU routines or directly to the GPU via custom GLSL compute shaders compiled to SPIR-V bytecode.

### Technical Highlights

- **Hybrid Compute Pipeline**: Seamlessly toggles neural layer execution (Fully Connected, ReLU/Sigmoid/Softmax activations) between CPU vector operations and GPU hardware acceleration via Vulkan Compute pipelines.
- **Vulkan Compute Pipeline**: Asynchronous compute shader dispatch using dedicated storage buffers (`VkBuffer`), descriptor sets, and pipeline fences.
- **Interactive Telemetry Studio (Dear ImGui)**: Real-time metrics dashboard featuring architecture configuration, loss/accuracy curves, and an interactive drawing canvas for live handwritten digit classification.
- **Zero Framework Dependency**: Core tensor math and gradient updates implemented directly in modern C++17.

