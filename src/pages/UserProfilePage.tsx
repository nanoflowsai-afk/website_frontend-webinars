import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Loader2, AlertTriangle, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';

type Tab = 'profile' | 'photo' | 'security' | 'close-account' | 'enrolled';

interface Webinar {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    speaker: string;
    imageUrl: string;
    status?: string;
    registrationId?: number;
    registeredAt?: string;
}

const UserProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Feature specific states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [editEmail, setEditEmail] = useState('');

    // Form States
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        headline: '',
        bio: '',
        avatarUrl: ''
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // Enrolled Webinars State
    const [registrations, setRegistrations] = useState<Webinar[]>([]);
    const [registrationsLoading, setRegistrationsLoading] = useState(false);

    // Initial Data Load
    useEffect(() => {
        if (user) {
            fetchProfile();
            setEditEmail(user.email);
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await userApi.getProfile();
            const userData = res.data.user;

            // Allow name split if not separate fields in DB, but DB has single 'name'
            const nameParts = userData.name ? userData.name.split(' ') : ['', ''];

            setProfileData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                headline: userData.headline || '',
                bio: userData.bio || '',
                avatarUrl: userData.avatarUrl || ''
            });
            setEditEmail(userData.email);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    // Fetch enrolled webinars when tab is active
    useEffect(() => {
        if (activeTab === 'enrolled') {
            fetchRegistrations();
        }
    }, [activeTab]);

    const fetchRegistrations = async () => {
        setRegistrationsLoading(true);
        try {
            const res = await userApi.getRegistrations();
            setRegistrations(res.data.registrations);
        } catch (error) {
            console.error("Failed to fetch registrations", error);
        } finally {
            setRegistrationsLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
            await userApi.updateProfile({
                name: fullName,
                headline: profileData.headline,
                bio: profileData.bio
            });
            setSuccessMsg('Profile updated successfully!');
            fetchProfile(); // Refresh
        } catch (err) {
            setErrorMsg('Failed to update profile.');
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleEmailUpdate = async () => {
        if (!editEmail || !editEmail.includes('@')) {
            setErrorMsg("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await userApi.updateProfile({ email: editEmail });
            setSuccessMsg('Email updated successfully! Please login again with your new email.');
            setIsEditingEmail(false);
            // Optionally force logout if email changes, as token might be tied to it or just good practice
            // For now, we update local state but logging out is safer if auth depends on email
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.error) {
                setErrorMsg(err.response.data.error);
            } else {
                setErrorMsg('Failed to update email.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setErrorMsg("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await userApi.updateProfile({
                newPassword: passwordData.newPassword
            });
            setSuccessMsg('Password changed successfully!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            setErrorMsg('Failed to change password.');
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            // Upload to get URL
            const uploadRes = await userApi.uploadImage(file);
            const imageUrl = uploadRes.data.url;

            // Update user profile with new URL
            await userApi.updateProfile({ avatarUrl: imageUrl });

            setProfileData(prev => ({ ...prev, avatarUrl: imageUrl }));
            setSuccessMsg('Profile photo updated!');
            fetchProfile(); // Refresh context if needed logic was there
        } catch (err) {
            setErrorMsg('Failed to upload image.');
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await userApi.deleteAccount();
            logout();
            navigate('/');
        } catch (err) {
            console.error("Failed to delete account", err);
            setErrorMsg("Failed to delete account. Please try again.");
            setLoading(false);
            setShowDeleteConfirm(false); // Close modal on error
        }
    };

    if (!user) return null;

    const SidebarItem = ({ id, label, danger = false }: { id: Tab, label: string, danger?: boolean }) => {
        const isActive = activeTab === id;
        return (
            <button
                onClick={() => setActiveTab(id)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${isActive
                        ? 'bg-gray-500 text-white font-bold border-l-4 border-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    } ${isActive ? '' : 'pl-4'} ${danger && !isActive ? 'text-red-600 hover:bg-red-50' : ''}`}
                style={{
                    backgroundColor: isActive ? '#808080' : 'transparent',
                    color: isActive ? 'white' : (danger ? 'red' : 'inherit')
                }}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-white px-6 py-8 relative">
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => !loading && setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Account?</h3>
                                <p className="text-gray-500">
                                    Are you sure you want to delete your account? This action cannot be undone and you will lose all your data and registrations.
                                </p>
                                <div className="flex gap-3 w-full pt-2">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        {loading ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="flex flex-col items-center text-center p-4 border border-gray-100 rounded-sm shadow-sm">
                        <div className="h-24 w-24 rounded-full bg-gray-900 overflow-hidden flex items-center justify-center text-3xl font-bold text-white mb-3">
                            {profileData.avatarUrl ? (
                                <img src={profileData.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                user.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
                    </div>

                    <nav className="flex flex-col border border-gray-200 rounded-sm text-gray-700">
                        <SidebarItem id="profile" label="Profile" />
                        <SidebarItem id="photo" label="Photo" />
                        <SidebarItem id="security" label="Account Security" />
                        <SidebarItem id="enrolled" label="Enrolled" />
                        <div className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed">Payment methods</div>
                        <SidebarItem id="close-account" label="Close account" danger />
                    </nav>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-gray-100 pl-0 md:pl-8 pt-8 md:pt-0">

                    {/* View: Profile */}
                    {activeTab === 'profile' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="text-center mb-8 border-b border-gray-100 pb-4">
                                <h1 className="text-2xl font-bold text-gray-900">Public profile</h1>
                                <p className="text-gray-500">Add information about yourself</p>
                            </div>

                            <form onSubmit={handleSaveProfile} className="max-w-2xl mx-auto space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900">Basics:</h3>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                        className="w-full px-4 py-2 border border-blue-200 rounded-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                        className="w-full px-4 py-2 border border-blue-200 rounded-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Headline"
                                        value={profileData.headline}
                                        onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-sm text-gray-700 focus:outline-none focus:border-gray-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Add a professional headline like, "Instructor at Udemy" or "Architect."</span>
                                        <span>{profileData.headline.length}/60</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900">Biography:</h3>
                                    <div className="border border-gray-300 rounded-sm">
                                        <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-3 text-gray-600 font-serif">
                                            <button type="button" className="font-bold">B</button>
                                            <button type="button" className="italic">I</button>
                                        </div>
                                        <textarea
                                            rows={6}
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            placeholder="Biography"
                                            className="w-full p-4 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-gray-900 text-white font-bold rounded-sm hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                                {successMsg && <p className="text-green-600 font-medium text-center">{successMsg}</p>}
                                {errorMsg && <p className="text-red-600 font-medium text-center">{errorMsg}</p>}
                            </form>
                        </motion.div>
                    )}

                    {/* View: Photo */}
                    {activeTab === 'photo' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="text-center mb-8 border-b border-gray-100 pb-4">
                                <h1 className="text-2xl font-bold text-gray-900">Photo</h1>
                                <p className="text-gray-500">Add a nice photo of yourself for your profile.</p>
                            </div>

                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900">Image preview</h3>
                                    <div className="border border-gray-200 bg-gray-50 p-12 flex justify-center items-center">
                                        <div className="h-48 w-48 rounded-full border-4 border-gray-400 overflow-hidden flex items-center justify-center text-gray-300 relative">
                                            {profileData.avatarUrl ? (
                                                <img src={profileData.avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <UserIcon size={64} />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900">Add / Change Image</h3>
                                    <div className="flex gap-4">
                                        <div className="flex-1 border border-gray-300 px-4 py-2 text-gray-500 bg-white truncate">
                                            {loading ? 'Uploading...' : 'No file selected'}
                                        </div>
                                        <label className="px-6 py-2 border border-gray-900 text-gray-900 font-bold hover:bg-gray-50 cursor-pointer">
                                            Upload image
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loading} />
                                        </label>
                                    </div>
                                </div>

                                {successMsg && <p className="text-green-600 font-medium text-center">{successMsg}</p>}
                                {errorMsg && <p className="text-red-600 font-medium text-center">{errorMsg}</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* View: Security */}
                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="text-center mb-8 border-b border-gray-100 pb-4">
                                <h1 className="text-2xl font-bold text-gray-900">Account</h1>
                                <p className="text-gray-500">Edit your account settings and change your password here.</p>
                            </div>

                            <div className="max-w-2xl mx-auto space-y-8">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900">Email:</h3>
                                    <div className="border border-gray-300 bg-white text-gray-700 flex items-center justify-between p-1">
                                        {isEditingEmail ? (
                                            <div className="flex-1 flex items-center">
                                                <input
                                                    type="email"
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                    className="flex-1 px-3 py-2 outline-none"
                                                    disabled={loading}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleEmailUpdate}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                    disabled={loading}
                                                    title="Save Email"
                                                >
                                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingEmail(false);
                                                        setEditEmail(user.email); // Reset to current email
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    disabled={loading}
                                                    title="Cancel"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="px-4 py-2">
                                                    Your email address is <span className="font-bold">{user.email}</span>
                                                </div>
                                                <button
                                                    onClick={() => setIsEditingEmail(true)}
                                                    className="p-3 border-l border-gray-300 text-purple-600 hover:bg-gray-50"
                                                    title="Edit Email"
                                                >
                                                    ✏️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-gray-900">New password</h3>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm text-gray-700 focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-gray-900">Confirm new password</h3>
                                        <input
                                            type="password"
                                            placeholder="Re-type new password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm text-gray-700 focus:outline-none focus:border-gray-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handlePasswordChange}
                                    disabled={loading}
                                    className="px-6 py-3 bg-purple-700 text-white font-bold rounded-sm hover:bg-purple-800 disabled:opacity-50"
                                >
                                    {loading ? 'Changing...' : 'Change password'}
                                </button>
                                {successMsg && <p className="text-green-600 font-medium text-center">{successMsg}</p>}
                                {errorMsg && <p className="text-red-600 font-medium text-center">{errorMsg}</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* View: Close Account */}
                    {activeTab === 'close-account' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="text-center mb-8 border-b border-gray-100 pb-4">
                                <h1 className="text-2xl font-bold text-gray-900">Close Account</h1>
                                <p className="text-gray-500">Close your account permanently.</p>
                            </div>

                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="p-4">
                                    <p className="text-gray-700 mb-4">
                                        <span className="font-bold text-red-600">Warning:</span> If you close your account, you will be unsubscribed from all courses and will lose access to your account and data associated with your account forever, even if you choose to create a new account using the same email address in the future.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-6 py-3 bg-purple-700 text-white font-bold rounded-sm hover:bg-purple-800"
                                >
                                    Close account
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* View: Enrolled */}
                    {activeTab === 'enrolled' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="text-center mb-8 border-b border-gray-100 pb-4">
                                <h1 className="text-2xl font-bold text-gray-900">Enrolled Webinars</h1>
                                <p className="text-gray-500">Webinars you are registered for.</p>
                            </div>

                            {registrationsLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="animate-spin text-orange-500" size={32} />
                                </div>
                            ) : registrations.length === 0 ? (
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
                                        <div
                                            key={webinar.id}
                                            className="flex flex-col md:flex-row overflow-hidden rounded-md bg-white shadow-sm border border-gray-200 hover:shadow-md transition"
                                        >
                                            <div className="h-32 md:h-auto md:w-32 bg-gray-200 shrink-0">
                                                <img
                                                    src={webinar.imageUrl}
                                                    alt={webinar.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 uppercase">
                                                            {webinar.status || 'Registered'}
                                                        </span>
                                                        {webinar.registrationId && (
                                                            <span className="text-xs font-medium text-gray-500">Reg ID: #{webinar.registrationId}</span>
                                                        )}
                                                    </div>
                                                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                                                        {webinar.title}
                                                    </h3>
                                                    <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>📅</span> {webinar.date}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span>🕐</span> {webinar.time}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Link to={`/webinars/${webinar.id}`} className="flex-1">
                                                        <button className="w-full rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
                                                            View Page
                                                        </button>
                                                    </Link>
                                                    <button className="flex-1 rounded-sm bg-gray-900 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-gray-800">
                                                        Join Room
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
