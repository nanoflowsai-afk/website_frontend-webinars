
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();

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
