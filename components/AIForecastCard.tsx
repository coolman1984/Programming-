import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIPrediction, Asset } from '../types';
import { Sparkles, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

interface AIForecastCardProps {
  prediction: AIPrediction | null;
  loading: boolean;
  asset: Asset;
}

const AIForecastCard: React.FC<AIForecastCardProps> = ({ prediction, loading, asset }) => {
  const navigate = useNavigate();

  const handleViewAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/asset/${asset.id}`, { state: { defaultTab: 'analysis' } });
  };

  if (loading) {
    return (
       <div className="h-[420px] bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">Running Gemini Models...</p>
       </div>
    );
  }

  if (!prediction) {
    return (
       <div className="h-[420px] bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex items-center justify-center">
         <p className="text-slate-500">Prediction unavailable</p>
       </div>
    );
  }

  const isBullish = prediction.trend === 'bullish';
  const isBearish = prediction.trend === 'bearish';

  return (
    <div className="h-[420px] bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
      {/* Ambient Gradient Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-6 z-10">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <div>
           <h3 className="text-white font-bold text-lg">AI Forecast</h3>
           <p className="text-slate-500 text-xs">Gemini 2.5 Flash • 7 Day Outlook</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center z-10">
         <div className="flex justify-between items-end mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Asset Focus</span>
            <span className="text-slate-300 text-xs font-bold">{asset.name}</span>
         </div>
         
         <div className="flex items-baseline gap-3 mb-2">
            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
               {prediction.predictedPrice.toLocaleString()}
            </span>
            <div className={`flex items-center gap-1 text-sm font-bold ${isBullish ? 'text-emerald-400' : isBearish ? 'text-rose-400' : 'text-slate-400'}`}>
               {isBullish ? <TrendingUp size={16}/> : isBearish ? <TrendingDown size={16}/> : <Minus size={16}/>}
               Predicted
            </div>
         </div>
         
         <div className="text-xs text-slate-500 font-medium mb-8">
            Confidence Interval: <span className="text-slate-300">{prediction.confidenceLow.toLocaleString()} - {prediction.confidenceHigh.toLocaleString()}</span>
         </div>

         {/* Bell Curve Visualization */}
         <div className="relative h-24 w-full mb-6">
            <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-center">
               <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-indigo-500/20 fill-current">
                  <path d="M0,40 Q20,40 35,35 T50,5 T65,35 T100,40 Z" />
               </svg>
               <div className="absolute bottom-0 top-2 w-[1px] border-l border-dashed border-indigo-400/50"></div>
            </div>
            
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-slate-600 font-mono">
               <span>{prediction.confidenceLow.toLocaleString()}</span>
               <span>{prediction.confidenceHigh.toLocaleString()}</span>
            </div>
         </div>
      </div>

      <div className="mt-auto z-10 space-y-3">
        <div className="bg-slate-900/50 border border-indigo-500/20 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
           <h4 className="text-indigo-400 text-xs font-bold mb-1 flex items-center gap-2">
              AI Insight 
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                 {prediction.confidenceScore}% Certainty
              </span>
           </h4>
           <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
              {prediction.reasoning}
           </p>
        </div>

        <button 
          onClick={handleViewAnalysis}
          className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
        >
          View Full Analysis & Sources <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default AIForecastCard;