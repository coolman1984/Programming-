
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import DeepAnalysisView from '../components/DeepAnalysisView';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AnalysisReportPage: React.FC = () => {
  const { analysisResult, clearAnalysis } = useAnalysis();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!analysisResult) {
        navigate('/');
    }
  }, [analysisResult, navigate]);

  const handleBack = () => {
    clearAnalysis();
    navigate('/');
  };

  if (!analysisResult) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <button 
        onClick={handleBack} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-base mb-4 group bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800 hover:border-amber-500/30"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        {t('article.back')}
      </button>

      <DeepAnalysisView data={analysisResult} />
      
      <div className="mt-12 text-center border-t border-slate-800 pt-8">
         <h3 className="text-white font-bold mb-4 text-xl">Analyze Another Scenario?</h3>
         <button 
            onClick={handleBack}
            className="bg-amber-500 hover:bg-amber-600 text-black px-10 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] text-lg"
         >
            Return to Dashboard
         </button>
      </div>
    </div>
  );
};

export default AnalysisReportPage;
