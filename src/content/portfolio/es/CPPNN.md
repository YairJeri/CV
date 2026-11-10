---
title: "CPPNN: C++ Neural Network & Vulkan Compute Engine"
description: "Motor modular de deep learning y estudio interactivo desarrollado desde cero en C++17, con aceleración por hardware mediante Vulkan Compute shaders, multithreading con Eigen y panel Dear ImGui."
image: "../assets/CPPNN.png"
github: "https://github.com/YairJeri/CPPNN"
tags: ["C++17", "Vulkan", "GLSL Compute", "Eigen", "Dear ImGui"]
lang: "es"
---

### Descripción del Proyecto

**CPPNN** implementa primitivas de deep learning y propagación hacia atrás (backpropagation) completamente desde cero, sin utilizar frameworks de alto nivel como PyTorch o TensorFlow. 

La ejecución de cómputo puede despacharse a rutinas CPU multihilo optimizadas o directamente a la GPU a través de compute shaders GLSL personalizados compilados a SPIR-V.

### Aspectos Técnicos Destacados

- **Arquitectura de Cómputo Híbrida**: Permite conmutar la ejecución de capas neuronales (Fully Connected, activaciones ReLU/Sigmoid/Softmax) entre la CPU mediante álgebra lineal matricial y la GPU a través de pipelines de Vulkan Compute.
- **Vulkan Compute Pipeline**: Despacho asíncrono de shaders de cómputo mediante buffers de almacenamiento dedicados (`VkBuffer`) y sincronización por fences y command buffers.
- **Estudio Interactivo (Dear ImGui)**: Panel de control de telemetría en tiempo real que incluye configuración de topología de red, monitoreo de curvas de pérdida/precisión, y lienzo de dibujo interactivo para inferencia de dígitos manuscritos en vivo.
- **Gestión de Memoria y Datasets**: Carga y normalización eficiente en memoria de datasets estándar como MNIST con batching dinámico.

