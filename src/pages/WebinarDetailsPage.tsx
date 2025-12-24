import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { WebinarRegistrationModal } from '../components/WebinarRegistrationModal';

const WebinarDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [webinar, setWebinar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

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
        if (id) fetchWebinar();
    }, [id]);

    const handleRegister = () => {
        if (!user) {
            navigate('/login');
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
                            let colors = {
                                header: "from-orange-500 to-amber-500",
                                subtitle: "text-orange-100",
                                body: "from-orange-50 to-white",
                                highlightText: "text-orange-700",
                                highlightBg: "bg-orange-100",
                            };

                            if (item.day === 2) {
                                colors = {
                                    header: "from-blue-600 to-blue-400",
                                    subtitle: "text-blue-100",
                                    body: "from-blue-50 to-white",
                                    highlightText: "text-blue-700",
                                    highlightBg: "bg-blue-100",
                                };
                            } else if (item.day === 3) {
                                colors = {
                                    header: "from-red-600 to-red-500",
                                    subtitle: "text-red-100",
                                    body: "from-red-50 to-white",
                                    highlightText: "text-red-700",
                                    highlightBg: "bg-red-100",
                                };
                            }

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

            <WebinarRegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
                webinarTitle={webinar.title}
                webinarId={webinar.id}
            />
        </main>
    );
};

export default WebinarDetailsPage;
