import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface WebinarCardProps {
    webinar: {
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
    };
    isAuthenticated: boolean;
    onRegisterClick?: () => void;
}

const getTypeBadgeColor = (type: string) => {
    switch (type) {
        case "Live":
            return "bg-green-100 text-green-700";
        case "Upcoming":
            return "bg-blue-100 text-blue-700";
        case "Recorded":
            return "bg-gray-100 text-gray-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case "Live":
            return "🟢";
        case "Upcoming":
            return "🔵";
        case "Recorded":
            return "⚪";
        default:
            return "⚪";
    }
};

const WebinarCard = ({ webinar, onRegisterClick }: WebinarCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col h-full rounded-xl border-2 border-orange-100 bg-white hover:border-orange-400 hover:shadow-lg transition overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-40 w-full overflow-hidden">
                <img
                    src={webinar.imageUrl || 'https://via.placeholder.com/800x600'}
                    alt={webinar.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getTypeBadgeColor(webinar.type)} shadow-lg`}>
                        {getTypeIcon(webinar.type)} {webinar.type}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-lg ${webinar.price && webinar.price > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {webinar.price && webinar.price > 0 ? `₹${webinar.price}` : 'Free'}
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
                    <Link to={`/webinars/${webinar.id}`} className="flex-1">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                if (webinar.type !== "Recorded" && onRegisterClick) {
                                    e.preventDefault();
                                    onRegisterClick();
                                }
                            }}
                            className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:shadow-lg transition text-xs"
                        >
                            {webinar.type === "Recorded" ? "Watch" : "Register"}
                        </motion.button>
                    </Link>
                    <Link to={`/webinars/${webinar.id}`} className="flex-1">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition text-xs"
                        >
                            Know More
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default WebinarCard;
