
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, CheckCircle2, X, Menu, Bell, Settings, Search } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { analysisResult } = useAnalysis();
  const [showToast, setShowToast] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, dir, language, setLanguage } = useLanguage();

  // Handle scroll for navbar glass effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show notification when analysis completes
  useEffect(() => {
    if (analysisResult && location.pathname !== '/report') {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [analysisResult, location.pathname]);



  return (
    <div dir={dir} className="min-h-screen bg-[#020617] text-slate-100 selection:bg-amber-500/30 pb-24 md:pb-20">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'glass border-b border-slate-700/50'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg glow-gold-sm"
              >
                <span className="text-xl">🥇</span>
              </motion.div>
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
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex p-2.5 rounded-xl glass-hover text-slate-400 hover:text-white"
              >
                <Search size={18} />
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex p-2.5 rounded-xl glass-hover text-slate-400 hover:text-white relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
              </motion.button>



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
              className="md:hidden glass border-t border-slate-700/50"
            >
              <div className="px-4 py-4 space-y-2">
                <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                <MobileNavLink href="/report" onClick={() => setIsMobileMenuOpen(false)}>Analysis Report</MobileNavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="relative max-w-[1400px] mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Report Ready Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed top-24 left-4 z-50"
          >
            <div className="glass-gold rounded-2xl shadow-2xl p-4 flex items-center gap-4 max-w-sm glow-gold-sm">
              <div className="bg-amber-500/20 p-2 rounded-full text-amber-400">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">{t('layout.report_ready')}</h4>
                <p className="text-slate-400 text-xs">{t('layout.report_complete')}</p>
              </div>
              <Link
                to="/report"
                onClick={() => setShowToast(false)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                {t('layout.view')}
              </Link>
              <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
