---
title: "Flow Field 2D Tower Defense Engine"
description: "Motor de juego 2D de alto rendimiento con simulación de cientos de entidades mediante pathfinding de campos de flujo en Web Workers, particionamiento espacial y pooling de memoria."
image: "../assets/TowerDefense.png"
github: "https://github.com/YairJeri/phaser-game-towerdefense"
url: "https://yairjeri.github.io/phaser-game-towerdefense/"
tags: ["JavaScript", "Web Workers", "Spatial Hash", "WebGL", "Algorithms"]
lang: "es"
---

### Descripción del Proyecto

Un juego y motor de Tower Defense en 2D desarrollado con JavaScript moderno (ES6+), WebGL y Phaser 3. 

En lugar de delegar la simulación en motores de física genéricos, el proyecto implementa sistemas de bajo nivel orientados a rendimiento para simular cientos de unidades concurrentes sin caídas de cuadros.

### Aspectos Técnicos Destacados

- **Pathfinding Asíncrono por Campos de Flujo (Flow Field)**: Los cálculos de rutas globales se delegan a un Web Worker en segundo plano que ejecuta un BFS multiobjetivo sobre una cuadrícula, manteniendo el bucle principal a 60 FPS estables incluso durante la colocación dinámica de torres.
- **Vectores con TypedArrays**: Emplea arreglos planos tipados (`Uint16Array` y `Float32Array`) con muestreo bilineal para interpolar direcciones vectoriales suaves sin microtirones.
- **Particionamiento Espacial (Spatial Hash Grid)**: Cuadrícula de dispersión espacial 2D personalizada que reduce la verificación de colisiones y proximidad de $O(N^2)$ a $O(1)$ amortizado.
- **Gestión de Memoria y Object Pooling**: Preasigna instancias de entidades y proyectiles para eliminar por completo pausas por Garbage Collection (GC) en oleadas intensas.

