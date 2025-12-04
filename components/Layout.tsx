
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gem, CheckCircle2, X } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { analysisResult } = useAnalysis();
  const [showToast, setShowToast] = useState(false);
  const { t, dir } = useLanguage();

  // Show notification when analysis completes
  useEffect(() => {
    if (analysisResult && location.pathname !== '/report') {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [analysisResult, location.pathname]);

  return (
    <div dir={dir} className="min-h-screen bg-[#020617] text-slate-100 font-serif selection:bg-amber-500/30 pb-24 md:pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="bg-gradient-to-tr from-amber-400 to-amber-600 p-2 rounded-lg shadow-lg shadow-amber-500/20">
                  <Gem className="text-black h-5 w-5" />
               </div>
               <span className="font-bold text-xl tracking-tight text-white">رؤية <span className="text-amber-400 font-light">الذهب</span></span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full items-center gap-2">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 <span className="text-xs font-bold text-emerald-500 tracking-wide uppercase">{t('nav.live')}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10">
        {children}
      </main>
      
      {/* Report Ready Toast */}
      {showToast && (
        <div className="fixed top-24 left-6 z-50 animate-in slide-in-from-left duration-500">
           <div className="bg-[#0f172a] border border-amber-500/30 rounded-xl shadow-2xl p-4 flex items-center gap-4 max-w-sm">
              <div className="bg-amber-500/20 p-2 rounded-full text-amber-400">
                 <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                 <h4 className="text-white font-bold text-sm">التقرير جاهز</h4>
                 <p className="text-slate-400 text-xs">تم الانتهاء من التحليل العميق للسوق.</p>
              </div>
              <Link to="/report" onClick={() => setShowToast(false)} className="text-xs font-bold text-amber-400 hover:underline">
                 عرض
              </Link>
              <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white">
                 <X size={14} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
