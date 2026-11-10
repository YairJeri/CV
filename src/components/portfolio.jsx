import { useState } from "preact/hooks";

export default function Portfolio({ projects, lang, t }) {
    const [selectedTag, setSelectedTag] = useState("All");

    const allTags = Array.from(new Set(projects.flatMap(p => p.data.tags)));

    const filteredProjects =
        selectedTag === "All"
            ? projects
            : projects.filter(p => p.data.tags.includes(selectedTag));

    const orderedProjects = filteredProjects.sort((a, b) =>
        a.data.title.localeCompare(b.data.title)
    );

    return (
        <section id="Portfolio" className="relative">
            <div className="mb-10 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                    {t.portfolio.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                    {t.portfolio.title}
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base max-w-3xl leading-relaxed">
                    {t.portfolio.description}
                </p>
            </div>

            {/* Tag Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8 items-center">
                <button
                    onClick={() => setSelectedTag("All")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                        selectedTag === "All"
                            ? "bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20 font-bold"
                            : "bg-black/40 text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                    }`}
                >
                    {t.portfolio.allTag} ({projects.length})
                </button>
                {allTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                            selectedTag === tag
                                ? "bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20 font-bold"
                                : "bg-black/40 text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Structured Technical Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orderedProjects.map((project, idx) => {
                    const projectId = (project.id || project.slug || "").split("/").pop();
                    return (
                        <div
                            key={project.data.title}
                            className="group flex flex-col rounded-2xl bg-surface/90 border border-white/10 shadow-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300"
                        >
                            {/* Project Header Bar */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/40 text-xs font-mono">
                                <span className="text-zinc-400">
                                    SYS-{String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="text-cyan-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    {project.data.tags[0] || "Engineering"}
                                </span>
                            </div>

                            {/* Preview Image with Technical Overlay */}
                            <div className="relative aspect-video w-full overflow-hidden bg-black/80">
                                <img
                                    src={project.optimizedImage?.src ?? project.data.image}
                                    alt={project.data.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90"></div>
                            </div>

                            {/* Project Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-white tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                                    {project.data.title}
                                </h3>
                                <p className="text-sm text-zinc-300 leading-relaxed mb-6 flex-1">
                                    {project.data.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 mb-6">
                                    {project.data.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 text-zinc-400 border border-white/5"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-auto">
                                    <a
                                        href={`/${lang}/portfolio/${projectId}`}
                                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/30 transition-all"
                                    >
                                        {t.portfolio.caseStudy}
                                    </a>
                                    {project.data.github && (
                                        <a
                                            href={project.data.github}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-mono text-zinc-400 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 transition"
                                        >
                                            {t.portfolio.sourceCode}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
