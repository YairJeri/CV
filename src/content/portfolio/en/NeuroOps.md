---
title: "NeuroOps: Distributed ML Training Platform"
description: "Distributed machine learning platform engineered around a Master-Worker (Parameter Server) architecture with Go microservices, Docker orchestration, and an Astro/Preact dashboard."
image: "../assets/NeuroOps.png"
github: "https://github.com/YairJeri/NYC-Taxi-Demand"
url: "https://YairJeri.github.io/NYC-Taxi-Demand/"
tags: ["Go", "Docker", "Distributed ML", "Astro", "Preact", "gRPC/REST"]
lang: "en"
---

### Project Overview

**NeuroOps** is a distributed machine learning platform designed to train predictive models (demonstrated on NYC taxi demand forecasting) across heterogeneous compute nodes using a Master-Worker (Parameter Server) pattern.

The platform is orchestrated via Docker, featuring high-throughput coordinator microservices written in idiomatic Go and a live telemetry dashboard built with Astro and Preact.

### Technical Highlights

- **Parameter Server Architecture**: Worker nodes compute gradients over local data partitions and asynchronously synchronize global weights with the master node.
- **Concurrent Go Services**: Low-latency backend coordination leveraging native goroutines, channels, and streaming data protocols.
- **Docker Orchestration**: Reproducible containerized cluster topology with isolated internal networks and dynamic worker scaling.
- **Cluster Telemetry Dashboard**: Real-time cluster monitoring tracking node health (CPU, RAM, network latency) and distributed training loss curves.

