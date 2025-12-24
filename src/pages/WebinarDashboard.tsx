import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebinarRegistrationModal } from '../components/WebinarRegistrationModal';
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
}

const WebinarDashboard = () => {
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    // Modal state
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [selectedWebinarForRegistration, setSelectedWebinarForRegistration] = useState<Webinar | null>(null);

    const handleRegisterClick = (webinar: Webinar) => {
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

        fetchWebinars();
    }, []);

    const categories = ["AI Automation", "AI Agents", "Marketing AI", "Business AI", "Workshops", "Other"];
    const types = ["Upcoming", "Live", "Recorded"];
    const levels = ["Beginner", "Intermediate", "Advanced"];

    const filteredWebinars = useMemo(() => {
        return webinars.filter((webinar) => {
            const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                webinar.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || webinar.category === selectedCategory;
            const matchesType = !selectedType || webinar.type === selectedType;
            const matchesLevel = !selectedLevel || webinar.level === selectedLevel;
            return matchesSearch && matchesCategory && matchesType && matchesLevel;
        });
    }, [webinars, searchTerm, selectedCategory, selectedType, selectedLevel]);

    const upcomingWebinars = filteredWebinars.filter((w) => w.type === "Upcoming");
    const featuredWebinar = upcomingWebinars[0] || webinars[0];

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case "Live": return "bg-green-100 text-green-700";
            case "Upcoming": return "bg-blue-100 text-blue-700";
            case "Recorded": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
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
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-2xl overflow-hidden border-2 border-orange-200 shadow-lg hover:shadow-xl transition max-w-5xl mx-auto"
                        >
                            {/* Image */}
                            <div className="relative h-48 md:h-64 lg:h-96 overflow-hidden rounded-xl">
                                <img
                                    src={featuredWebinar.imageUrl}
                                    alt={featuredWebinar.title}
                                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${getTypeBadgeColor(featuredWebinar.type)} shadow-lg`}>
                                        {getTypeIcon(featuredWebinar.type)} {featuredWebinar.type}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col justify-between p-6 lg:p-8 h-auto lg:h-96">
                                <div className="flex-1">
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

                                    {featuredWebinar.registeredCount && featuredWebinar.maxCapacity && (
                                        <div className="mb-4">
                                            <p className="text-gray-600 font-semibold text-xs mb-1">
                                                🔥 {featuredWebinar.registeredCount} people registered
                                            </p>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full transition-all"
                                                    style={{
                                                        width: `${(featuredWebinar.registeredCount / featuredWebinar.maxCapacity) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleRegisterClick(featuredWebinar)}
                                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:shadow-lg transition flex-1 text-sm"
                                    >
                                        {featuredWebinar.type === "Recorded" ? "Watch Now" : "Details"}
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
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getTypeBadgeColor(webinar.type)} shadow-lg`}>
                                                    {getTypeIcon(webinar.type)} {webinar.type}
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
                                                        onClick={() => handleRegisterClick(webinar)}
                                                        className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:shadow-lg transition text-xs"
                                                    >
                                                        {webinar.type === "Recorded" ? "Watch Now" : "Register"}
                                                    </motion.button>
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

            {selectedWebinarForRegistration && (
                <WebinarRegistrationModal
                    isOpen={showRegistrationModal}
                    onClose={() => setShowRegistrationModal(false)}
                    webinarTitle={selectedWebinarForRegistration.title}
                    webinarId={selectedWebinarForRegistration.id}
                />
            )}
        </main>
    );
};

export default WebinarDashboard;
