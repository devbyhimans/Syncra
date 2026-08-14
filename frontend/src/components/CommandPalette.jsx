import { useState, useEffect, useRef } from "react";
import { Search, Command, FileText, Folder, Users, X } from "lucide-react";
import Fuse from "fuse.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const currentWorkspace = useSelector((state) => state.workspace.currentWorkspace);

    // Prepare searchable data from current workspace
    const searchableItems = [];
    if (currentWorkspace) {
        currentWorkspace.projects.forEach((p) => {
            searchableItems.push({
                type: "Project",
                id: p.id,
                title: p.name,
                description: p.description,
                icon: Folder,
                link: `/projectsDetail?projectId=${p.id}`,
            });
            p.tasks.forEach((t) => {
                searchableItems.push({
                    type: "Task",
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    icon: FileText,
                    link: `/taskDetails?projectId=${p.id}&taskId=${t.id}`,
                });
            });
        });
        currentWorkspace.members.forEach((m) => {
            searchableItems.push({
                type: "Member",
                id: m.userId,
                title: m.user.name || m.user.email,
                description: m.user.email,
                icon: Users,
                link: `/team`, // Can link to team page or member profile if added later
            });
        });
    }

    const fuse = new Fuse(searchableItems, {
        keys: ["title", "description"],
        threshold: 0.3,
    });

    const results = query ? fuse.search(query).map(r => r.item) : searchableItems.slice(0, 5);

    // Keyboard shortcut to open Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 50);
            setQuery("");
        }
    }, [isOpen]);

    const handleSelect = (link) => {
        setIsOpen(false);
        navigate(link);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors w-64"
            >
                <Search className="size-4" />
                <span className="flex-1 text-left">Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    <Command className="size-3" /> K
                </kbd>
            </button>

            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
            >
                <Search className="size-5" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 sm:px-0">
                    <div 
                        className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm" 
                        onClick={() => setIsOpen(false)} 
                    />
                    
                    <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all">
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                            <Search className="size-5 text-zinc-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 bg-transparent px-3 py-1 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 text-lg"
                                placeholder="Search tasks, projects, or people..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Results list */}
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {results.length > 0 ? (
                                <div className="space-y-1">
                                    {results.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={`${item.type}-${item.id}-${idx}`}
                                                onClick={() => handleSelect(item.link)}
                                                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left"
                                            >
                                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">
                                                    <Icon className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate mt-0.5">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-14 text-center">
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">No results found for "{query}"</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-sans">↑</kbd>
                                <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-sans">↓</kbd>
                                to navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-sans">↵</kbd>
                                to select
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
