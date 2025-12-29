import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";
import { userApi } from "../services/api";

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Poll every 30s
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await userApi.getNotifications();
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.notifications.filter((n: any) => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleMarkRead = async (id: number) => {
        try {
            await userApi.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">NanoFlows</span>
                    <span className="hidden sm:inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">Webinar Portal</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden rounded-lg p-2 text-gray-700 transition hover:bg-orange-50"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {mobileOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
                        <Link to="/" className="transition hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg">All Webinars</Link>
                        {user && (
                            <Link to="/registrations" className="transition hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg">My Registrations</Link>
                        )}
                    </nav>

                    <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {/* Notification Bell */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => {
                                            if (!showNotifications) {
                                                // If opening, mark all as read locally and on server
                                                setUnreadCount(0);
                                                userApi.markAllNotificationsRead().catch(console.error);
                                            }
                                            setShowNotifications(!showNotifications);
                                        }}
                                        className="relative p-2 text-gray-500 hover:text-orange-500 transition rounded-full hover:bg-orange-50"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-100 z-50">
                                            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                                <span className="text-xs text-gray-500">{unreadCount} unread</span>
                                            </div>
                                            <div className="max-h-[320px] overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-500 text-sm">
                                                        No notifications yet.
                                                    </div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            onClick={!n.isRead ? () => handleMarkRead(n.id) : undefined}
                                                            className={`relative border-b border-gray-50 p-4 transition hover:bg-gray-50 ${!n.isRead ? 'bg-orange-50/30' : ''}`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? 'bg-orange-500' : 'bg-transparent'}`} />
                                                                <div className="flex-1">
                                                                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                                        {n.message}
                                                                    </p>
                                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-500 group">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs">
                                        {user.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="hidden xl:inline">{user.name}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-sm font-medium text-gray-500 hover:text-red-500 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-orange-600">Sign In</Link>
                                <Link
                                    to="/register"
                                    className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-orange-500/40"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-4">
                    <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 rounded-lg">All Webinars</Link>
                    {user && (
                        <Link to="/registrations" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 rounded-lg">My Registrations</Link>
                    )}
                    <div className="border-t border-gray-100 pt-4 mt-2">
                        {user ? (
                            <>
                                <div className="px-4 py-2 text-sm text-gray-500">Signed in as <span className="font-semibold text-gray-900">{user.name}</span></div>
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 px-4">
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full text-center py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg">Sign In</Link>
                                <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full text-center py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
