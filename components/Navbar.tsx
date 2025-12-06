import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, TrendingUp, Settings, Bell, Search, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
    onMenuToggle?: () => void;
    isMenuOpen?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isMenuOpen }) => {
    const { language, setLanguage, t } = useLanguage();
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'glass border-b border-slate-700/50'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg glow-gold-sm">
                            <span className="text-xl">🥇</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gold-gradient">Gold Insight</h1>
                            <p className="text-xs text-slate-500 hidden sm:block">Premium Market Intelligence</p>
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <NavLink href="#" active>Dashboard</NavLink>
                        <NavLink href="#analysis">Analysis</NavLink>
                        <NavLink href="#news">News</NavLink>
                        <NavLink href="#calculator">Calculator</NavLink>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2.5 rounded-xl glass-hover text-slate-400 hover:text-white"
                        >
                            <Search size={18} />
                        </motion.button>

                        {/* Notifications */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2.5 rounded-xl glass-hover text-slate-400 hover:text-white relative"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
                        </motion.button>

                        {/* Language Toggle Removed */}

                        {/* Settings */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2.5 rounded-xl glass-hover text-slate-400 hover:text-white hidden sm:flex"
                        >
                            <Settings size={18} />
                        </motion.button>

                        {/* Mobile Menu Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onMenuToggle}
                            className="p-2.5 rounded-xl glass-hover text-slate-400 hover:text-white md:hidden"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden glass border-t border-slate-700/50"
                >
                    <div className="px-4 py-4 space-y-2">
                        <MobileNavLink href="#">Dashboard</MobileNavLink>
                        <MobileNavLink href="#analysis">Analysis</MobileNavLink>
                        <MobileNavLink href="#news">News</MobileNavLink>
                        <MobileNavLink href="#calculator">Calculator</MobileNavLink>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, active }) => (
    <a
        href={href}
        className={`relative px-3 py-2 text-sm font-medium transition-colors ${active
            ? 'text-amber-400'
            : 'text-slate-400 hover:text-white'
            }`}
    >
        {children}
        {active && (
            <motion.div
                layoutId="activeNav"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
            />
        )}
    </a>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ href, children }) => (
    <a
        href={href}
        className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
    >
        {children}
    </a>
);

export default Navbar;
