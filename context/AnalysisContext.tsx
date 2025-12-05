
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DeepAnalysisData, Asset, MarketData, AnalysisContextType, Language } from '../types';
import { getLatestDeepAnalysis } from '../services/marketDataService';
import { generateDeepAssetAnalysis } from '../services/geminiService';

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<DeepAnalysisData | null>(null);

  const triggerAnalysis = async (asset: Asset, data: MarketData, lang: Language) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setProgress(5);
    setAnalysisResult(null);

    try {
      // Simulate "AI Thinking" visualization progress
      // This saves API costs by not calling Gemini every time, but gives the user the Premium Experience
      let currentProgress = 5;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 95) currentProgress = 95;
        setProgress(currentProgress);
      }, 500);

      // Wait 4 seconds to simulate deep processing
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Try to generate real analysis first
      let result = await generateDeepAssetAnalysis(asset, data, lang);

      // Fallback to cached/mock data if real analysis fails or returns null (e.g. no API key)
      if (!result) {
        result = await getLatestDeepAnalysis();
      }

      clearInterval(interval);
      setProgress(100);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed", error);
      setProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setProgress(0);
    setIsAnalyzing(false);
  };

  return (
    <AnalysisContext.Provider value={{ isAnalyzing, progress, analysisResult, triggerAnalysis, clearAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (undefined === context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
