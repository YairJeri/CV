---
title: "NeuroOps: Distributed ML Training Platform"
description: "Plataforma de machine learning distribuido con arquitectura Master-Worker (Parameter Server), microservicios en Go, orquestación con Docker y panel de telemetría en Astro y Preact."
image: "../assets/NeuroOps.png"
github: "https://github.com/YairJeri/NYC-Taxi-Demand"
url: "https://YairJeri.github.io/NYC-Taxi-Demand/"
tags: ["Go", "Docker", "Distributed ML", "Astro", "Preact", "gRPC/REST"]
lang: "es"
---

### Descripción del Proyecto

**NeuroOps** es una plataforma de machine learning distribuido diseñada para entrenar modelos predictivos (demostrado en pronóstico de demanda de taxis de Nueva York) a través de nodos de cómputo heterogéneos mediante un esquema Master-Worker (Parameter Server).

El ecosistema completo está orquestado mediante Docker, con servicios de coordinación en Go y una interfaz reactiva de telemetría y monitoreo construida con Astro y Preact.

### Aspectos Técnicos Destacados

- **Arquitectura de Servidor de Parámetros**: Nodos de entrenamiento que calculan gradientes en particiones locales y sincronizan periódicamente pesos globales con el nodo maestro.
- **Microservicios en Go**: Servicios backend concurrentes de baja latencia con goroutines, channels y comunicación eficiente por streaming.
- **Orquestación en Contenedores**: Despliegue reproducible con redes internas aisladas y escalado dinámico de nodos worker mediante Docker Compose.
- **Monitoreo en Tiempo Real**: Panel de control con métricas de salud de nodos (CPU, memoria, latencia de sincronización) y curvas de pérdida en vivo.

