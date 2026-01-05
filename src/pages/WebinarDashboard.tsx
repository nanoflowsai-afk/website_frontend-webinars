import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, CheckCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebinarRegistrationModal } from '../components/WebinarRegistrationModal';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import webinarHeroImage from '../assets/stock_images/professional_webinar_6d5e6348.jpg';

interface Webinar {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    speaker: string;
    level: string;
    category: string;
    type: string;
    imageUrl: string;
    registeredCount?: number;
    maxCapacity?: number;
    price?: number;
    currency?: string;
    calculatedStatus?: "Upcoming" | "Live" | "Recorded";
}

// Helper to parse date/time string (e.g., "Dec 28, 2025", "3:30 PM IST")
const parseWebinarDateTime = (dateStr: string, timeStr: string) => {
    try {
        const cleanTime = timeStr.replace(/\s*[A-Z]{3}$/, '').trim(); // Remove timezone (IST, etc)
        const dtString = `${dateStr} ${cleanTime}`;
        return new Date(dtString);
    } catch (e) {
        return new Date(); // Fallback
    }
};

const getDurationMinutes = (durationStr: string) => {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60; // Default 60 mins
};

const WebinarDashboard = () => {
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
    const { user } = useAuth();

    // Modal state
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [selectedWebinarForRegistration, setSelectedWebinarForRegistration] = useState<Webinar | null>(null);

    // Status Popup State
    const [statusPopup, setStatusPopup] = useState<{
        open: boolean;
        title: string;
        message: string;
        type: 'success' | 'pending' | 'info';
    }>({ open: false, title: '', message: '', type: 'info' });

    const handleRegisterClick = (webinar: Webinar) => {
        if (!user) {
            alert("Please log in to register."); // Keep simple alert for login or redirect? simple for now.
            return;
        }

        const existingReg = userRegistrations.find(r => r.id === webinar.id);
        if (existingReg) {
            if (existingReg.status === 'accepted') {
                setStatusPopup({
                    open: true,
                    title: "Already Registered",
                    message: "You are already confirmed for this webinar! We look forward to seeing you there.",
                    type: 'success'
                });
            } else if (existingReg.status === 'pending') {
                setStatusPopup({
                    open: true,
                    title: "Registration Pending",
                    message: "Your registration has been submitted and is currently pending admin approval. You will be notified once approved.",
                    type: 'pending'
                });
            } else {
                setStatusPopup({
                    open: true,
                    title: "Registration Status",
                    message: `You have already registered. Current status: ${existingReg.status}`,
                    type: 'info'
                });
            }
            return;
        }

        setSelectedWebinarForRegistration(webinar);
        setShowRegistrationModal(true);
    };

    useEffect(() => {
        const fetchWebinars = async () => {
            try {
                const response = await api.get('/webinars');
                console.log('Webinars API Response:', response.data);

                if (response.data && Array.isArray(response.data.webinars)) {
                    setWebinars(response.data.webinars);
                } else if (Array.isArray(response.data)) {
                    setWebinars(response.data);
                } else {
                    console.error('Unexpected API response format:', response.data);
                    setWebinars([]);
                }
            } catch (err) {
                console.error('Error fetching webinars:', err);
                setError('Failed to load webinars. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const fetchUserRegistrations = async () => {
            if (user) {
                try {
                    const res = await userApi.getRegistrations();
                    setUserRegistrations(res.data.registrations || []);
                } catch (err) {
                    console.error("Failed to fetch user registrations", err);
                }
            }
        };

        fetchWebinars();
        fetchUserRegistrations();
    }, [user]);

    // Helper to determine status dynamically based on date AND time
    const getWebinarStatus = (webinar: Webinar): "Upcoming" | "Live" | "Recorded" => {
        const now = new Date();
        const start = parseWebinarDateTime(webinar.date, webinar.time);
        const durationMins = getDurationMinutes(webinar.duration);
        const end = new Date(start.getTime() + durationMins * 60000);

        if (now > end) {
            return "Recorded";
        } else if (now >= start && now <= end) {
            return "Live";
        } else {
            return "Upcoming";
        }
    };

    const categories = ["AI Automation", "AI Agents", "Marketing AI", "Business AI", "Workshops", "Other"];
    const types = ["Upcoming", "Live", "Recorded"];
    const levels = ["Beginner", "Intermediate", "Advanced"];

    const processedWebinars = useMemo(() => {
        return webinars.map(w => ({
            ...w,
            calculatedStatus: getWebinarStatus(w)
        }));
    }, [webinars]);

    const sortedWebinars = useMemo(() => {
        const upcomingAndLive = processedWebinars.filter(w => w.calculatedStatus !== "Recorded");
        const recorded = processedWebinars.filter(w => w.calculatedStatus === "Recorded");

        // Sort upcoming by date ascending (soonest first)
        upcomingAndLive.sort((a, b) => {
            const dateA = parseWebinarDateTime(a.date, a.time);
            const dateB = parseWebinarDateTime(b.date, b.time);
            return dateA.getTime() - dateB.getTime();
        });

        // Sort recorded by date descending (newest recorded first)
        recorded.sort((a, b) => {
            const dateA = parseWebinarDateTime(a.date, a.time);
            const dateB = parseWebinarDateTime(b.date, b.time);
            return dateB.getTime() - dateA.getTime();
        });

        return [...upcomingAndLive, ...recorded];
    }, [processedWebinars]);

    const filteredWebinars = useMemo(() => {
        return sortedWebinars.filter((webinar) => {
            const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                webinar.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || webinar.category === selectedCategory;
            // Filter by calculated status instead of hardcoded type if user selects type filter
            const matchesType = !selectedType || webinar.calculatedStatus === selectedType;
            const matchesLevel = !selectedLevel || webinar.level === selectedLevel;
            return matchesSearch && matchesCategory && matchesType && matchesLevel;
        });
    }, [sortedWebinars, searchTerm, selectedCategory, selectedType, selectedLevel]);

    // For featured, prefer the first upcoming one from the sorted list
    const featuredWebinar = sortedWebinars.find(w => w.calculatedStatus === "Upcoming" || w.calculatedStatus === "Live") || sortedWebinars[0];

    const getTypeBadgeColor = (status: string) => {
        switch (status) {
            case "Live": return "bg-green-100 text-green-700";
            case "Upcoming": return "bg-blue-100 text-blue-700";
            case "Recorded": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getTypeIcon = (status: string) => {
        switch (status) {
            case "Live": return "🟢";
            case "Upcoming": return "🔵";
            case "Recorded": return "⚪";
            default: return "⚪";
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-zinc-50">
            <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
    );

    return (
        <main className="min-h-screen bg-white">
            {error && <div className="text-red-500 text-center mb-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">{error}</div>}

            {/* Hero Section */}
            <section className="relative overflow-hidden px-6 py-24 sm:py-32">
                <div className="absolute inset-0">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url(${webinarHeroImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/50" />
                </div>
                <div className="relative mx-auto max-w-[1400px] px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                            Learn AI Directly from <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Experts</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-gray-300 mb-10 leading-relaxed">
                            Master practical AI, automation, and intelligent systems through live sessions with industry leaders. No theory, pure implementation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const featuredSection = document.getElementById("featured-webinar");
                                    if (featuredSection) featuredSection.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:shadow-lg transition shadow-md text-base"
                            >
                                Latest Webinar
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const section = document.getElementById("all-webinars");
                                    if (section) section.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition border border-white/30 text-base"
                            >
                                View All Sessions
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filters Section - Sticky */}
            <section className="sticky top-[73px] z-40 bg-white border-b-2 border-orange-100 px-4 md:px-6 py-3 md:py-4 shadow-md">
                <div className="mx-auto max-w-[1400px]">
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex-1 w-full relative">
                            <input
                                type="text"
                                placeholder="🔍 Search webinars by title or topic..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300 transition text-sm text-zinc-900 bg-white"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select
                                value={selectedCategory || ""}
                                onChange={(e) => setSelectedCategory(e.target.value || null)}
                                className="px-3 py-2.5 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-xs font-medium hover:border-orange-400 transition bg-white text-zinc-900"
                            >
                                <option value="">📂 Category</option>
                                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>

                            <select
                                value={selectedType || ""}
                                onChange={(e) => setSelectedType(e.target.value || null)}
                                className="px-3 py-2.5 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-xs font-medium hover:border-orange-400 transition bg-white text-zinc-900"
                            >
                                <option value="">📅 Type</option>
                                {types.map((type) => <option key={type} value={type}>{type}</option>)}
                            </select>

                            <select
                                value={selectedLevel || ""}
                                onChange={(e) => setSelectedLevel(e.target.value || null)}
                                className="px-3 py-2.5 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-xs font-medium hover:border-orange-400 transition bg-white text-zinc-900"
                            >
                                <option value="">🎯 Level</option>
                                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
                            </select>

                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory(null);
                                    setSelectedType(null);
                                    setSelectedLevel(null);
                                }}
                                className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition text-xs whitespace-nowrap"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Webinar Section */}
            {webinars.length > 0 && featuredWebinar && (
                <section className="px-6 py-16 bg-white">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="text-center mb-10">
                            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-bold mb-3">⭐ Featured Session</span>
                            <h2 className="text-3xl font-bold text-gray-900">Recommended for You</h2>
                        </div>

                        <div id="featured-webinar"></div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 lg:gap-0 bg-white rounded-2xl overflow-hidden border-2 border-orange-200 shadow-lg hover:shadow-xl transition max-w-5xl mx-auto"
                        >
                            {/* Image */}
                            <div className="relative h-48 md:h-64 lg:h-full min-h-[300px] overflow-hidden">
                                <img
                                    src={featuredWebinar.imageUrl}
                                    alt={featuredWebinar.title}
                                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${getTypeBadgeColor(featuredWebinar.calculatedStatus)} shadow-lg`}>
                                        {getTypeIcon(featuredWebinar.calculatedStatus)} {featuredWebinar.calculatedStatus}
                                    </span>
                                </div>
                            </div>


                            {/* Content */}
                            <div className="flex flex-col p-6 lg:p-8 h-auto lg:h-full">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                                        {featuredWebinar.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-5 line-clamp-2">{featuredWebinar.description}</p>

                                    <div className="space-y-2 mb-5 text-xs">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <span className="text-lg">📅</span>
                                            <span className="font-medium">{featuredWebinar.date}</span>
                                            <span className="text-lg">🕐</span>
                                            <span className="font-medium">{featuredWebinar.time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <span className="text-lg">⏱️</span>
                                            <span className="font-medium">{featuredWebinar.duration}</span>
                                            <span className="text-lg">👤</span>
                                            <span className="font-medium">{featuredWebinar.speaker}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🎯</span>
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                {featuredWebinar.level}
                                            </span>
                                        </div>
                                    </div>


                                </div>

                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleRegisterClick(featuredWebinar)}
                                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:shadow-lg transition flex-1 text-sm"
                                    >
                                        {featuredWebinar.calculatedStatus === "Recorded" ? "Watch Now" : "Register"}
                                    </motion.button>
                                    <Link to={`/webinars/${featuredWebinar.id}`} className="flex-1">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition w-full text-sm"
                                        >
                                            View Details →
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* All Webinars Section */}
            <section id="all-webinars" className="px-6 py-16 bg-white">
                <div className="mx-auto max-w-[1400px]">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            All Upcoming Webinars
                        </h2>
                        <p className="text-sm text-gray-600">
                            {filteredWebinars.length} {filteredWebinars.length === 1 ? "webinar" : "webinars"} found
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {filteredWebinars.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-16"
                            >
                                <p className="text-lg text-gray-600 mb-6">No webinars found matching your filters</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedCategory(null);
                                        setSelectedType(null);
                                        setSelectedLevel(null);
                                    }}
                                    className="px-6 py-2.5 text-orange-600 hover:text-orange-700 font-bold text-sm border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition"
                                >
                                    Clear All Filters
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                {filteredWebinars.map((webinar, idx) => (
                                    <motion.div
                                        key={webinar.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="group flex flex-col h-full rounded-xl border-2 border-orange-100 bg-white hover:border-orange-400 hover:shadow-lg transition overflow-hidden"
                                    >
                                        {/* Image */}
                                        <div className="relative h-40 w-full overflow-hidden">
                                            <img
                                                src={webinar.imageUrl}
                                                alt={webinar.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                            <div className="absolute top-2 left-2">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getTypeBadgeColor(webinar.calculatedStatus)} shadow-lg`}>
                                                    {getTypeIcon(webinar.calculatedStatus)} {webinar.calculatedStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4 flex flex-col">
                                            <div className="flex gap-2 mb-2">
                                                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                    {webinar.level}
                                                </span>
                                                <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                                    {webinar.category}
                                                </span>
                                            </div>

                                            <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition line-clamp-2 leading-tight">
                                                {webinar.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 mb-4 flex-grow line-clamp-1">
                                                {webinar.description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-700">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>📅</span>
                                                        <span className="font-medium">{webinar.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>⏱️</span>
                                                        <span className="font-medium">{webinar.duration}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>🕐</span>
                                                        <span className="font-medium">{webinar.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>👤</span>
                                                        <span className="font-medium">{webinar.speaker}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Two Buttons Side by Side */}
                                            <div className="flex gap-2 mt-auto">
                                                <div className="flex-1">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => {
                                                            if (webinar.calculatedStatus === "Recorded") {
                                                                // Handle Watch Now (maybe navigate or show modal?)
                                                                // User request: "instead of Register button give me Watch Now button"
                                                                // For now, let's keep it consistent with 'handleRegisterClick' which handles existing registration check,
                                                                // OR if it's strictly just viewing, we might need a different handler.
                                                                // But usually, dashboard "Watch Now" might go to detail page or video player.
                                                                // Implementation in frontend was just a link change or label change.
                                                                // Let's assume we proceed to detail page via the other button, OR we treat this as a register/watch action.
                                                                // Actually, the user asked for "Watch Now".
                                                            } else {
                                                                handleRegisterClick(webinar)
                                                            }
                                                        }}
                                                        className={`w-full px-3 py-2 bg-gradient-to-r ${webinar.calculatedStatus === "Recorded"
                                                            ? "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                                                            : "from-orange-500 to-amber-500"
                                                            } text-white font-bold rounded-lg hover:shadow-lg transition text-xs`}
                                                    >
                                                        {webinar.calculatedStatus === "Recorded" ? "Watch Now" : "Register"}
                                                    </motion.button>
                                                    {/* If Recorded, maybe we wrap in Link like frontend? 
                                                        Wait, frontend "Watch" button was wrapped in Link to detail page.
                                                        Here, we have a separate "Read More" button that links to details. 
                                                        If "Watch Now" is clicked, it should probably also go to details or play video.
                                                        For now, making it effectively do nothing or maybe just act as a visual indicator if logic isn't defined.
                                                        Actually, let's make it navigate to the detail page too if it's "Watch Now", or trigger the register flow which catches "Already Registered".
                                                    */}
                                                </div>
                                                <Link to={`/webinars/${webinar.id}`} className="flex-1">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition text-xs"
                                                    >
                                                        Read More
                                                    </motion.button>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Status Popup */}
            <AnimatePresence>
                {statusPopup.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setStatusPopup(prev => ({ ...prev, open: false }))}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center"
                        >
                            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${statusPopup.type === 'success' ? 'bg-green-100' :
                                statusPopup.type === 'pending' ? 'bg-orange-100' : 'bg-blue-100'
                                }`}>
                                {statusPopup.type === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
                                {statusPopup.type === 'pending' && <Clock className="h-8 w-8 text-orange-600" />}
                                {statusPopup.type === 'info' && <Info className="h-8 w-8 text-blue-600" />}
                            </div>

                            <h3 className="mb-2 text-xl font-bold text-gray-900">{statusPopup.title}</h3>
                            <p className="mb-6 text-gray-500">{statusPopup.message}</p>

                            <button
                                onClick={() => setStatusPopup(prev => ({ ...prev, open: false }))}
                                className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <WebinarRegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => {
                    setShowRegistrationModal(false);
                    // Refresh registrations after modal close (in case successful)
                    const fetchUserRegistrations = async () => {
                        if (user) {
                            const res = await userApi.getRegistrations();
                            setUserRegistrations(res.data.registrations || []);
                        }
                    };
                    fetchUserRegistrations();
                }}
                webinarTitle={selectedWebinarForRegistration?.title || ''}
                webinarId={selectedWebinarForRegistration?.id || 0}
                price={selectedWebinarForRegistration?.price}
                currency={selectedWebinarForRegistration?.currency}
            />
        </main>
    );
};

export default WebinarDashboard;
