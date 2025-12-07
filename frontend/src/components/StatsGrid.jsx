import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function StatsGrid() {
    //getting current workspace
    const currentWorkspace = useSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in ${currentWorkspace?.name}`,
            textColor: "text-blue-600 dark:text-blue-400",
            glow: "bg-blue-500", // Added for the glow effect
        },
        {
            icon: CheckCircle,
            title: "Completed Projects",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} total`,
            textColor: "text-emerald-600 dark:text-emerald-400",
            glow: "bg-emerald-500",
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
            textColor: "text-purple-600 dark:text-purple-400",
            glow: "bg-purple-500",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            textColor: "text-amber-600 dark:text-amber-400",
            glow: "bg-amber-500",
        },
    ];

    useEffect(() => {
        if (currentWorkspace) {
            setStats({
                totalProjects: currentWorkspace.projects.length,
                activeProjects: currentWorkspace.projects.filter(
                    (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
                ).length,
                completedProjects: currentWorkspace.projects
                    .filter((p) => p.status === "COMPLETED")
                    .reduce((acc, project) => acc + project.tasks.length, 0),
                myTasks: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc +
                        project.tasks.filter(
                            (t) => t.assignee?.email === currentWorkspace.owner.email
                        ).length,
                    0
                ),
                overdueIssues: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc + project.tasks.filter((t) => t.due_date < new Date()).length,
                    0
                ),
            });
        }
    }, [currentWorkspace]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(
                ({ icon: Icon, title, value, subtitle, textColor, glow }, i) => (
                    <div
                        key={i}
                        className="group relative overflow-hidden rounded p-6 transition-all
                        bg-white border border-zinc-200 hover:border-zinc-300
                        dark:bg-neutral-900 dark:border-white/10 dark:hover:border-white/20"
                    >
                        {/* Background Glow Effect */}
                        <div
                            className={`absolute -bottom-10 -right-10 h-32 w-40 rounded-full blur-[60px] transition-opacity duration-500 
                            opacity-50 group-hover:opacity-90 
                            dark:opacity-50 dark:group-hover:opacity-90 
                            ${glow}`}
                        />

                        {/* Content Container */}
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-gray-400 mb-1">
                                    {title}
                                </p>
                                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                    {value}
                                </p>
                                {subtitle && (
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {/* Icon Container */}
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-full shadow-inner
                                bg-zinc-100 border border-zinc-200
                                dark:bg-white/5 dark:border-white/10"
                            >
                                <Icon className={`h-6 w-6 ${textColor}`} />
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}