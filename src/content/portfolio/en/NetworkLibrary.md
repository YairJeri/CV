---
title: "Asynchronous C++17 Networking Engine"
description: "High-performance asynchronous multithreaded networking engine in C++17 featuring a hybrid TCP/UDP transport architecture, binary serialization, and thread-safe data structures."
image: "../assets/NetworkLibrary.png"
github: "https://github.com/YairJeri/NetworkLibrary"
tags: ["C++17", "Asio", "Multithreading", "Networking", "TCP/UDP"]
lang: "en"
---

### Project Overview

A lightweight, asynchronous multithreaded networking engine built in modern **C++17** with Asio. Designed for low-latency client-server architectures supporting a hybrid transport model: **TCP** for reliable handshakes, session management, and state sync; and **UDP** for rapid, unchoked datagram exchange.

### Technical Highlights

- **Hybrid Transport Architecture**: Associates low-overhead UDP datagram endpoints to active TCP sessions through an initial cryptographic handshake.
- **Binary Serialization**: Stream operators (`<<`, `>>`) for standard layout POD types and length-prefixed strings with strict boundary validation against buffer underflow and malformed packets.
- **Thread-Safe Data Structures**: Condition variable-backed concurrent FIFO queue (`ThreadSafeQueue`) and mutex-guarded associative storage (`ThreadSafeMap`) for managing client sessions across worker threads.
- **Asynchronous I/O Engine**: Driven by `asio::io_context` worker threads to avoid blocking caller threads or game/simulation loops.

