

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Settings, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { refreshMarketData } from '../services/marketDataService';
import { GoldPyramidLogo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, dir, language, setLanguage } = useLanguage();

  // Handle scroll for navbar glass effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Refresh market data on navigation (silent background refresh)
  useEffect(() => {
    refreshMarketData().catch(console.warn);
  }, [location.pathname]);


  return (
    <div dir={dir} className="min-h-screen bg-[#0a0a0a] text-slate-100 selection:bg-amber-500/30 pb-24 md:pb-20">
      {/* Premium Gold Dust Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-yellow-500/3 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-amber-400/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
          ? 'bg-[#0a0a0a] backdrop-blur-md border-b border-slate-800/50'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 flex items-center justify-center">
                <GoldPyramidLogo />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-white">Gold</span>{' '}
                  <span className="text-gold-gradient">Insight</span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">Premium Market Intelligence</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" active={location.pathname === '/'}>Dashboard</NavLink>
              <NavLink href="/analysis" active={location.pathname === '/analysis'}>Analysis</NavLink>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">



              {/* Live Indicator */}
              <div className="hidden lg:flex px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">{t('nav.live')}</span>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl glass-hover text-slate-400 hover:text-white md:hidden"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0a0a0a] border-t border-slate-700/50"
            >
              <div className="px-4 py-4 space-y-2">
                <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                <MobileNavLink href="/analysis" onClick={() => setIsMobileMenuOpen(false)}>Analysis</MobileNavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="relative max-w-[1400px] mx-auto px-4 md:px-6 pt-32 md:pt-28 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>


      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-slate-800/50 py-3">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            © 2025 Gold Insight. Premium Market Intelligence.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">Powered by</span>
            <span className="text-xs font-bold text-amber-400">Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, active }) => (
  <Link
    to={href}
    className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all ${active
      ? 'text-amber-400 bg-amber-500/10'
      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeNavIndicator"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full"
      />
    )}
  </Link>
);

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, children, onClick }) => (
  <Link
    to={href}
    onClick={onClick}
    className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
  >
    {children}
  </Link>
);

export default Layout;
