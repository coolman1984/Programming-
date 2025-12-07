import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
            <AnimatePresence mode="wait">
                {theme === 'light' && (
                    <motion.button
                        key="light"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => setTheme('dark')}
                        className="p-1.5 rounded-full text-amber-500 bg-white shadow-sm"
                    >
                        <Sun size={16} />
                    </motion.button>
                )}
                {theme === 'dark' && (
                    <motion.button
                        key="dark"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => setTheme('system')}
                        className="p-1.5 rounded-full text-indigo-400 bg-slate-700 shadow-sm"
                    >
                        <Moon size={16} />
                    </motion.button>
                )}
                {theme === 'system' && (
                    <motion.button
                        key="system"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => setTheme('light')}
                        className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 shadow-sm"
                    >
                        <Monitor size={16} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
