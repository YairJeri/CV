export type PlaygroundLang = 'en' | 'es';

export interface PlaygroundTranslations {
  tabs: {
    sorting: { label: string; number: string };
    graph: { label: string; number: string };
    physics: { label: string; number: string };
    automata: { label: string; number: string };
  };
  activeEngine: string;
  sorting: {
    labBadge: string;
    labTitle: string;
    primaryAlgo: string;
    dualComparison: string;
    secondaryAlgo: string;
    arraySize: string;
    elements: string;
    speed: string;
    play: string;
    pause: string;
    stepForward: string;
    stepBackward: string;
    reset: string;
    shuffle: string;
    nearlySorted: string;
    reversed: string;
    fewUnique: string;
    comparisons: string;
    swaps: string;
    writes: string;
    time: string;
    status: string;
    running: string;
    completed: string;
    ready: string;
    pivot: string;
    comparing: string;
    swapping: string;
    sorted: string;
    inspectorTitle: string;
  };
  graph: {
    labBadge: string;
    labTitle: string;
    modeGrid: string;
    modeNetwork: string;
    primaryAlgo: string;
    dualComparison: string;
    secondaryAlgo: string;
    drawingBrush: string;
    mazeGeneration: string;
    speed: string;
    runSearch: string;
    clearPath: string;
    resetGrid: string;
    theoryAlgo: string;
    runGraphAlgo: string;
    canvasHelpTitle: string;
    canvasHelp1: string;
    canvasHelp2: string;
    explored: string;
    pathLength: string;
    cost: string;
    status: string;
    ready: string;
    found: string;
    noPath: string;
    running: string;
    brushWall: string;
    brushWeight: string;
    brushStart: string;
    brushEnd: string;
    brushErase: string;
    primsMaze: string;
    backtrackerMaze: string;
  };
  physics: {
    labBadge: string;
    labTitle: string;
    presetLabel: string;
    presets: {
      cloth: string;
      rope: string;
      chains: string;
      gravity: string;
      bridge: string;
    };
    activeTool: string;
    tools: {
      drag: string;
      spawn: string;
      tear: string;
      pin: string;
    };
    fabricElasticity: string;
    orbitalCoreMass: string;
    planarGravity: string;
    airFriction: string;
    resetWorld: string;
    particles: string;
    constraints: string;
    spatialHash: string;
    helpDrag: string;
    helpPin: string;
    helpTear: string;
  };
  automata: {
    labBadge: string;
    labTitle: string;
    runSim: string;
    pauseSim: string;
    step: string;
    clearGrid: string;
    interactiveBrush: string;
    tools: {
      draw: string;
      erase: string;
      stamp: string;
    };
    brushRadius: string;
    stampTemplate: string;
    active: string;
    speed: string;
    randomSeed: string;
    resetCamera: string;
    generation: string;
    livingCells: string;
    zoom: string;
    sparseMatrix: string;
    helpClick: string;
    helpPan: string;
    helpZoom: string;
    inspectorTitle: string;
    inspectorDesc: string;
  };
}

