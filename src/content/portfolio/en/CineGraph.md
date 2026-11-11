---
title: "CineGraph: Topological Manifold & Recommendation Engine"
description: "End-to-end recommendation engine and interactive topological graph platform built over 33 million ratings across the MovieLens dataset using Polars, PyTorch Autoencoders, Truncated SVD, and Louvain modularity."
image: "../assets/CineGraph.png"
github: "https://github.com/YairJeri/cinegraph"
url: "https://yairjeri.github.io/cinegraph/"
tags: ["Python", "PyTorch", "Polars", "Machine Learning", "Graph Theory", "Preact", "Astro"]
lang: "en"
---

### Project Overview

**CineGraph** is a full-scale machine learning and network intelligence platform designed to mine, model, and visualize high-dimensional taste structures from **33 million ratings across 86,000+ movies** (MovieLens 32M).

Rather than treating recommendation as a black-box ranking problem, CineGraph couples **nonlinear manifold learning** with **spectral graph theory** and **collaborative filtering**, surfacing organic thematic clusters on an interactive 2D Canvas application deployed live to GitHub Pages.

---

### Technical Highlights

- **Vectorized High-Throughput ETL (Polars)**: Streamlined memory-mapped data ingestion and rating matrix construction capable of processing 33M interactions in seconds with zero IPC bottleneck.
- **Deep Manifold Learning (PyTorch)**: Engineered a 7-layer symmetric Bottleneck Autoencoder ($D_{\text{in}} \to 128 \to 64 \to 13 \to 64 \to 128 \to D_{\text{out}}$) capturing latent nonlinear user preferences with **23% lower reconstruction MSE** compared to traditional linear PCA ($0.041$ vs. $0.053$).
- **Topological Community Extraction (Louvain Modularity)**: Constructed a $k$-NN item graph with Salton Cosine normalization, isolating 9 organic cinema communities ($Q = 0.45$) completely free of popularity-hub distortion.
- **Hybrid Multi-System Recommender**: Deployed a multi-tiered recommender pipeline combining **Truncated SVD matrix factorization** ($k=50$, NDCG@10 of **0.864**, Recall@10 of **0.418**), Content-based TF-IDF cosine similarity, and personalized PageRank anchor pivoting.
- **Interactive High-DPI Canvas Dashboard**: Custom-built Astro + Preact visualization dashboard featuring real-time spatial graph traversal, dynamic community heatmaps, and zero-latency catalog exploration.
