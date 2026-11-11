---
title: "CineGraph: Manifold Topológico y Motor de Recomendación"
description: "Plataforma interactiva de inteligencia de grafos y motor de recomendación entrenado sobre 33 millones de calificaciones de MovieLens, integrando Polars, Autoencoders en PyTorch, Truncated SVD y modularidad de Louvain."
image: "../assets/CineGraph.png"
github: "https://github.com/YairJeri/cinegraph"
url: "https://yairjeri.github.io/cinegraph/"
tags: ["Python", "PyTorch", "Polars", "Machine Learning", "Teoría de Grafos", "Preact", "Astro"]
lang: "es"
---

### Descripción del Proyecto

**CineGraph** es una plataforma integral de aprendizaje automático e inteligencia de redes diseñada para modelar, extraer y visualizar estructuras topológicas de afinidad cinematográfica sobre **33 millones de valoraciones en más de 86,000 películas** (MovieLens 32M).

Más allá de una simple lista de predicciones, el sistema combina **aprendizaje de variedades no lineales (manifold learning)** con **teoría espectral de grafos** y **filtrado colaborativo**, visualizando comunidades temáticas orgánicas en una aplicación web interactiva desplegada en GitHub Pages.

---

### Aspectos Técnicos Destacados

- **ETL Vectorizado de Alto Rendimiento (Polars)**: Limpieza y procesamiento de 33M de filas con carga mapped en memoria en cuestión de segundos, eliminando cuellos de botella de serialización.
- **Aprendizaje de Variedades No Lineales (PyTorch)**: Autoencoder profundo simétrico de 7 capas ($D_{\text{in}} \to 128 \to 64 \to 13 \to 64 \to 128 \to D_{\text{out}}$) con espacio latente de cuello de botella, logrando un **MSE de reconstrucción 23% menor** que PCA lineal ($0.041$ vs. $0.053$).
- **Detección Topológica de Comunidades (Modularidad de Louvain)**: Grafo de resonancia $k$-NN con normalización Salton Cosine que aísla 9 comunidades orgánicas ($Q = 0.45$) inmunes a la distorsión por hiper-popularidad.
- **Sistema de Recomendación Híbrido**: Arquitectura multimodelo basada en **factorización matricial Truncated SVD** ($k=50$, NDCG@10 de **0.864**, Recall@10 de **0.418**), similitud de contenido TF-IDF y centralidad personalizada por PageRank.
- **Visualizador Interactivo en Canvas 2D**: Panel web en Astro y Preact con renderizado acelerado de alta densidad de píxeles, navegación espacial fluida (zoom, pan, filtrado de aristas) y exploración instantánea del catálogo.
