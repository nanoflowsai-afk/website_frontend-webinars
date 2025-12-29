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
}

const MyRegistrationsPage = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState<Webinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                                        <button className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600">
                                            Join Room
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRegistrationsPage;
