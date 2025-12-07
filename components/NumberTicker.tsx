import React, { useEffect, useRef } from 'react';
import { useSpring, useMotionValue, useTransform, motion } from 'framer-motion';

interface NumberTickerProps {
    value: number;
    currency?: string;
    decimals?: number;
    className?: string;
}

const NumberTicker: React.FC<NumberTickerProps> = ({
    value,
    currency = '$',
    decimals = 2,
    className = ''
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(value);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 200,
        mass: 1
    });

    // Update motion value when prop changes
    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    // Format and display value on change
    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                // Format with thousands separator and fixed decimals
                const formatted = Intl.NumberFormat('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                }).format(latest);

                ref.current.textContent = `${currency}${formatted}`;
            }
        });

        return () => unsubscribe();
    }, [springValue, currency, decimals]);

    return (
        <span
            ref={ref}
            className={`font-mono tabular-nums ${className}`}
        >
            {currency}{value.toFixed(decimals)}
        </span>
    );
};

export default NumberTicker;
