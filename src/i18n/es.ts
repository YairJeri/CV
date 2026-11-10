// src/i18n/es.ts
import type { Translations } from "./en";

const es: Translations = {
    name: "Español",
    flag: "fi-es",
    home: {
        badge: "DISPONIBLE PARA OPORTUNIDADES",
        title: ["Portafolio de", "Ingeniería"],
        prev: "Soy",
        specialization: [
            "Desarrollador Full Stack",
            "Ingeniero de Sistemas y Algoritmos",
            "Practicante de Ciencia de Datos e IA",
            "Entusiasta de Gráficos y Simulación"
        ],
        about: "Estudiante de Ciencias de la Computación y desarrollador de software enfocado en sistemas distribuidos, algoritmos computacionales en tiempo real, flujos de machine learning y optimización de rendimiento.",
        viewProjects: "Ver Proyectos",
        contact: "Contactar",
        downloadCv: "Descargar CV (PDF)",
        playgroundBtn: "Laboratorio Computacional",
    },
    navbar: {
        home: "Inicio",
        about: "Perfil",
        skills: "Habilidades",
        portfolio: "Proyectos",
        playground: "Laboratorio",
        cv: "Curriculum Vitae",
        contact: "Contacto",
        roleSubtitle: "Sistemas y Algoritmos",
    },
    about: {
        badge: "PERFIL PROFESIONAL",
        title: "Acerca de mí",
        header: "Construcción de sistemas de software de alto rendimiento con rigor algorítmico y disciplina de ingeniería.",
        columns: [
            {
                title: "Full Stack y Sistemas Distribuidos",
                desc: "Experiencia en arquitecturas frontend reactivas y servicios backend robustos en Java Spring, Node.js, bases de datos relacionales y NoSQL."
            },
            {
                title: "Rigor Algorítmico y Computacional",
                desc: "Enfoque en implementaciones reales de teoría de grafos, simulación física numérica y particionamiento espacial con precisión matemática."
            },
            {
                title: "Machine Learning Aplicado y Gráficos",
                desc: "Sólidas bases en TensorFlow, modelado estadístico de datos y pipelines de renderizado por hardware en C++ y APIs gráficas."
            }
        ]
    },
    skills: {
        badge: "HABILIDADES",
        title: "Tecnologías y Herramientas",
        description: "Herramientas y lenguajes con los que trabajo para desarrollo web, backend, bases de datos y gráficos.",
        domains: [
            {
                title: "Lenguajes",
                subtitle: "Desarrollo de software, scripting y lógica de bajo nivel"
            },
            {
                title: "Backend y Bases de Datos",
                subtitle: "Servicios web, APIs REST/GraphQL y almacenamiento de datos"
            },
            {
                title: "Frontend, Gráficos y Herramientas",
                subtitle: "Interfaces de usuario, librerías gráficas y control de versiones"
            }
        ]
    },
    portfolio: {
        badge: "PROYECTOS",
        title: "Proyectos Seleccionados",
        description: "Algunos de los proyectos que he desarrollado recientemente.",
        allTag: "Todos",
        caseStudy: "Ver Detalles →",
        sourceCode: "Código Fuente",
        seeOnGithub: "Ver en GitHub",
        seeWebsite: "Sitio Web",
    },
    resume: {
        badge: "EDUCACIÓN",
        title: "Educación y Trayectoria",
        degree: "Ciencias de la Computación (70% Completado)",
        university: "Universidad Peruana de Ciencias Aplicadas (UPC)",
        focus: "Énfasis en desarrollo de software, algoritmos y fundamentos de sistemas distribuidos.",
        languagesTitle: "Dominio de Idiomas",
        downloadButton: "Descargar Currículum Vitae (PDF) ↓"
    },
    contact: {
        title: "Información de Contacto",
        text: "Siempre estoy abierto a nuevas oportunidades, colaboraciones o simplemente conversar. No dudes en escribirme.",
        email: "Correo",
        github: "GitHub",
        linkedin: "LinkedIn"
    }
};

export default es;
