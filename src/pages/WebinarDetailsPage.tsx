import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebinarRegistrationModal } from '../components/WebinarRegistrationModal';
import { userApi } from '../services/api';

const WebinarDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [webinar, setWebinar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Status Popup State
    const [statusPopup, setStatusPopup] = useState<{
        open: boolean;
        title: string;
        message: string;
        type: 'success' | 'pending' | 'info';
    }>({ open: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        const fetchWebinar = async () => {
            try {
                console.log('Fetching webinar details for ID:', id);
                const response = await api.get(`/webinars/${id}`);
                console.log('Webinar API response:', response);
                const data = response.data.webinar;

                // Normalize roadmap items just like the reference code
                const normalizedWebinar = {
                    ...data,
                    roadmapItems: (data.roadmapItems || [])
                        .filter((item: any, index: number, self: any[]) =>
                            index === self.findIndex((t) => t.day === item.day)
                        )
                        .map((item: any) => ({
                            ...item,
                            description: Array.isArray(item.description) ? item.description : (typeof item.description === 'string' ? JSON.parse(item.description) : [])
                        }))
                        .sort((a: any, b: any) => a.day - b.day)
                };

                setWebinar(normalizedWebinar);
            } catch (err) {
                console.error(err);
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

        if (id) fetchWebinar();
        fetchUserRegistrations();
    }, [id, user]);

    const handleRegister = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const existingReg = userRegistrations.find(r => r.webinarId === webinar.id || r.id === webinar.id);
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

        setShowRegistrationModal(true);
    };

    if (loading) return <div className="flex justify-center p-20 h-screen items-center bg-gray-50"><Loader2 className="animate-spin text-orange-500" /></div>;
    if (!webinar) return <div className="p-20 text-center text-gray-800">Webinar not found</div>;

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <section className="px-6 py-20 text-gray-900 relative" style={{
                backgroundImage: `url('${webinar.heroImage || webinar.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}>
                <div className="absolute inset-0 bg-black/70"></div>
                <div className="mx-auto max-w-[1200px] relative z-10 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 mb-8 text-sm"
                    >
                        <Link to="/webinars" className="hover:text-orange-300 transition">Webinars</Link>
                        <span>/</span>
                        <span className="text-orange-300 font-semibold">{webinar.title}</span>
                    </motion.div>

                    <div className="text-center mb-12">
                        {webinar.heroContext && (
                            <p className="text-white mb-4 text-sm font-semibold uppercase tracking-wider">{webinar.heroContext}</p>
                        )}
                        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{webinar.heroTitle || webinar.title}</span>
                        </h1>
                        <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                            {webinar.heroSubtitle}
                        </h2>

                        <button
                            onClick={handleRegister}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transition duration-300"
                        >
                            📋 Apply To Get Business Automation Event
                        </button>
                    </div>
                </div>
            </section>

            {/* Upcoming/Info Section */}
            <section className="px-6 py-20 bg-white text-gray-900">
                <div className="mx-auto max-w-[1200px]">
                    <div className="p-4 md:p-8 bg-white border-2 border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition mx-auto w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="flex gap-2 mb-4">
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">{webinar.category}</span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{webinar.level}</span>
                                </div>
                                <h2 className="text-3xl font-black leading-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    {webinar.title}
                                </h2>
                                <p className="text-gray-600 leading-relaxed">{webinar.description}</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: '📅', label: 'Date', value: webinar.date, bg: 'bg-orange-50', border: 'border-orange-200' },
                                        { icon: '🕐', label: 'Time', value: webinar.time, bg: 'bg-blue-50', border: 'border-blue-200' },
                                        { icon: '📡', label: 'Platform', value: webinar.platform || 'Online', bg: 'bg-purple-50', border: 'border-purple-200' },
                                        { icon: '🎤', label: 'Speaker', value: webinar.speaker || webinar.mentorName, bg: 'bg-green-50', border: 'border-green-200' }
                                    ].map((item, idx) => (
                                        <div key={idx} className={`p-4 ${item.bg} border-2 ${item.border} rounded-xl text-center shadow-sm`}>
                                            <p className="text-2xl mb-1">{item.icon}</p>
                                            <p className="text-xs text-gray-500 font-bold uppercase">{item.label}</p>
                                            <p className="text-sm font-bold text-gray-900">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleRegister}
                                    className="w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                                >
                                    🎯 Apply To Get Invite
                                </button>
                            </div>

                            <div className="hidden lg:block relative rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden">
                                <img src={webinar.imageUrl} alt={webinar.title} className="w-full h-auto object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <section className="px-6 py-10 bg-gradient-to-b from-white via-gray-50 to-white">
                <div className="mx-auto max-w-[1200px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-16 text-center">
                        Event <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Roadmap</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(webinar.roadmapItems || []).map((item: any, idx: number) => {
                            // Define color themes
                            const themes = [
                                { // Theme 1 (Orange) - Day 1, 4, 7...
                                    header: "from-orange-500 to-amber-500",
                                    subtitle: "text-orange-100",
                                    body: "from-orange-50 to-white",
                                    highlightText: "text-orange-700",
                                    highlightBg: "bg-orange-100",
                                },
                                { // Theme 2 (Blue) - Day 2, 5, 8...
                                    header: "from-blue-600 to-blue-400",
                                    subtitle: "text-blue-100",
                                    body: "from-blue-50 to-white",
                                    highlightText: "text-blue-700",
                                    highlightBg: "bg-blue-100",
                                },
                                { // Theme 3 (Red) - Day 3, 6, 9...
                                    header: "from-red-600 to-red-500",
                                    subtitle: "text-red-100",
                                    body: "from-red-50 to-white",
                                    highlightText: "text-red-700",
                                    highlightBg: "bg-red-100",
                                }
                            ];

                            const colors = themes[idx % themes.length];

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col"
                                >
                                    <div className={`bg-gradient-to-r ${colors.header} text-white text-center py-4`}>
                                        <div className="text-3xl font-black mb-2">Day {item.day}</div>
                                        <h3 className="text-sm font-black text-white/90">{item.title}</h3>
                                    </div>
                                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />}
                                    <div className={`p-5 space-y-3 bg-gradient-to-b ${colors.body} flex-1`}>
                                        <p className={`text-xs ${colors.highlightText} font-bold text-center mb-4 ${colors.highlightBg} rounded-lg py-2`}>{item.highlight}</p>
                                        {(item.description || []).map((desc: string, i: number) => (
                                            <p key={i} className="text-xs text-gray-700 font-medium flex gap-2">
                                                <span>✅</span> {desc}
                                            </p>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Meet Your Mentor Section */}
            <section className="px-6 py-10 bg-white">
                <div className="mx-auto max-w-[1000px]">
                    <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">
                        Meet Your <span className="text-orange-600">Mentor</span>
                    </h2>

                    <div className="bg-white border-2 border-orange-100 rounded-2xl p-6 md:p-10 shadow-lg flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                        {/* Mentor Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="flex-shrink-0"
                        >
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-orange-100 p-2 relative">
                                <div className="absolute inset-0 border-2 border-orange-500 rounded-full border-dashed animate-spin-slow"></div>
                                <img
                                    src={webinar.mentorImage || webinar.speakerImage || "https://via.placeholder.com/150"}
                                    alt={webinar.mentorName}
                                    className="w-full h-full object-cover rounded-full shadow-md"
                                />
                            </div>
                        </motion.div>

                        {/* Mentor Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex-1 text-center md:text-left"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{webinar.mentorName || webinar.speaker}</h3>
                            <div className="mb-6">
                                <p className="text-xs text-gray-700 mb-1">{webinar.mentorRole || "Host"} - <span className="text-orange-600 font-bold">{webinar.mentorName || webinar.speaker}</span></p>
                            </div>

                            <div className="text-xs text-gray-700 space-y-4 whitespace-pre-wrap">
                                {webinar.mentorBio || "Bio not available."}
                            </div>
                        </motion.div>
                    </div>
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
                    // Refresh registrations after modal close
                    const fetchUserRegistrations = async () => {
                        if (user) {
                            const res = await userApi.getRegistrations();
                            setUserRegistrations(res.data.registrations || []);
                        }
                    };
                    fetchUserRegistrations();
                }}
                webinarTitle={webinar?.title}
                webinarId={webinar?.id}
            />
        </main>
    );
};

export default WebinarDetailsPage;
