
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssetId, MarketData } from '../types';
import { ASSETS } from '../constants';
import { getMarketData } from '../services/marketDataService';
import DeepAnalysisView from '../components/DeepAnalysisView';
import { ArrowLeft, BrainCircuit, MessageCircle } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { useLanguage } from '../context/LanguageContext';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Default to global gold if id not found or legacy
  const assetId = (id as AssetId) || 'gold-global';
  const asset = ASSETS[assetId] || ASSETS['gold-global'];

  const [data, setData] = useState<MarketData | null>(null);
  const { isAnalyzing, progress, analysisResult, triggerAnalysis, clearAnalysis } = useAnalysis();
  const { t, language } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
      const marketData = await getMarketData(assetId);
      setData(marketData);
    };
    loadData();
  }, [assetId]);

  if (!data) return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-base mb-6">
        <ArrowLeft size={20} />
        {t('article.back')}
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{asset.name}</h1>
          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-bold text-white">
              ${data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xl text-slate-400 font-medium">{asset.unit}</span>
            <span className={`text-xl font-bold ${data.change24h > 0 ? 'text-emerald-400' : data.change24h < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {data.change24h > 0 ? '+' : ''}{data.change24h} ({data.change24hPercent}%)
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-[600px]">
        {isAnalyzing ? (
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full"></div>
              <div className="relative z-10 w-28 h-28 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin shadow-[0_0_40px_rgba(245,158,11,0.3)]"></div>
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-amber-500 font-bold font-mono text-xl">{Math.round(progress)}%</span>
              </div>
            </div>

            <div className="max-w-lg space-y-3">
              <h2 className="text-lg font-bold text-white">{t('analysis.waiting.title')}</h2>
              <p className="text-slate-400 text-base">{t('analysis.waiting.desc')}</p>
            </div>

            <div className="w-full max-w-xl h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : analysisResult ? (
          <>
            <div className="flex justify-end mb-6">
              <button onClick={clearAnalysis} className="text-sm text-slate-500 hover:text-white transition-colors">
                {t('analysis.clear')}
              </button>
            </div>
            <DeepAnalysisView data={analysisResult} />
          </>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-16 text-center">
            <BrainCircuit size={64} className="text-slate-600 mx-auto mb-6" />
            <h3 className="text-lg font-bold text-white mb-3">{t('analysis.no_report')}</h3>
            <button
              onClick={() => triggerAnalysis(asset, data, language)}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              {t('analysis.start')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetail;