export const playgroundTranslations: Record<PlaygroundLang, PlaygroundTranslations> = {
  en: {
    tabs: {
      sorting: { label: 'Sorting Bench', number: '01' },
      graph: { label: 'Graph & Pathfinding', number: '02' },
      physics: { label: 'Verlet Physics', number: '03' },
      automata: { label: 'Cellular Automata', number: '04' }
    },
    activeEngine: 'COMPUTATIONAL ENGINE ACTIVE',
    sorting: {
      labBadge: 'Laboratory 01',
      labTitle: 'Sorting Bench',
      primaryAlgo: 'PRIMARY ALGORITHM',
      dualComparison: 'DUAL ALGORITHM COMPARISON',
      secondaryAlgo: 'SECONDARY ALGORITHM',
      arraySize: 'ARRAY SIZE',
      elements: 'elements',
      speed: 'STEP DELAY',
      play: 'PLAY BENCHMARK',
      pause: 'PAUSE',
      stepForward: 'STEP +1',
      stepBackward: 'STEP -1',
      reset: 'RESET',
      shuffle: 'Random Shuffle',
      nearlySorted: 'Nearly Sorted',
      reversed: 'Reversed',
      fewUnique: 'Few Unique',
      comparisons: 'Comparisons',
      swaps: 'Swaps',
      writes: 'Writes',
      time: 'Time',
      status: 'Status',
      running: 'RUNNING',
      completed: 'DONE',
      ready: 'READY',
      pivot: 'Pivot',
      comparing: 'Comparing',
      swapping: 'Swapping',
      sorted: 'Sorted',
      inspectorTitle: 'Mathematical Complexity & Runtime Profiling'
    },
    graph: {
      labBadge: 'Laboratory 02',
      labTitle: 'Graph & Pathfinding',
      modeGrid: 'GRID / MAZE',
      modeNetwork: 'NETWORK TOPOLOGY',
      primaryAlgo: 'SEARCH ALGORITHM A',
      dualComparison: 'DUAL ALGORITHM COMPARISON',
      secondaryAlgo: 'SEARCH ALGORITHM B',
      drawingBrush: 'DRAWING BRUSH',
      mazeGeneration: 'MAZE GENERATION',
      speed: 'SIMULATION DELAY',
      runSearch: 'EXECUTE SEARCH ALGORITHM',
      clearPath: 'CLEAR PATH',
      resetGrid: 'RESET GRID',
      theoryAlgo: 'THEORY ALGORITHM',
      runGraphAlgo: 'EXECUTE GRAPH ALGORITHM',
      canvasHelpTitle: 'Interactive Canvas:',
      canvasHelp1: '• Drag vertices to dynamically adjust edge layouts.',
      canvasHelp2: '• Observe edge-cuts and component labeling in real-time.',
      explored: 'Explored',
      pathLength: 'Path Length',
      cost: 'Cost',
      status: 'Status',
      ready: 'READY',
      found: 'FOUND',
      noPath: 'NO PATH',
      running: 'SEARCHING',
      brushWall: 'WALL',
      brushWeight: 'WEIGHT',
      brushStart: 'START',
      brushEnd: 'END',
      brushErase: 'ERASE',
      primsMaze: "Prim's Maze",
      backtrackerMaze: 'Backtracker'
    },
    physics: {
      labBadge: 'Laboratory 03',
      labTitle: 'Verlet Physics Engine',
      presetLabel: 'SIMULATION PRESET',
      presets: {
        cloth: 'Cloth Mesh',
        rope: 'Pendulum',
        chains: 'Suspension',
        gravity: 'Gravity Orbit',
        bridge: 'Truss Bridge'
      },
      activeTool: 'ACTIVE INTERACTIVE TOOL',
      tools: {
        drag: 'Drag / Grab',
        spawn: 'Spawn Ball',
        tear: 'Tear / Slice',
        pin: 'Pin / Unpin'
      },
      fabricElasticity: 'FABRIC ELASTICITY',
      orbitalCoreMass: 'ORBITAL CORE MASS',
      planarGravity: 'PLANAR GRAVITY',
      airFriction: 'AIR FRICTION',
      resetWorld: 'RESET WORLD',
      particles: 'P',
      constraints: 'C',
      spatialHash: 'Spatial Hash',
      helpDrag: 'Drag: Grab and pull nodes',
      helpPin: 'Pin: Toggle anchors',
      helpTear: 'Tear: Scissor slice'
    },
    automata: {
      labBadge: 'Laboratory 04',
      labTitle: 'Cellular Automata',
      runSim: 'RUN SIMULATION',
      pauseSim: 'PAUSE SIMULATION',
      step: 'STEP +1',
      clearGrid: 'CLEAR GRID',
      interactiveBrush: 'INTERACTIVE BRUSH',
      tools: {
        draw: 'Draw',
        erase: 'Erase',
        stamp: 'Stamp'
      },
      brushRadius: 'BRUSH RADIUS',
      stampTemplate: 'STAMP TEMPLATE',
      active: 'Active',
      speed: 'LIVE SIMULATION DELAY',
      randomSeed: 'RANDOM SEED',
      resetCamera: 'RESET CAMERA VIEW',
      generation: 'Generation',
      livingCells: 'Living Cells',
      zoom: 'Zoom',
      sparseMatrix: 'SPARSE GRID MATRIX',
      helpClick: 'Click / Touch: Paint cells or stamp',
      helpPan: 'Shift + drag: Pan camera',
      helpZoom: 'Mouse wheel: Zoom',
      inspectorTitle: 'Simulation Inspector: Sparse Coordinate Hash Set',
      inspectorDesc: "The automaton uses a sparse coordinate hash set with lazy neighbor accumulation. Only active clusters and their adjacent boundary coordinates are computed each generation, enabling unbounded coordinate exploration without memory spikes."
    }
  },
  es: {
    tabs: {
      sorting: { label: 'Algoritmos de Ordenamiento', number: '01' },
      graph: { label: 'Grafos y Búsqueda', number: '02' },
      physics: { label: 'Física Verlet', number: '03' },
      automata: { label: 'Autómata Celular', number: '04' }
    },
    activeEngine: 'MOTOR COMPUTACIONAL ACTIVO',
    sorting: {
      labBadge: 'Laboratorio 01',
      labTitle: 'Banco de Ordenamiento',
      primaryAlgo: 'ALGORITMO PRINCIPAL',
      dualComparison: 'COMPARACIÓN DE ALGORITMOS',
      secondaryAlgo: 'ALGORITMO SECUNDARIO',
      arraySize: 'TAMAÑO DEL ARREGLO',
      elements: 'elementos',
      speed: 'INTERVALO DE PASO',
      play: 'EJECUTAR BENCHMARK',
      pause: 'PAUSAR',
      stepForward: 'PASO +1',
      stepBackward: 'PASO -1',
      reset: 'REINICIAR',
      shuffle: 'Aleatorio',
      nearlySorted: 'Casi Ordenado',
      reversed: 'Invertido',
      fewUnique: 'Pocos Únicos',
      comparisons: 'Comparaciones',
      swaps: 'Intercambios',
      writes: 'Escrituras',
      time: 'Tiempo',
      status: 'Estado',
      running: 'EJECUTANDO',
      completed: 'COMPLETADO',
      ready: 'LISTO',
      pivot: 'Pivote',
      comparing: 'Comparando',
      swapping: 'Intercambiando',
      sorted: 'Ordenado',
      inspectorTitle: 'Complejidad Matemática y Perfilado de Rendimiento'
    },
    graph: {
      labBadge: 'Laboratorio 02',
      labTitle: 'Grafos y Búsqueda de Rutas',
      modeGrid: 'GRILLA / LABERINTO',
      modeNetwork: 'TOPOLOGÍA DE RED',
      primaryAlgo: 'ALGORITMO DE BÚSQUEDA A',
      dualComparison: 'COMPARACIÓN DE ALGORITMOS',
      secondaryAlgo: 'ALGORITMO DE BÚSQUEDA B',
      drawingBrush: 'PINCEL DE DIBUJO',
      mazeGeneration: 'GENERACIÓN DE LABERINTOS',
      speed: 'INTERVALO DE SIMULACIÓN',
      runSearch: 'EJECUTAR BÚSQUEDA DE RUTA',
      clearPath: 'LIMPIAR RUTA',
      resetGrid: 'REINICIAR GRILLA',
      theoryAlgo: 'ALGORITMO TEÓRICO',
      runGraphAlgo: 'EJECUTAR ALGORITMO DE GRAFOS',
      canvasHelpTitle: 'Lienzo Interactivo:',
      canvasHelp1: '• Arrastra vértices para ajustar dinámicamente las aristas.',
      canvasHelp2: '• Observa cortes de aristas y componentes en tiempo real.',
      explored: 'Explorados',
      pathLength: 'Longitud de Ruta',
      cost: 'Costo',
      status: 'Estado',
      ready: 'LISTO',
      found: 'ENCONTRADA',
      noPath: 'SIN RUTA',
      running: 'BUSCANDO',
      brushWall: 'MURO',
      brushWeight: 'PESO',
      brushStart: 'INICIO',
      brushEnd: 'FIN',
      brushErase: 'BORRAR',
      primsMaze: 'Laberinto de Prim',
      backtrackerMaze: 'Backtracker Recursivo'
    },
    physics: {
      labBadge: 'Laboratorio 03',
      labTitle: 'Motor Físico Verlet',
      presetLabel: 'PREAJUSTE DE SIMULACIÓN',
      presets: {
        cloth: 'Malla de Tela',
        rope: 'Péndulo',
        chains: 'Suspensión',
        gravity: 'Órbita Gravitacional',
        bridge: 'Puente Warren'
      },
      activeTool: 'HERRAMIENTA ACTIVA',
      tools: {
        drag: 'Arrastrar / Agarrar',
        spawn: 'Generar Esfera',
        tear: 'Cortar / Rasgar',
        pin: 'Fijar / Liberar'
      },
      fabricElasticity: 'ELASTICIDAD DE TELA',
      orbitalCoreMass: 'MASA DEL NÚCLEO ORBITAL',
      planarGravity: 'GRAVEDAD PLANAR',
      airFriction: 'FRICCIÓN DEL AIRE',
      resetWorld: 'REINICIAR MUNDO',
      particles: 'P',
      constraints: 'C',
      spatialHash: 'Spatial Hash',
      helpDrag: 'Arrastrar: Agarra y jala nodos',
      helpPin: 'Fijar: Alterna anclas fijas',
      helpTear: 'Cortar: Tijera de corte'
    },
    automata: {
      labBadge: 'Laboratorio 04',
      labTitle: 'Autómata Celular',
      runSim: 'INICIAR SIMULACIÓN',
      pauseSim: 'PAUSAR SIMULACIÓN',
      step: 'PASO +1',
      clearGrid: 'LIMPIAR GRILLA',
      interactiveBrush: 'PINCEL INTERACTIVO',
      tools: {
        draw: 'Dibujar',
        erase: 'Borrar',
        stamp: 'Estampar'
      },
      brushRadius: 'RADIO DE PINCEL',
      stampTemplate: 'PATRÓN A ESTAMPAR',
      active: 'Activo',
      speed: 'INTERVALO DE SIMULACIÓN',
      randomSeed: 'SEMILLA ALEATORIA',
      resetCamera: 'REINICIAR VISTA',
      generation: 'Generación',
      livingCells: 'Células Vivas',
      zoom: 'Zoom',
      sparseMatrix: 'MATRIZ ESPARSA',
      helpClick: 'Clic / Tocar: Pinta células o estampa',
      helpPan: 'Shift + arrastrar: Mueve la cámara',
      helpZoom: 'Rueda del ratón: Zoom',
      inspectorTitle: 'Inspector de Simulación: Conjunto de Hash de Coordenadas Esparsas',
      inspectorDesc: 'El autómata utiliza un conjunto de dispersión (hash set) de coordenadas esparsas con acumulación perezosa de vecinos. Solo se computan los cúmulos activos y sus fronteras adyacentes por generación, permitiendo exploración ilimitada sin sobrecargar la memoria.'
    }
  }
};

