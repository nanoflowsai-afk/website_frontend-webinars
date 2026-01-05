import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Interface matching the backend + formatted response
interface Webinar {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    speaker: string;
    imageUrl: string;
    status?: string | 'Upcoming' | 'Completed';
    registrationId?: number;
    registeredAt?: string;
    meetingId?: string;
    passcode?: string;
    inviteLink?: string;
}

const MyRegistrationsPage = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState<Webinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
    const [showJoinModal, setShowJoinModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchRegistrations();
        } else {
            setLoading(false); // Or redirect
        }
    }, [user]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const res = await userApi.getRegistrations();
            // Filter to show only accepted registrations
            const accepted = res.data.registrations.filter((r: any) => r.status === 'accepted');
            setRegistrations(accepted);
        } catch (err) {
            console.error("Failed to fetch registrations", err);
            setError("Failed to load registrations.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-50">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">My Registrations</h1>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {registrations.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
                        <div className="mb-4 text-5xl">📅</div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">No Upcoming Webinars</h3>
                        <p className="mb-6 text-gray-500">You haven't registered for any sessions yet.</p>
                        <Link
                            to="/webinars"
                            className="inline-flex items-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                        >
                            Browse Webinars
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {registrations.map((webinar) => (
                            <motion.div
                                key={webinar.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
                            >
                                <div className="h-48 md:h-auto md:w-64 bg-gray-200 shrink-0">
                                    <img
                                        src={webinar.imageUrl}
                                        alt={webinar.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col justify-between p-6">
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 uppercase">
                                                {webinar.status || 'Registered'}
                                            </span>
                                            {webinar.registrationId && (
                                                <span className="text-xs font-medium text-gray-500">Reg ID: #{webinar.registrationId}</span>
                                            )}
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-gray-900">
                                            {webinar.title}
                                        </h3>
                                        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={16} /> {webinar.date}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={16} /> {webinar.time}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <UserIcon size={16} /> {webinar.speaker}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Link to={`/webinars/${webinar.id}`} className="flex-1">
                                            <button className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
                                                View Page
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setSelectedWebinar(webinar);
                                                setShowJoinModal(true);
                                            }}
                                            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                                        >
                                            Join Room
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}


                {/* Join Room Modal */}
                {showJoinModal && selectedWebinar && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative p-6 text-center"
                        >
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎥</span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">Join Webinar Room</h3>
                            <p className="text-sm text-gray-500 mb-6">Use the details below to join the session.</p>

                            <div className="space-y-4 mb-6 text-left">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Meeting ID</p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono text-lg font-bold text-gray-900">{selectedWebinar.meetingId || "Not Available"}</p>
                                        <button onClick={() => navigator.clipboard.writeText(selectedWebinar.meetingId || "")} className="text-blue-600 hover:text-blue-700 text-xs font-bold">Copy</button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Passcode</p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono text-lg font-bold text-gray-900">{selectedWebinar.passcode || "Not Required"}</p>
                                        <button onClick={() => navigator.clipboard.writeText(selectedWebinar.passcode || "")} className="text-blue-600 hover:text-blue-700 text-xs font-bold">Copy</button>
                                    </div>
                                </div>

                                {selectedWebinar.inviteLink && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-xs text-blue-800 uppercase font-bold mb-1">Direct Invite Link</p>
                                        <div className="flex flex-col gap-2">
                                            <p className="font-mono text-xs text-blue-900 break-all line-clamp-2">{selectedWebinar.inviteLink}</p>
                                            <div className="flex gap-2">
                                                <a href={selectedWebinar.inviteLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition text-center uppercase tracking-wider">Join Now</a>
                                                <button onClick={() => navigator.clipboard.writeText(selectedWebinar.inviteLink || "")} className="px-3 py-2 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition">Copy</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRegistrationsPage;
