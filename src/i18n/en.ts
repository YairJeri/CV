// src/i18n/en.ts
export type Translations = {
    name: string;
    flag: string;
    home: {
        badge: string;
        title: [string, string];
        prev: string;
        specialization: Array<string>;
        about: string;
        viewProjects: string;
        contact: string;
        downloadCv: string;
        playgroundBtn: string;
    };
    navbar: {
        home: string;
        about: string;
        skills: string;
        portfolio: string;
        playground: string;
        cv: string;
        contact: string;
        roleSubtitle: string;
    };
    about: {
        badge: string;
        title: string;
        header: string;
        columns: [
            { title: string; desc: string },
            { title: string; desc: string },
            { title: string; desc: string }
        ];
    };
    skills: {
        badge: string;
        title: string;
        description: string;
        domains: Array<{
            title: string;
            subtitle: string;
        }>;
    };
    portfolio: {
        badge: string;
        title: string;
        description: string;
        allTag: string;
        caseStudy: string;
        sourceCode: string;
        seeOnGithub: string;
        seeWebsite: string;
    };
    resume: {
        badge: string;
        title: string;
        degree: string;
        university: string;
        focus: string;
        languagesTitle: string;
        downloadButton: string;
    };
    contact: {
        title: string;
        text: string;
        email: string;
        github: string;
        linkedin: string;
    };
};

const en: Translations = {
    name: "English",
    flag: "fi-us",
    home: {
        badge: "AVAILABLE FOR ENGINEERING ROLES",
        title: ["Engineering", "Portfolio"],
        prev: "I'm a",
        specialization: [
            "Full Stack Developer",
            "Systems & Algorithms Engineer",
            "Data Science & ML Practitioner",
            "Real-time Graphics & Simulation Enthusiast"
        ],
        about: "Computer Science student and full stack software engineer specialized in distributed systems, real-time computational algorithms, machine learning pipelines, and low-level performance optimization.",
        viewProjects: "View Selected Work",
        contact: "Get in Touch",
        downloadCv: "Download CV (PDF)",
        playgroundBtn: "Launch Computational Lab",
    },
    navbar: {
        home: "Home",
        about: "Profile",
        skills: "Skills",
        portfolio: "Projects",
        playground: "Playground",
        cv: "Curriculum Vitae",
        contact: "Contact",
        roleSubtitle: "Systems & Algorithms",
    },
    about: {
        badge: "ENGINEERING PROFILE",
        title: "About Me",
        header: "Building high-performance software systems with algorithmic rigor and practical engineering discipline.",
        columns: [
            {
                title: "Full Stack & Distributed Systems",
                desc: "Experienced with reactive frontend architectures and robust backend services across Java Spring, Node.js, relational and document stores."
            },
            {
                title: "Computational & Algorithmic Rigor",
                desc: "Focus on writing genuine implementations of graph algorithms, numerical physical simulation, and spatial partitioning with mathematical precision."
            },
            {
                title: "Applied Machine Learning & Graphics",
                desc: "Strong foundations in TensorFlow, statistical data modeling, and low-level hardware rendering pipelines in C++ and graphics APIs."
            }
        ]
    },
    skills: {
        badge: "SKILLS",
        title: "Technologies & Tools",
        description: "Languages, frameworks, and tools I use for web development, backends, databases, and graphics.",
        domains: [
            {
                title: "Languages",
                subtitle: "Software development, scripting, and systems programming"
            },
            {
                title: "Backend & Databases",
                subtitle: "Web services, REST/GraphQL APIs, and data storage"
            },
            {
                title: "Frontend, Graphics & Tools",
                subtitle: "User interfaces, graphics libraries, and version control"
            }
        ]
    },
    portfolio: {
        badge: "PROJECTS",
        title: "Selected Projects",
        description: "A selection of projects I've built across web, machine learning, and systems.",
        allTag: "All",
        caseStudy: "Case Study →",
        sourceCode: "Source Code",
        seeOnGithub: "View on GitHub",
        seeWebsite: "Live Site",
    },
    resume: {
        badge: "EDUCATION",
        title: "Education & Background",
        degree: "Computer Science (70% Completed)",
        university: "Universidad Peruana de Ciencias Aplicadas (UPC)",
        focus: "Focus on software development, algorithms, and distributed systems fundamentals.",
        languagesTitle: "Language Proficiencies",
        downloadButton: "Download Curriculum Vitae (PDF) ↓"
    },
    contact: {
        title: "Contact Information",
        text: "I'm always open to discussing new opportunities, collaborations, or just connecting. Feel free to reach out.",
        email: "Email",
        github: "GitHub",
        linkedin: "LinkedIn"
    }
};

export default en;
