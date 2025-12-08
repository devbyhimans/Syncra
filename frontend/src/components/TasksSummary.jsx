import { useEffect, useState } from "react";
import { ArrowRight, Clock, AlertTriangle, User } from "lucide-react";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";

export default function TasksSummary() {

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { user } = useUser();
    const [tasks, setTasks] = useState([]);

    // Get all tasks for all projects in current workspace
    useEffect(() => {
        if (currentWorkspace) {
            setTasks(currentWorkspace.projects.flatMap((project) => project.tasks));
        }
    }, [currentWorkspace]);

    const myTasks = tasks.filter(i => i.assigneeId === user.id);
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE');
    const inProgressIssues = tasks.filter(i => i.status === 'IN_PROGRESS');

    const summaryCards = [
        {
            title: "My Tasks",
            count: myTasks.length,
            icon: User,
            items: myTasks.slice(0, 3),
            themeType: "EMERALD" // Helper to select theme
        },
        {
            title: "Overdue",
            count: overdueTasks.length,
            icon: AlertTriangle,
            items: overdueTasks.slice(0, 3),
            themeType: "RED"
        },
        {
            title: "In Progress",
            count: inProgressIssues.length,
            icon: Clock,
            items: inProgressIssues.slice(0, 3),
            themeType: "BLUE"
        }
    ];

    // THEME CONFIGURATION (Matches ProjectCard intensity)
    const themes = {
        EMERALD: {
            glow: "bg-blue-500",
            iconBg: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
            badge: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"
        },
        RED: {
            glow: "bg-blue-500", 
            iconBg: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
            badge: "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
        },
        BLUE: {
            glow: "bg-blue-500",
            iconBg: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
            badge: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300"
        }
    };

    return (
        <div className="space-y-6">
            {summaryCards.map((card) => {
                const theme = themes[card.themeType];
                
                return (
                    <div 
                        key={card.title} 
                        className="
                            group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 
                            hover:shadow-xl hover:-translate-y-1.5 
                            dark:border-white/10 dark:bg-zinc-950/40 dark:backdrop-blur-md
                        "
                    >
                        

                        {/* GLOW 2: Top Left */}
                        <div
                            className={`
                                absolute -top-10 -left-10 h-15 w-110 rounded-full blur-[80px] transition-all duration-500 
                                opacity-40 group-hover:opacity-60 dark:opacity-40 dark:group-hover:opacity-70
                                ${theme.glow}
                            `}
                        />

                        {/* Content Container (z-10 to sit above glow) */}
                        <div className="relative z-10">
                            
                            {/* Header */}
                            <div className="border-b border-gray-100 dark:border-white/5 p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg backdrop-blur-sm ${theme.iconBg}`}>
                                        <card.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center justify-between flex-1">
                                        <h3 className="text-sm font-bold text-gray-800 dark:text-white">{card.title}</h3>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border backdrop-blur-md ${theme.badge}`}>
                                            {card.count}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* List Items */}
                            <div className="p-4">
                                {card.items.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-4 font-medium">
                                        No {card.title.toLowerCase()}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {card.items.map((issue) => (
                                            <div 
                                                key={issue.id} 
                                                className="
                                                    p-3 rounded-lg border border-transparent transition-colors cursor-pointer
                                                    bg-gray-50 hover:bg-white hover:border-gray-200
                                                    dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/10
                                                "
                                            >
                                                <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                                    {issue.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1 font-medium">
                                                    {issue.type} • {issue.priority} priority
                                                </p>
                                            </div>
                                        ))}
                                        {card.count > 3 && (
                                            <button className="flex items-center justify-center w-full text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mt-3 transition-colors">
                                                View {card.count - 3} more <ArrowRight className="w-3 h-3 ml-1" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}