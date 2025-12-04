
export type AssetId = 'gold-global';
export type Language = 'en' | 'ar';

export interface Asset {
  id: AssetId;
  name: string;
  symbol: string;
  unit: string;
  color: string;
}

export interface PricePoint {
  timestamp: number; // Unix timestamp
  price: number;
}

export interface MarketData {
  assetId: AssetId;
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  lastUpdated: number;
  history: PricePoint[];
}

export interface MarketArticle {
  headline: string;
  author: string;
  readTime: string;
  keyTakeaways: string[];
  content: string;
  generatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  summary: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  url: string;
  fullContent?: MarketArticle;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  text: string;
  sources: SearchSource[];
}

export interface FinancialMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  color: 'green' | 'red' | 'blue' | 'amber';
  description?: string;
}

export interface AnalysisDriver {
  name: string;
  impact_score: number;
  sentiment: 'bullish' | 'bearish' | 'neutral'; 
  description: string;
}

export interface AnalysisSource {
  title: string;
  source: string;
  url: string;
  summary?: string;
  relevance_score: number;
  sentiment: 'neutral' | 'positive' | 'negative';
  impact_label: 'High Impact' | 'Medium Impact' | 'Low Impact';
}

export interface DeepAnalysisData {
  headline: string;
  executive_summary: string;
  macro_analysis: string;
  technical_analysis: string;
  geopolitical_analysis: string;
  sector_analysis: string;
  consumer_analysis: string;
  future_outlook: string;
  metrics?: FinancialMetric[];
  overall_sentiment_score: number;
  confidence_score: number;
  drivers: AnalysisDriver[];
  sources: AnalysisSource[];
  factors_bearish: string[]; 
  factors_bullish: string[]; 
  generated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AnalysisContextType {
  isAnalyzing: boolean;
  progress: number;
  analysisResult: DeepAnalysisData | null;
  triggerAnalysis: (asset: Asset, data: MarketData, lang: Language) => Promise<void>;
  clearAnalysis: () => void;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

export interface AIPrediction {
  predictedPrice: number;
  confidenceLow: number;
  confidenceHigh: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number;
  reasoning: string;
}
