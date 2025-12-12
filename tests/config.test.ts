/**
 * Tests for config/constants.ts
 * Verifies centralized configuration values are correctly exported
 */

import { describe, it, expect } from 'vitest';
import {
    CACHE,
    TIMEOUTS,
    DEFAULTS,
    PROXIES,
    APPROVED_SOURCES,
    PRICE_CALC,
    UI
} from '../config/constants';

describe('Config Constants', () => {
    describe('CACHE', () => {
        it('should have valid market data TTL', () => {
            expect(CACHE.MARKET_DATA_TTL).toBe(60_000);
            expect(typeof CACHE.MARKET_DATA_TTL).toBe('number');
        });

        it('should have valid search TTL', () => {
            expect(CACHE.SEARCH_TTL).toBe(300_000);
        });
    });

    describe('TIMEOUTS', () => {
        it('should have reasonable timeout values', () => {
            expect(TIMEOUTS.API).toBeGreaterThan(0);
            expect(TIMEOUTS.PROXY).toBeGreaterThan(0);
            expect(TIMEOUTS.AI_GENERATION).toBeGreaterThan(TIMEOUTS.API);
        });
    });

    describe('DEFAULTS', () => {
        it('should have a realistic gold price default', () => {
            expect(DEFAULTS.GOLD_PRICE).toBeGreaterThan(1000);
            expect(DEFAULTS.GOLD_PRICE).toBeLessThan(10000);
        });

        it('should have valid language default', () => {
            expect(DEFAULTS.LANGUAGE).toBe('en');
        });
    });

    describe('PROXIES', () => {
        it('should have at least 2 proxy URLs', () => {
            expect(PROXIES.length).toBeGreaterThanOrEqual(2);
        });

        it('should have valid URL formats', () => {
            PROXIES.forEach((proxy) => {
                expect(proxy).toMatch(/^https:\/\//);
            });
        });
    });

    describe('APPROVED_SOURCES', () => {
        it('should include major financial news domains', () => {
            expect(APPROVED_SOURCES.domains).toContain('bloomberg.com');
            expect(APPROVED_SOURCES.domains).toContain('reuters.com');
            expect(APPROVED_SOURCES.domains).toContain('kitco.com');
        });

        it('should have display names for key domains', () => {
            expect(APPROVED_SOURCES.displayNames['bloomberg.com']).toBe('Bloomberg');
            expect(APPROVED_SOURCES.displayNames['reuters.com']).toBe('Reuters');
        });
    });

    describe('PRICE_CALC', () => {
        it('should have valid percentage multipliers', () => {
            expect(PRICE_CALC.SUPPORT_PERCENT).toBeLessThan(1);
            expect(PRICE_CALC.RESISTANCE_PERCENT).toBeGreaterThan(1);
        });

        it('should calculate correct support/resistance levels', () => {
            const price = 4000;
            const support = price * PRICE_CALC.SUPPORT_PERCENT;
            const resistance = price * PRICE_CALC.RESISTANCE_PERCENT;

            expect(support).toBeLessThan(price);
            expect(resistance).toBeGreaterThan(price);
        });
    });

    describe('UI', () => {
        it('should have reasonable content length threshold', () => {
            expect(UI.MIN_CONTENT_LENGTH).toBeGreaterThan(100);
            expect(UI.MIN_CONTENT_LENGTH).toBeLessThan(2000);
        });
    });
});
