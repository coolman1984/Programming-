
import React from 'react';

export const GoldPyramidLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="gold-shine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Bottom Row */}
        <rect x="5" y="24" width="10" height="6" rx="1" fill="url(#gold-shine)" filter="url(#glow)" stroke="#78350f" strokeWidth="0.5" />
        <rect x="15" y="24" width="10" height="6" rx="1" fill="url(#gold-shine)" filter="url(#glow)" stroke="#78350f" strokeWidth="0.5" />
        <rect x="25" y="24" width="10" height="6" rx="1" fill="url(#gold-shine)" filter="url(#glow)" stroke="#78350f" strokeWidth="0.5" />

        {/* Middle Row */}
        <rect x="10" y="18" width="10" height="6" rx="1" fill="url(#gold-shine)" filter="url(#glow)" stroke="#78350f" strokeWidth="0.5" />
        <rect x="20" y="18" width="10" height="6" rx="1" fill="url(#gold-shine)" filter="url(#glow)" stroke="#78350f" strokeWidth="0.5" />

        {/* Top Row */}
        <rect x="15" y="12" width="10" height="6" rx="1" fill="url(#gold-shine)" filter="url(#glow)" stroke="#78350f" strokeWidth="0.5" />
    </svg>
);
