import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, CheckSquare, Paperclip, UploadCloud, X, Trash2, FileIcon, FileTextIcon, ImageIcon, Plus } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useApi } from "../configs/api.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TaskDetails = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const { user } = useUser();
    const api = useApi(); // Authenticated Axios instance — token attached automatically
    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [subtasks, setSubtasks] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [newSubtask, setNewSubtask] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const { currentWorkspace } = useSelector((state) => state.workspace);

    const fetchTaskDetails = async () => {
        if (!projectId || !taskId) return;
        const proj = currentWorkspace?.projects.find((p) => p.id === projectId);
        if (!proj) return;
        const tsk = proj.tasks.find((t) => t.id === taskId);
        if (!tsk) return;

        setTask(tsk);
        setProject(proj);
    };

    const fetchExtraData = async () => {
        if (!taskId) return;
        try {
            const [commentsRes, subtasksRes, attachmentsRes] = await Promise.all([
                api.get(`/api/comments/${taskId}`),
                api.get(`/api/subtasks/${taskId}`),
                api.get(`/api/attachments/${taskId}`)
            ]);
            setComments(commentsRes.data.comments || []);
            setSubtasks(subtasksRes.data.subtasks || []);
            setAttachments(attachmentsRes.data.attachments || []);
        } catch (error) {
            console.error("Failed to fetch task details:", error);
        }
    };

    const fetchCommentsOnly = async (signal) => {
        if (!taskId) return;
        try {
            const { data } = await api.get(`/api/comments/${taskId}`, { signal });
            setComments(data.comments || []);
        } catch (error) {
            // Ignore AbortError (component unmounted or new request started)
            if (error.name !== "CanceledError" && error.code !== "ERR_CANCELED") {
                console.error("Comment poll error:", error);
            }
        }
    };

    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            await fetchTaskDetails();
            await fetchExtraData();
            setLoading(false);
        };
        loadInitial();
    }, [taskId, currentWorkspace]);

    useEffect(() => {
        if (taskId) {
            const controller = new AbortController();
            const interval = setInterval(() => {
                fetchCommentsOnly(controller.signal);
            }, 5000); // Relaxed to 5s — reduces unnecessary load
            return () => {
                clearInterval(interval);
                controller.abort(); // Cancel any in-flight request on unmount
            };
        }
    }, [taskId, api]); // eslint-disable-line react-hooks/exhaustive-deps

    // Add Comment (Optimistic)
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        
        const tempId = `temp-${Date.now()}`;
        const optimisticComment = {
            id: tempId,
            content: newComment,
            createdAt: new Date().toISOString(),
            user: { id: user.id, name: user.fullName || user.firstName, image: user.imageUrl }
        };
        
        setComments((prev) => [...prev, optimisticComment]);
        const contentToSend = newComment;
        setNewComment("");

        try {
            const { data } = await api.post('/api/comments', { taskId, content: contentToSend });
            setComments((prev) => prev.map(c => c.id === tempId ? data.comment : c));
        } catch (error) {
            toast.error("Failed to post comment");
            setComments((prev) => prev.filter(c => c.id !== tempId));
        }
    };

    // Subtasks
    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        try {
            const { data } = await api.post('/api/subtasks', { taskId, title: newSubtask });
            setSubtasks((prev) => [...prev, data.subtask]);
            setNewSubtask("");
        } catch (error) {
            toast.error("Failed to add subtask");
        }
    };

    const toggleSubtask = async (id) => {
        try {
            // Optimistic update
            setSubtasks((prev) => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
            await api.patch(`/api/subtasks/${id}`, {});
        } catch (error) {
            // Revert on failure
            setSubtasks((prev) => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
            toast.error("Failed to update subtask");
        }
    };

    const deleteSubtask = async (id) => {
        try {
            setSubtasks((prev) => prev.filter(s => s.id !== id));
            await api.delete(`/api/subtasks/${id}`);
        } catch (error) {
            toast.error("Failed to delete subtask");
            fetchExtraData(); // Reload to fix state
        }
    };

    // Attachments
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            return toast.error("File size must be under 10MB");
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("taskId", taskId);

        try {
            const { data } = await api.post('/api/attachments', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setAttachments((prev) => [data.attachment, ...prev]);
            toast.success("File uploaded");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload file");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const deleteAttachment = async (id) => {
        try {
            setAttachments((prev) => prev.filter(a => a.id !== id));
            await api.delete(`/api/attachments/${id}`);
            toast.success("Attachment removed");
        } catch (error) {
            toast.error("Failed to delete attachment");
            fetchExtraData();
        }
    };

    const getFileIcon = (mimetype) => {
        if (mimetype.startsWith("image/")) return <ImageIcon className="size-5 text-blue-500" />;
        if (mimetype.includes("pdf")) return <FileTextIcon className="size-5 text-red-500" />;
        return <FileIcon className="size-5 text-zinc-500" />;
    };

    if (loading) return <div className="text-zinc-500 dark:text-zinc-400 p-6 flex items-center justify-center h-64">Loading task details...</div>;
    if (!task) return <div className="text-red-500 p-6 text-center">Task not found.</div>;

    const completedSubtasks = subtasks.filter(s => s.done).length;
    const progress = subtasks.length === 0 ? 0 : Math.round((completedSubtasks / subtasks.length) * 100);

    return (
        <div className="flex flex-col lg:flex-row gap-6 text-zinc-900 dark:text-zinc-100 max-w-7xl mx-auto">
            {/* Left Column: Task Info, Subtasks, Attachments */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                
                {/* 1. Main Task Details */}
                <div className="p-6 rounded-xl bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="mb-4">
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-3">{task.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                                {task.status.replace("_", " ")}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-500/20">
                                {task.type}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs font-medium border border-orange-200 dark:border-orange-500/20">
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    {task.description && (
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg">
                            {task.description}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <img src={task.assignee?.image} className="size-8 rounded-full ring-2 ring-white dark:ring-zinc-900" alt="avatar" />
                            <div>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Assignee</p>
                                <p className="text-sm font-medium">{task.assignee?.name || "Unassigned"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                <CalendarIcon className="size-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Due Date</p>
                                <p className="text-sm font-medium">{format(new Date(task.due_date), "MMM d, yyyy")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Subtasks */}
                <div className="p-6 rounded-xl bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
                            <CheckSquare className="size-5 text-blue-500" /> Subtasks
                        </h2>
                        {subtasks.length > 0 && (
                            <span className="text-xs font-medium text-zinc-500">{completedSubtasks}/{subtasks.length} ({progress}%)</span>
                        )}
                    </div>

                    {subtasks.length > 0 && (
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mb-4 overflow-hidden">
                            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    <div className="space-y-2 mb-4">
                        {subtasks.map(sub => (
                            <div key={sub.id} className="flex items-center gap-3 group px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                                <input type="checkbox" checked={sub.done} onChange={() => toggleSubtask(sub.id)} className="size-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 cursor-pointer" />
                                <span className={`flex-1 text-sm transition-all ${sub.done ? 'text-zinc-400 line-through dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-200'}`}>
                                    {sub.title}
                                </span>
                                {sub.createdBy === user?.id && (
                                    <button onClick={() => deleteSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all">
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-2">
                        <input 
                            type="text" 
                            value={newSubtask} 
                            onChange={(e) => setNewSubtask(e.target.value)} 
                            placeholder="Add a new subtask..." 
                            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        />
                        <button type="submit" disabled={!newSubtask.trim()} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition disabled:opacity-50">
                            <Plus className="size-5" />
                        </button>
                    </form>
                </div>

                {/* 3. Attachments */}
                <div className="p-6 rounded-xl bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
                            <Paperclip className="size-5 text-purple-500" /> Attachments
                        </h2>
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-xs font-medium flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50 text-zinc-700 dark:text-zinc-300">
                            {uploading ? <span className="animate-pulse">Uploading...</span> : <><UploadCloud className="size-3.5" /> Upload File</>}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attachments.length === 0 ? (
                            <div className="col-span-full py-6 text-center text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                                No attachments yet.
                            </div>
                        ) : (
                            attachments.map(att => (
                                <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition group relative overflow-hidden">
                                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                        {getFileIcon(att.fileType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate block hover:text-blue-500 transition">
                                            {att.fileName}
                                        </a>
                                        <p className="text-xs text-zinc-500 mt-0.5">{(att.fileSize / 1024).toFixed(1)} KB</p>
                                    </div>
                                    {att.uploadedBy === user?.id && (
                                        <button onClick={() => deleteAttachment(att.id)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-md shadow-sm transition-all border border-zinc-200 dark:border-zinc-700">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Right Column: Discussion / Comments */}
            <div className="w-full lg:w-1/2">
                <div className="p-6 rounded-xl bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[600px] sticky top-6">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-zinc-900 dark:text-white pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <MessageCircle className="size-5 text-green-500" /> Discussion
                        <span className="ml-auto text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-500">{comments.length} comments</span>
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar mb-4">
                        {comments.length > 0 ? (
                            comments.map((comment) => {
                                const isMine = comment.user?.id === user?.id;
                                return (
                                    <div key={comment.id} className={`flex flex-col max-w-[85%] ${isMine ? "ml-auto items-end" : "mr-auto items-start"}`}>
                                        <div className={`flex items-center gap-2 mb-1.5 ${isMine ? "flex-row-reverse" : ""}`}>
                                            <img src={comment.user?.image} alt="avatar" className="size-5 rounded-full" />
                                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{comment.user?.name}</span>
                                            <span className="text-[10px] text-zinc-400">{format(new Date(comment.createdAt), "MMM d, h:mm a")}</span>
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm prose prose-sm dark:prose-invert max-w-none ${isMine ? "bg-blue-600 text-white rounded-tr-sm prose-a:text-blue-200" : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-sm"}`}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {comment.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <MessageCircle className="size-12 text-zinc-400 mb-3" />
                                <p className="text-sm font-medium text-zinc-500">No comments yet</p>
                                <p className="text-xs text-zinc-400 mt-1">Start the discussion below.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Support markdown (e.g. **bold**, *italic*, `code`)..."
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-24"
                                rows={3}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        handleAddComment();
                                    }
                                }}
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                <button onClick={handleAddComment} disabled={!newComment.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm">
                                    Post
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-2 text-right">Press <kbd className="font-sans px-1 rounded bg-zinc-100 dark:bg-zinc-800">Cmd</kbd> + <kbd className="font-sans px-1 rounded bg-zinc-100 dark:bg-zinc-800">Enter</kbd> to post</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TaskDetails;
