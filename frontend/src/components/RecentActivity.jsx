import { useEffect, useState } from "react";
import { Clock, Activity, MessageSquare, Plus, FileEdit, Trash, CheckSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import { useApi } from "../configs/api";
import { Link } from "react-router-dom";

const actionIcons = {
    PROJECT_CREATED: Plus,
    PROJECT_UPDATED: FileEdit,
    TASK_CREATED: Plus,
    TASK_UPDATED: FileEdit,
    TASK_DELETED: Trash,
    COMMENT_ADDED: MessageSquare,
    SUBTASK_TOGGLED: CheckSquare,
};

const actionColors = {
    PROJECT_CREATED: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    PROJECT_UPDATED: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    TASK_CREATED: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    TASK_UPDATED: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
    TASK_DELETED: "text-red-500 bg-red-50 dark:bg-red-500/10",
    COMMENT_ADDED: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
    SUBTASK_TOGGLED: "text-zinc-500 bg-zinc-50 dark:bg-zinc-500/10",
};

export default function RecentActivity() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const api = useApi();

    useEffect(() => {
        const fetchActivity = async () => {
            if (!currentWorkspace) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/api/activity/${currentWorkspace.id}`);
                setLogs(data.logs || []);
            } catch (error) {
                console.error("Failed to fetch activity:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [currentWorkspace, api]); // eslint-disable-line react-hooks/exhaustive-deps

    const formatActionText = (log) => {
        const name = log.user.name || log.user.email.split('@')[0];
        const title = log.entityTitle || "an item";
        
        switch(log.action) {
            case "PROJECT_CREATED": return <><span className="font-semibold">{name}</span> created project <span className="font-semibold text-blue-600 dark:text-blue-400">{title}</span></>;
            case "PROJECT_UPDATED": return <><span className="font-semibold">{name}</span> updated project <span className="font-semibold">{title}</span></>;
            case "TASK_CREATED": return <><span className="font-semibold">{name}</span> created task <span className="font-semibold text-blue-600 dark:text-blue-400">{title}</span></>;
            case "TASK_UPDATED": return <><span className="font-semibold">{name}</span> updated task <span className="font-semibold">{title}</span></>;
            case "TASK_DELETED": return <><span className="font-semibold">{name}</span> deleted task <span className="font-semibold">{title}</span></>;
            case "COMMENT_ADDED": return <><span className="font-semibold">{name}</span> commented on <span className="font-semibold text-blue-600 dark:text-blue-400">{title}</span></>;
            case "SUBTASK_TOGGLED": return <><span className="font-semibold">{name}</span> checked off a subtask in <span className="font-semibold">{title}</span></>;
            default: return <><span className="font-semibold">{name}</span> modified <span className="font-semibold">{title}</span></>;
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950/40 dark:backdrop-blur-md">
            <div className="absolute -top-10 -left-5 h-32 w-32 rounded-full blur-[80px] transition-all duration-500 opacity-40 group-hover:opacity-70 dark:opacity-40 bg-blue-500" />

            <div className="relative z-10">
                <div className="border-b border-zinc-100 dark:border-white/5 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                        <Activity className="size-5 text-blue-500" /> Activity Log
                    </h2>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-zinc-500">Loading activity...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-50 dark:bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Clock className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No recent activity</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-white/5 max-h-[600px] overflow-y-auto">
                            {logs.map((log) => {
                                const Icon = actionIcons[log.action] || Activity;
                                const colorClass = actionColors[log.action] || "text-zinc-500 bg-zinc-50 dark:bg-zinc-500/10";
                                
                                return (
                                    <div key={log.id} className="p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5 flex gap-4">
                                        <div className={`p-2 rounded-xl backdrop-blur-sm shadow-sm h-min ${colorClass}`}>
                                            <Icon className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-snug">
                                                {formatActionText(log)}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </p>
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
}