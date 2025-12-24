import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../services/api";

interface WebinarRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    webinarTitle: string;
    webinarId: number;
}

export function WebinarRegistrationModal({
    isOpen,
    onClose,
    webinarTitle,
    webinarId,
}: WebinarRegistrationModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Pre-fill form if user is logged in
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
            }));
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call API to register for webinar
            await userApi.registerWebinar(webinarId);
            setSuccess(true);
        } catch (error) {
            console.error("Registration failed", error);
            // Optionally handle error state here
            // e.g. setIsError(true) or show toast
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Register for Session
                            </h3>
                            <button
                                onClick={handleClose}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {success ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                                        ✅
                                    </div>
                                    <h4 className="mb-2 text-xl font-bold text-gray-900">
                                        Registration Confirmed!
                                    </h4>
                                    <p className="mb-6 text-sm text-gray-600">
                                        You have successfully registered for <br />
                                        <span className="font-semibold text-orange-600">
                                            {webinarTitle}
                                        </span>
                                    </p>
                                    <button
                                        onClick={handleClose}
                                        className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="mb-6 text-sm text-gray-600">
                                        You are registering for: <span className="font-semibold text-gray-900">{webinarTitle}</span>
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50 focus:bg-white transition"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50 focus:bg-white transition"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, phone: e.target.value })
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50 focus:bg-white transition"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-orange-500/40 disabled:opacity-70 flex items-center justify-center gap-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={18} />
                                                        Registering...
                                                    </>
                                                ) : (
                                                    "Confirm Registration"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
