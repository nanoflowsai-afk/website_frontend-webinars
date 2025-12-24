
import { Link } from "react-router-dom";

const footerLinks = {
    services: [
        { label: "Generative AI", href: "/services?category=genai" },
        { label: "AI Automation", href: "/services?category=automation" },
        { label: "Custom Development", href: "/services?category=development" },
        { label: "AI Agents", href: "/services?category=agents" },
        { label: "Data Analytics", href: "/services?category=analytics" },
    ],
    company: [
        { label: "About Us", href: "/#about" },
        { label: "Our Team", href: "/#team" },
        { label: "Careers", href: "/careers" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
    ],
    resources: [
        { label: "Webinars", href: "/webinars" },
        { label: "Case Studies", href: "/blog" },
        { label: "Documentation", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "Support", href: "/contact" },
    ],
};

const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/nanoflows", color: "#1877F2", icon: "F" },
    { name: "Instagram", href: "https://www.instagram.com/nanoflows/", color: "#E4405F", icon: "I" },
    { name: "X", href: "https://x.com/NanoFlows", color: "#000000", icon: "X" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/nanoflows", color: "#0A66C2", icon: "L" },
];

export function Footer() {
    const currentYear = 2025;

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
                    <div className="sm:col-span-2 lg:col-span-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-4">NanoFlows</h2>
                        <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
                            Empowering businesses with cutting-edge AI solutions.
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:scale-110"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:block lg:col-span-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Services</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.services.map((link) => (
                                <li key={link.label}><Link to={link.href} className="text-sm text-gray-400 hover:text-orange-400">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div className="hidden sm:block lg:col-span-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Company</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}><Link to={link.href} className="text-sm text-gray-400 hover:text-orange-400">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div className="hidden sm:block lg:col-span-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Resources</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}><Link to={link.href} className="text-sm text-gray-400 hover:text-orange-400">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
                    © {currentYear} NanoFlows. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
