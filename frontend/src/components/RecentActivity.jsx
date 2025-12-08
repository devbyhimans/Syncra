import { useEffect, useState } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-500 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-500 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-emerald-500 dark:text-emerald-400" },
    IMPROVEMENT: { icon: MessageSquare, color: "text-amber-500 dark:text-amber-400" },
    OTHER: { icon: GitCommit, color: "text-purple-500 dark:text-purple-400" },
};

// Updated Status Colors to match the "Glass Badge" aesthetic (semi-transparent backgrounds)
const statusColors = {
    TODO: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/20 border",
    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 border",
    DONE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 border",
};

const RecentActivity = () => {
    const [tasks, setTasks] = useState([]);
    const { currentWorkspace } = useSelector((state) => state.workspace);

    const getTasksFromCurrentWorkspace = () => {
        if (!currentWorkspace) return;
        const tasks = currentWorkspace.projects.flatMap((project) => project.tasks.map((task) => task));
        setTasks(tasks);
    };

    useEffect(() => {
        getTasksFromCurrentWorkspace();
    }, [currentWorkspace]);

    // Theme color for the Glow Effect (Indigo/Violet for Activity)
    const glowColor = "bg-blue-500";

    return (
        <div className="
            group relative overflow-hidden rounded-2xl border border-gray-200 bg-white 
            dark:border-white/10 dark:bg-zinc-950/40 dark:backdrop-blur-md
        ">
            
            {/* GLOW 2: Top Left */}
            <div
                className={`
                    absolute -top-10 -left-5 h-15 w-190 rounded-full blur-[80px] transition-all duration-500 
                    opacity-40 group-hover:opacity-70 dark:opacity-40 dark:group-hover:opacity-70
                    ${glowColor}
                `}
            />

            {/* Content Container (Relative z-10 to sit above glow) */}
            <div className="relative z-10">
                <div className="border-b border-gray-100 dark:border-white/5 p-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h2>
                </div>

                <div className="p-0">
                    {tasks.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Clock className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
                            </div>
                            <p className="text-gray-500 dark:text-zinc-400 font-medium">No recent activity</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {tasks.map((task) => {
                                const TypeIcon = typeIcons[task.type]?.icon || Square;
                                const iconColor = typeIcons[task.type]?.color || "text-gray-500 dark:text-gray-400";

                                return (
                                    <div 
                                        key={task.id} 
                                        className="
                                            p-5 transition-colors cursor-pointer
                                            hover:bg-blue-50 dark:hover:bg-white/5
                                        "
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon Box */}
                                            <div className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-xl backdrop-blur-sm shadow-sm">
                                                <TypeIcon className={`w-4 h-4 ${iconColor}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-4">
                                                        {task.title}
                                                    </h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColors[task.status] || "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                                                        {task.status.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 font-medium">
                                                    <span className="capitalize">{task.type.toLowerCase()}</span>
                                                    {task.assignee && (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-[9px] text-gray-700 dark:text-zinc-200 font-bold">
                                                                {task.assignee.name[0].toUpperCase()}
                                                            </div>
                                                            <span>{task.assignee.name}</span>
                                                        </div>
                                                    )}
                                                    <span className="opacity-60">
                                                        {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentActivity;