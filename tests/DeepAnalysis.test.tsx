/**
 * Tests for DeepAnalysis subcomponents
 * Tests the extracted components for proper rendering
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExecutiveSummary from '../components/DeepAnalysis/ExecutiveSummary';
import BankOpinions from '../components/DeepAnalysis/BankOpinions';
import SourcesList from '../components/DeepAnalysis/SourcesList';

describe('DeepAnalysis Components', () => {
    describe('ExecutiveSummary', () => {
        it('should render summary text', () => {
            render(
                <ExecutiveSummary
                    summary="Gold prices rose significantly today amid market volatility."
                    isPositive={true}
                    sentimentScore={75}
                />
            );

            expect(screen.getByText('Executive Summary')).toBeDefined();
            expect(screen.getByText(/Gold prices rose/)).toBeDefined();
        });

        it('should display correct sentiment score', () => {
            render(
                <ExecutiveSummary
                    summary="Test summary"
                    isPositive={true}
                    sentimentScore={85}
                />
            );

            expect(screen.getByText(/85% Bullish/)).toBeDefined();
        });

        it('should show bearish styling when negative', () => {
            const { container } = render(
                <ExecutiveSummary
                    summary="Test summary"
                    isPositive={false}
                    sentimentScore={35}
                />
            );

            // Should have rose/red coloring for bearish
            expect(container.querySelector('.text-rose-400')).toBeDefined();
        });
    });

    describe('BankOpinions', () => {
        const mockBanks = [
            { name: 'Goldman Sachs', stance: 'bullish' as const, price_target: '$4500', timeframe: '12 months' },
            { name: 'JPMorgan', stance: 'neutral' as const, price_target: '$4200', timeframe: '6 months' },
            { name: 'Citi', stance: 'bearish' as const, price_target: '$3800' },
        ];

        it('should render all banks', () => {
            render(
                <BankOpinions
                    summary="Major banks remain cautiously optimistic on gold."
                    banks={mockBanks}
                />
            );

            expect(screen.getByText('Goldman Sachs')).toBeDefined();
            expect(screen.getByText('JPMorgan')).toBeDefined();
            expect(screen.getByText('Citi')).toBeDefined();
        });

        it('should display price targets', () => {
            render(
                <BankOpinions
                    summary="Test summary"
                    banks={mockBanks}
                />
            );

            expect(screen.getByText('$4500')).toBeDefined();
            expect(screen.getByText('$4200')).toBeDefined();
        });

        it('should render the summary', () => {
            render(
                <BankOpinions
                    summary="Major banks remain cautiously optimistic."
                    banks={mockBanks}
                />
            );

            expect(screen.getByText(/cautiously optimistic/)).toBeDefined();
        });
    });

    describe('SourcesList', () => {
        const mockSources = [
            {
                title: 'Gold Hits Record High',
                source: 'Bloomberg',
                url: 'https://bloomberg.com/article1',
                summary: '',
                relevance_score: 0.95,
                sentiment: 'positive' as const,
                impact_label: 'High Impact' as const,
            },
            {
                title: 'Fed Decision Looms',
                source: 'Reuters',
                url: 'https://reuters.com/article2',
                summary: '',
                relevance_score: 0.85,
                sentiment: 'neutral' as const,
                impact_label: 'Medium Impact' as const,
            },
            {
                title: 'Gold Mining Report',
                source: 'Kitco',
                url: 'https://kitco.com/article3',
                summary: '',
                relevance_score: 0.70,
                sentiment: 'neutral' as const,
                impact_label: 'Low Impact' as const,
            },
        ];

        it('should render all sources', () => {
            render(<SourcesList sources={mockSources} />);

            expect(screen.getByText('Gold Hits Record High')).toBeDefined();
            expect(screen.getByText('Fed Decision Looms')).toBeDefined();
            expect(screen.getByText('Gold Mining Report')).toBeDefined();
        });

        it('should group sources by impact level', () => {
            render(<SourcesList sources={mockSources} />);

            expect(screen.getByText(/HIGH IMPACT/i)).toBeDefined();
            expect(screen.getByText(/MEDIUM IMPACT/i)).toBeDefined();
        });

        it('should display source count', () => {
            render(<SourcesList sources={mockSources} />);

            expect(screen.getByText(/3 sources/)).toBeDefined();
        });

        it('should handle empty sources', () => {
            render(<SourcesList sources={[]} />);

            expect(screen.getByText('No sources available')).toBeDefined();
        });
    });
});
