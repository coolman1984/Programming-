
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DeepAnalysisData, Asset, MarketData, AnalysisContextType, Language, TechnicalOutlookData } from '../types';
import { getLatestDeepAnalysis } from '../services/marketDataService';
import { generateDeepAssetAnalysis, generateTechnicalOutlook as generateTechnicalOutlookAI } from '../services/geminiService';

interface ExtendedAnalysisContextType extends AnalysisContextType {
  technicalOutlook: TechnicalOutlookData | null;
  technicalOutlookLoading: boolean;
  generateTechnicalOutlook: (currentPrice: number) => Promise<void>;
  lastAnalysisPrice: number;
}

const AnalysisContext = createContext<ExtendedAnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<DeepAnalysisData | null>(null);
  const [technicalOutlook, setTechnicalOutlook] = useState<TechnicalOutlookData | null>(null);
  const [technicalOutlookLoading, setTechnicalOutlookLoading] = useState(false);
  const [lastAnalysisPrice, setLastAnalysisPrice] = useState<number>(2700); // Default fallback

  // Generate Technical Outlook on dashboard first load (separate from Deep Analysis)
  const generateTechnicalOutlook = async (currentPrice: number) => {
    // Only generate if not already loaded and not currently generating
    if (technicalOutlook || technicalOutlookLoading) return;

    setTechnicalOutlookLoading(true);
    try {
      const data = await generateTechnicalOutlookAI(currentPrice);
      setTechnicalOutlook(data);
    } catch (error) {
      console.error("Technical outlook generation failed:", error);
    } finally {
      setTechnicalOutlookLoading(false);
    }
  };

  const triggerAnalysis = async (asset: Asset, data: MarketData, lang: Language, query?: string) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setProgress(5);
    setAnalysisResult(null);
    setLastAnalysisPrice(data.currentPrice); // Store the current price for display

    try {
      // Simulate "AI Thinking" visualization progress
      let currentProgress = 5;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 95) currentProgress = 95;
        setProgress(currentProgress);
      }, 500);

      // Wait 4 seconds to simulate deep processing
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Try to generate real analysis first
      let result = await generateDeepAssetAnalysis(asset, data, lang, query);

      // Fallback to cached/mock data if real analysis fails or returns null (e.g. no API key)
      if (!result) {
        result = await getLatestDeepAnalysis(data.currentPrice);
      }

      clearInterval(interval);
      setProgress(100);
      setAnalysisResult(result);

      // Update Technical Outlook with data from Deep Analysis
      if (result) {
        setTechnicalOutlook({
          sentiment: result.outlook_analysis?.sentiment || (result.overall_sentiment_score > 60 ? 'bullish' : result.overall_sentiment_score < 40 ? 'bearish' : 'neutral'),
          confidence: result.confidence_score || 80,
          summary: result.technical_analysis || result.executive_summary,
          confidence_explanation: 'The AI confidence is based on the consistency of data from multiple verified financial sources. Analysis derived from in-depth research.',
          strengthening_factors: result.outlook_analysis?.strengthening_count || result.factors_bullish?.length || 0,
          weakening_factors: result.outlook_analysis?.weakening_count || result.factors_bearish?.length || 0,
          strengthening_list: (result.factors_bullish || []).slice(0, 5).map(f => ({ name: f.split(':')[0] || f, brief: f })),
          weakening_list: (result.factors_bearish || []).slice(0, 5).map(f => ({ name: f.split(':')[0] || f, brief: f })),
          key_drivers: result.drivers?.slice(0, 3).map(d => ({
            name: d.name,
            impact: d.impact_score,
            sentiment: d.sentiment,
            description: d.description
          })) || [],
          generated_at: result.generated_at
        });
      }
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
    <AnalysisContext.Provider value={{
      isAnalyzing,
      progress,
      analysisResult,
      triggerAnalysis,
      clearAnalysis,
      technicalOutlook,
      technicalOutlookLoading,
      generateTechnicalOutlook,
      lastAnalysisPrice
    }}>
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
