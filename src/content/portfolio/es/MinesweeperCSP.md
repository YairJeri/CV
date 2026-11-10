---
title: "Autonomous Minesweeper AI & Computer Vision Engine"
description: "Solucionador autónomo de alto rendimiento en C++17, con percepción de pantalla en tiempo real mediante OpenCV y resolución exacta por satisfacción de restricciones (CSP) e inferencia bayesiana."
image: "../assets/MinesweeperCSP.png"
github: "https://github.com/YairJeri/minesweeper-csp"
tags: ["C++17", "OpenCV", "CSP", "Bayesian Inference", "ImGui"]
lang: "es"
---

### Descripción del Proyecto

Un agente autónomo en tiempo real para el juego Buscaminas programado en **C++17**, combinando visión artificial no invasiva (**OpenCV**) con modelado formal como **Problema de Satisfacción de Restricciones (CSP)** e **inferencia de probabilidad bayesiana exacta**.

### Aspectos Técnicos Destacados

- **Reducciones Deterministas de Frontera**: Análisis de diferencias de subconjuntos e intersecciones algebraicas para identificar celdas seguras y minas sin necesidad de ramificación exponencial.
- **Descomposición en Componentes Conexas**: Mediante recorridos BFS particiona la frontera activa en clusters disjuntos e independientes, mitigando la explosión combinatoria.
- **Inferencia Bayesiana Exacta con Programación Dinámica**: Convoluciona las combinaciones posibles de componentes disjuntos con las celdas interiores no reveladas, calculando probabilidades exactas a priori y a posteriori para cada casilla.
- **Optimizador de Clics (Chording)**: Evalúa aperturas por chording frente a clics individuales y coloca banderas tácticas únicamente cuando reducen la cantidad total de acciones requeridas.
- **Pipeline de Visión por Computadora**: Template matching multiescala y clasificador de luminancia/color con caché diferencial entre fotogramas para detección a 120+ FPS.

