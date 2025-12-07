import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LastUpdatedTimerProps {
    timestamp: Date | string | number;
    className?: string;
}

const LastUpdatedTimer: React.FC<LastUpdatedTimerProps> = ({ timestamp, className = '' }) => {
    const [timeAgo, setTimeAgo] = useState('Just now');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date().getTime();
            const past = new Date(timestamp).getTime();
            const diffInSeconds = Math.floor((now - past) / 1000);

            if (diffInSeconds < 5) {
                setTimeAgo('Just now');
            } else if (diffInSeconds < 60) {
                setTimeAgo(`${diffInSeconds}s ago`);
            } else if (diffInSeconds < 3600) {
                const mins = Math.floor(diffInSeconds / 60);
                setTimeAgo(`${mins}m ago`);
            } else {
                const hours = Math.floor(diffInSeconds / 3600);
                setTimeAgo(`${hours}h ago`);
            }
        };

        // Update immediately
        updateTime();

        // Then update every second
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, [timestamp]);

    return (
        <div className={`flex items-center gap-1.5 text-xs text-slate-500 font-medium ${className}`}>
            <Clock size={12} className="opacity-70" />
            <span>Updated {timeAgo}</span>
        </div>
    );
};

export default LastUpdatedTimer;
