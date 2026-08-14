import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCircle2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAsRead, markAllAsRead } from "../features/notificationSlice";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { notifications, unreadCount } = useSelector((state) => state.notification);
    const dropdownRef = useRef(null);

    useEffect(() => {
        dispatch(fetchNotifications({ getToken }));
    }, [dispatch, getToken]);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            dispatch(markAsRead({ id: notification.id, getToken }));
        }
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead({ getToken }));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
            >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-950"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50">
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                <Check className="size-3" /> Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                <Bell className="size-8 mx-auto mb-2 opacity-20" />
                                No notifications yet
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-3 text-left border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition ${
                                            !n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {!n.read ? (
                                                    <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></div>
                                                ) : (
                                                    <CheckCircle2 className="size-4 mt-0.5 text-zinc-300 dark:text-zinc-700" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
