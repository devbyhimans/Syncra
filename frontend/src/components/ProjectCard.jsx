import { Link } from "react-router-dom";

const ProjectCard = ({ project }) => {
    // --- UPDATES FOR INTENSITY ---
    // 1. wrapper: Switched to '-500' shades for maximum brightness/neon effect.
    // 2. text: Switched to '-400' for more saturated text colors in dark mode.
    // 3. iconBg: Increased opacity for a punchier look.
    const themes = {
        PLANNING: {
            wrapper: "bg-purple-500", // Brighter neon purple
            iconBg: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
            text: "text-gray-900 dark:text-white",
            subText: "text-gray-500 dark:text-gray-400",
            statusBox: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300",
            barBg: "bg-gray-100 dark:bg-white/10",
            barFill: "bg-purple-500"
        },
        ACTIVE: {
            wrapper: "bg-emerald-500", // Brighter neon emerald
            iconBg: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
            text: "text-gray-900 dark:text-white",
            subText: "text-gray-500 dark:text-gray-400",
            statusBox: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300",
            barBg: "bg-gray-100 dark:bg-white/10",
            barFill: "bg-emerald-500"
        },
        ON_HOLD: {
            wrapper: "bg-orange-500", // Brighter neon orange
            iconBg: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
            text: "text-gray-900 dark:text-white",
            subText: "text-gray-500 dark:text-gray-400",
            statusBox: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300",
            barBg: "bg-gray-100 dark:bg-white/10",
            barFill: "bg-orange-500"
        },
        COMPLETED: {
            wrapper: "bg-blue-500", // Brighter neon blue
            iconBg: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
            text: "text-gray-900 dark:text-white",
            subText: "text-gray-500 dark:text-gray-400",
            statusBox: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300",
            barBg: "bg-gray-100 dark:bg-white/10",
            barFill: "bg-blue-500"
        },
        CANCELLED: {
            wrapper: "bg-rose-500", // Brighter neon rose
            iconBg: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
            text: "text-gray-900 dark:text-white",
            subText: "text-gray-500 dark:text-gray-400",
            statusBox: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300",
            barBg: "bg-gray-100 dark:bg-white/10",
            barFill: "bg-rose-500"
        },
    };

    const theme = themes[project.status] || themes.PLANNING;

    return (
        <Link 
            to={`/projectsDetail?id=${project.id}&tab=tasks`} 
            className="
                group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 
                hover:shadow-xl hover:shadow-blue-700 hover:-translate-y-1.5  
                dark:border-white/10 dark:bg-zinc-950/40 dark:backdrop-blur-md
            "
        >
            {/* GLOW 1: Bottom Right - INCREASED OPACITY */}
            <div
                className={`
                    absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-[80px] transition-all duration-500 
                    opacity-50 group-hover:opacity-90 dark:opacity-50 dark:group-hover:opacity-90
                    ${theme.wrapper}
                `}
            />

            {/* GLOW 2: Top Left - INCREASED OPACITY */}
            <div
                className={`
                    absolute -top-10 -left-10 h-40 w-40 rounded-full blur-[80px] transition-all duration-500 
                    opacity-50 group-hover:opacity-90 dark:opacity-50 dark:group-hover:opacity-90
                    ${theme.wrapper}
                `}
            />

            {/* Header: Icon Bubble + Priority */}
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-sm ${theme.iconBg}`}>
                   {/* Status Icons */}
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {project.status === 'COMPLETED' ? (
                            <>
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </>
                        ) : null}
                        {project.status === 'ACTIVE' ? (
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        ) : null}
                        {project.status === 'PLANNING' ? (
                            <>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </>
                        ) : null}
                        {project.status === 'ON_HOLD' ? (
                            <>
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </>
                        ) : null}
                        {project.status === 'CANCELLED' ? (
                            <>
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </>
                        ) : null}
                        {!['COMPLETED', 'ACTIVE', 'PLANNING', 'ON_HOLD', 'CANCELLED'].includes(project.status) && <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>}
                   </svg>
                </div>
                
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.subText} opacity-80`}>
                    {project.priority} Priority
                </span>
            </div>

            {/* Content */}
            <div className="relative z-10 mb-6">
                {/* Updated Status Box */}
                <div className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide mb-3 border backdrop-blur-md ${theme.statusBox}`}>
                    {project.status.replace("_", " ")}
                </div>
                <h3 className={`text-xl font-bold leading-tight mb-2 ${theme.text}`}>
                    {project.name}
                </h3>
                <p className={`text-sm font-medium leading-relaxed ${theme.subText} line-clamp-2`}>
                    {project.description || "No description provided."}
                </p>
            </div>

            {/* Footer: Progress */}
            <div className="relative z-10 flex items-center gap-3">
                <div className={`flex-1 h-1.5 rounded-full ${theme.barBg}`}>
                    <div 
                        className={`h-full rounded-full ${theme.barFill}`} 
                        style={{ width: `${project.progress || 0}%` }} 
                    />
                </div>
                <span className={`text-xs font-bold ${theme.text} opacity-80`}>{project.progress || 0}%</span>
            </div>
        </Link>
    );
};

export default ProjectCard;