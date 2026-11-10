---
title: "Asynchronous C++17 Networking Engine"
description: "Motor de red asíncrono y multihilo en C++17 moderno con modelo de transporte híbrido (TCP/UDP), serialización binaria y estructuras de datos concurrentes libres de bloqueos."
image: "../assets/NetworkLibrary.png"
github: "https://github.com/YairJeri/NetworkLibrary"
tags: ["C++17", "Asio", "Multithreading", "Networking", "TCP/UDP"]
lang: "es"
---

### Descripción del Proyecto

Un motor de comunicaciones en red asíncrono y multihilo en **C++17** construido sobre Asio. Diseñado para arquitecturas cliente-servidor de alto rendimiento y baja latencia mediante un modelo de transporte híbrido: **TCP** para sincronización confiable de estados y autenticación, y **UDP** para datagramas de alta frecuencia sin bloqueos.

### Aspectos Técnicos Destacados

- **Modelo de Transporte Híbrido**: Sesiones iniciales y control de conexión por TCP vinculadas dinámicamente con canales UDP de baja latencia mediante tokens de sesión autenticados.
- **Serialización Binaria Segura**: Sobrecarga de operadores de flujo (`<<`, `>>`) para tipos POD estándar y cadenas con prefijo de longitud, con validación estricta de límites contra desbordamiento de búfer.
- **Estructuras de Datos Thread-Safe**: Cola concurrente FIFO basada en variables de condición (`ThreadSafeQueue`) y almacenamiento asociativo protegido por mutex (`ThreadSafeMap`) para indexar sesiones de clientes sin contención.
- **I/O Asíncrono no Bloqueante**: Motor impulsado por un pool de hilos trabajadores con `asio::io_context`, aislando el ciclo de red del hilo principal de la aplicación.

