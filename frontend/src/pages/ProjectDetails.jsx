import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, SettingsIcon, BarChart3Icon, CalendarIcon, FileStackIcon, ZapIcon } from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";

export default function ProjectDetail() {

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const id = searchParams.get('id');

    const navigate = useNavigate();
    const projects = useSelector((state) => state?.workspace?.currentWorkspace?.projects || []);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || "tasks");

    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            const proj = projects.find((p) => p.id === id);
            setProject(proj);
            setTasks(proj?.tasks || []);
        }
    }, [id, projects]);

    const statusColors = {
        PLANNING: "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-200",
        ACTIVE: "bg-emerald-200 text-emerald-900 dark:bg-emerald-500 dark:text-emerald-900",
        ON_HOLD: "bg-amber-200 text-amber-900 dark:bg-amber-500 dark:text-amber-900",
        COMPLETED: "bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-blue-900",
        CANCELLED: "bg-red-200 text-red-900 dark:bg-red-500 dark:text-red-900",
    };

    if (!project) {
        return (
            <div className="p-6 text-center text-zinc-900 dark:text-zinc-200">
                <p className="text-3xl md:text-5xl mt-40 mb-10">Project not found</p>
                <button onClick={() => navigate('/projects')} className="mt-4 px-4 py-2 rounded bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600" >
                    Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-6xl mx-auto text-zinc-900 dark:text-white">
            {/* Header */}
            <div className="flex max-md:flex-col gap-4 flex-wrap items-start justify-between max-w-6xl">
                <div className="flex items-center gap-4">
                    <button className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400" onClick={() => navigate('/projects')}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-medium">{project.name}</h1>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${statusColors[project.status]}`} >
                            {project.status.replace("_", " ")}
                        </span>
                    </div>
                </div>
                <button onClick={() => setShowCreateTask(true)} className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white" >
                    <PlusIcon className="size-4" />
                    New Task
                </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:flex flex-wrap gap-6">
                {[
                    { 
                    label: "Total Tasks", 
                    value: tasks.length, 
                    iconColor: "text-zinc-900 dark:text-white", 
                    glow: "bg-purple-500" 
                    },
                    { 
                    label: "Completed", 
                    value: tasks.filter((t) => t.status === "DONE").length, 
                    iconColor: "text-emerald-600 dark:text-emerald-400", 
                    glow: "bg-green-500" 
                    },
                    { 
                    label: "In Progress", 
                    value: tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "TODO").length, 
                    iconColor: "text-amber-600 dark:text-amber-400", 
                    glow: "bg-amber-500" 
                    },
                    { 
                    label: "Team Members", 
                    value: project.members?.length || 0, 
                    iconColor: "text-blue-600 dark:text-blue-400", 
                    glow: "bg-blue-500" 
                    },
                ].map((card, idx) => (
                    <div 
                    key={idx} 
                    className="group relative overflow-hidden rounded-3xl p-6 transition-all sm:min-w-60
                    bg-white border border-zinc-200 hover:border-zinc-300
                    dark:bg-neutral-900 dark:border-white/10 dark:hover:border-white/20"
                    >
                    {/* Background Glow Effect - Adjusted opacity for Light/Dark */}
                    <div 
                        className={`absolute -bottom-10 -right-10 h-32 w-32 rounded-full blur-[60px] transition-opacity duration-500 
                        opacity-50 group-hover:opacity-90 
                        dark:opacity-50 dark:group-hover:opacity-90 
                        ${card.glow}`} 
                    />

                    {/* Content Container */}
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-gray-400">
                            {card.label}
                        </div>
                        <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                            {card.value}
                        </div>
                        </div>
                        
                        {/* Icon Container */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full shadow-inner
                        bg-zinc-100 border border-zinc-200
                        dark:bg-white/5 dark:border-white/10"
                        >
                        <ZapIcon className={`h-5 w-5 ${card.iconColor}`} />
                        </div>
                    </div>
                    </div>
                ))}
                </div>

            {/* Tabs */}
            <div>
                <div className="inline-flex flex-wrap max-sm:grid grid-cols-3 gap-2 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
                    {[
                        { key: "tasks", label: "Tasks", icon: FileStackIcon },
                        { key: "calendar", label: "Calendar", icon: CalendarIcon },
                        { key: "analytics", label: "Analytics", icon: BarChart3Icon },
                        { key: "settings", label: "Settings", icon: SettingsIcon },
                    ].map((tabItem) => (
                        <button key={tabItem.key} onClick={() => { setActiveTab(tabItem.key); setSearchParams({ id: id, tab: tabItem.key }) }} className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${activeTab === tabItem.key ? "bg-zinc-100 dark:bg-zinc-800/80" : "hover:bg-zinc-50 dark:hover:bg-zinc-700"}`} >
                            <tabItem.icon className="size-3.5" />
                            {tabItem.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {activeTab === "tasks" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectTasks tasks={tasks} />
                        </div>
                    )}
                    {activeTab === "analytics" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectAnalytics tasks={tasks} project={project} />
                        </div>
                    )}
                    {activeTab === "calendar" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectCalendar tasks={tasks} />
                        </div>
                    )}
                    {activeTab === "settings" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <ProjectSettings project={project} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateTask && <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} projectId={id} />}
        </div>
    );
}
