import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Search, Calculator, FileText, Home, ArrowRight, Sun, Moon, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-lg relative z-10"
                    >
                        <Command className="w-full bg-[#111111] border border-slate-800 rounded-xl shadow-2xl overflow-hidden glass-card">
                            <div className="flex items-center border-b border-slate-800 px-3" cmdk-input-wrapper="">
                                <Search className="w-5 h-5 text-slate-500 mr-2" />
                                <Command.Input
                                    placeholder="Type a command or search..."
                                    className="flex-1 py-4 bg-transparent outline-none text-slate-200 placeholder:text-slate-500 font-medium"
                                />
                                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
                                    ESC
                                </kbd>
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
                                <Command.Empty className="py-6 text-center text-sm text-slate-500">
                                    No results found.
                                </Command.Empty>

                                <Command.Group heading="Navigation" className="text-xs text-slate-500 font-medium px-2 py-1.5 mb-1">
                                    <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                                        <Home className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </CommandItem>
                                    <CommandItem onSelect={() => runCommand(() => navigate('/analysis'))}>
                                        <Calculator className="mr-2 h-4 w-4" />
                                        Deep Analysis
                                    </CommandItem>
                                    <CommandItem onSelect={() => navigate('/report')}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Latest Report
                                    </CommandItem>
                                </Command.Group>

                                <Command.Group heading="Settings" className="text-xs text-slate-500 font-medium px-2 py-1.5 mb-1 mt-2">
                                    <CommandItem onSelect={() => runCommand(() => console.log('Toggle Theme'))}>
                                        <Sun className="mr-2 h-4 w-4" />
                                        Toggle Theme
                                    </CommandItem>
                                    <CommandItem onSelect={() => runCommand(() => console.log('Change Language'))}>
                                        <Languages className="mr-2 h-4 w-4" />
                                        Change Language
                                    </CommandItem>
                                </Command.Group>
                            </Command.List>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const CommandItem = ({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) => {
    return (
        <Command.Item
            onSelect={onSelect}
            className="flex items-center px-3 py-2.5 text-sm text-slate-300 rounded-lg aria-selected:bg-amber-500/10 aria-selected:text-amber-400 cursor-pointer transition-colors"
        >
            {children}
        </Command.Item>
    );
};

export default CommandPalette;
