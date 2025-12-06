import { Link } from "react-router-dom";

const ProjectCard = ({ project }) => {
    // Vibrant pastel gradients with dark text for high contrast
    // Compacted dimensions (rounded-2xl, standard padding)
    // Status in a highlighted rectangular box
    // Enhanced hover elevation
    const themes = {
        PLANNING: {
            wrapper: "bg-gradient-to-br from-purple-200 via-purple-300 to-indigo-300 border-purple-100/50",
            iconBg: "bg-white/40 text-purple-900 ring-1 ring-white/40",
            text: "text-slate-900",
            subText: "text-slate-700",
            statusBox: "bg-white/60 border border-purple-200/50 text-purple-950",
            barBg: "bg-purple-900/10",
            barFill: "bg-purple-900"
        },
        ACTIVE: {
            wrapper: "bg-gradient-to-br from-emerald-200 via-emerald-300 to-teal-300 border-emerald-100/50",
            iconBg: "bg-white/40 text-emerald-900 ring-1 ring-white/40",
            text: "text-emerald-950",
            subText: "text-emerald-800",
            statusBox: "bg-white/60 border border-emerald-200/50 text-emerald-950",
            barBg: "bg-emerald-900/10",
            barFill: "bg-emerald-900"
        },
        ON_HOLD: {
            wrapper: "bg-gradient-to-br from-orange-200 via-orange-300 to-amber-300 border-orange-100/50",
            iconBg: "bg-white/40 text-orange-900 ring-1 ring-white/40",
            text: "text-orange-950",
            subText: "text-orange-800",
            statusBox: "bg-white/60 border border-orange-200/50 text-orange-950",
            barBg: "bg-orange-900/10",
            barFill: "bg-orange-900"
        },
        COMPLETED: {
            wrapper: "bg-gradient-to-br from-blue-200 via-blue-300 to-sky-300 border-blue-100/50",
            iconBg: "bg-white/40 text-blue-900 ring-1 ring-white/40",
            text: "text-blue-950",
            subText: "text-blue-800",
            statusBox: "bg-white/60 border border-blue-200/50 text-blue-950",
            barBg: "bg-blue-900/10",
            barFill: "bg-blue-900"
        },
        CANCELLED: {
            wrapper: "bg-gradient-to-br from-rose-200 via-rose-300 to-pink-300 border-rose-100/50",
            iconBg: "bg-white/40 text-rose-900 ring-1 ring-white/40",
            text: "text-rose-950",
            subText: "text-rose-800",
            statusBox: "bg-white/60 border border-rose-200/50 text-rose-950",
            barBg: "bg-rose-900/10",
            barFill: "bg-rose-900"
        },
    };

    const theme = themes[project.status] || themes.PLANNING;

    return (
        <Link 
            to={`/projectsDetail?id=${project.id}&tab=tasks`} 
            className={`
                relative block rounded-2xl p-6 transition-all duration-300 group 
                hover:shadow-xl hover:shadow-blue-600 hover:-translate-y-1.5 border
                ${theme.wrapper}
            `}
        >
            {/* Header: Icon Bubble + Priority */}
            <div className="flex justify-between items-start mb-6">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm ${theme.iconBg}`}>
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
                
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.text} opacity-60`}>
                    {project.priority} Priority
                </span>
            </div>

            {/* Content */}
            <div className="mb-6">
                {/* Updated Status Box */}
                <div className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide mb-3 shadow-sm backdrop-blur-md ${theme.statusBox}`}>
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
            <div className="flex items-center gap-3">
                
                <div className={`flex-1 h-1.5 rounded-full ${theme.barBg}`}>
                    
                    <div 
                        className={`h-full rounded-full ${theme.barFill}`} 
                        style={{ width: `${project.progress || 0}%` }} 
                    />
                    <span className={`text-xs font-bold ${theme.text} opacity-70`}>Progress</span>
                </div>
                <span className={`text-xs font-bold ${theme.text} opacity-70`}>{project.progress || 0}%</span>
            </div>

        </Link>
    );
};

export default ProjectCard;