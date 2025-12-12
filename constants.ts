
import { Asset, AssetId } from "./types";

export const ASSETS: Record<AssetId, Asset> = {
  'gold-global': {
    id: 'gold-global',
    name: 'Gold Spot (XAU/USD)',
    symbol: 'XAU',
    unit: 'USD/oz',
    color: '#D4AF37', // Gold
  }
};

export const MOCK_NEWS_TITLES = [
  "Gold holds near record highs as Fed signals rate cuts",
  "Central Banks continue record gold buying spree in Q4",
  "Geopolitical tensions in Middle East support safe-haven demand",
  "US Dollar Index (DXY) weakness boosts bullion appeal",
  "Technical breakout above key resistance targets new highs"
];
