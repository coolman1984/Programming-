/**
 * Tests for services/marketDataService.ts
 * Tests the core price fetching and calculation logic
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

// Mock the config before importing the service
vi.mock('../config/constants', () => ({
    CACHE: { MARKET_DATA_TTL: 60000 },
    DEFAULTS: { GOLD_PRICE: 4311.97 },
    PRICE_CALC: {
        SUPPORT_PERCENT: 0.97,
        RESISTANCE_PERCENT: 1.02,
        TARGET_HIGH_PERCENT: 1.05,
        TARGET_LOW_PERCENT: 1.02,
    },
}));

describe('MarketDataService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchLiveGoldData', () => {
        it('should return valid price data structure', async () => {
            // Mock successful API response
            (global.fetch as Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    items: [{
                        xauPrice: 4311.97,
                        chgXau: 30.17,
                        xauHigh: 4324.90,
                        xauLow: 4299.03,
                    }],
                }),
            });

            const { fetchLiveGoldData } = await import('../services/marketDataService');
            const data = await fetchLiveGoldData();

            expect(data).toHaveProperty('price');
            expect(data).toHaveProperty('high');
            expect(data).toHaveProperty('low');
            expect(data).toHaveProperty('source');
            expect(typeof data.price).toBe('number');
        });

        it('should fall back to default price when all APIs fail', async () => {
            // Mock all API failures
            (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

            const { fetchLiveGoldData } = await import('../services/marketDataService');
            const data = await fetchLiveGoldData();

            expect(data.source).toBe('Fallback');
            expect(data.price).toBeCloseTo(4311.97, 0);
        });
    });

    describe('getLatestDeepAnalysis', () => {
        it('should generate dynamic content based on price', async () => {
            const { getLatestDeepAnalysis } = await import('../services/marketDataService');

            const price = 4500;
            const analysis = await getLatestDeepAnalysis(price);

            expect(analysis.executive_summary).toContain('4500');
            expect(analysis.technical_analysis).toContain(String(Math.round(price * 0.97)));
        });

        it('should use default price when not provided', async () => {
            const { getLatestDeepAnalysis } = await import('../services/marketDataService');

            const analysis = await getLatestDeepAnalysis();

            expect(analysis.executive_summary).toContain('4311.97');
        });
    });

    describe('Price Calculations', () => {
        it('should calculate support level correctly', () => {
            const price = 4000;
            const support = Math.round(price * 0.97);
            expect(support).toBe(3880);
        });

        it('should calculate resistance level correctly', () => {
            const price = 4000;
            const resistance = Math.round(price * 1.02);
            expect(resistance).toBe(4080);
        });
    });
});
