import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, HelpCircle, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingActionButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleOpen = () => setIsOpen(!isOpen);

    const actions = [
        { icon: FileText, label: 'Report', onClick: () => navigate('/report'), color: 'bg-emerald-500' },
        { icon: Search, label: 'Search', onClick: () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true })), color: 'bg-blue-500' },
        { icon: HelpCircle, label: 'Help', onClick: () => console.log('Help'), color: 'bg-violet-500' },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col gap-3 pointer-events-auto">
                        {actions.map((action, index) => (
                            <motion.button
                                key={action.label}
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                    action.onClick();
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-3 pr-2 group"
                            >
                                <span className="px-2 py-1 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    {action.label}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${action.color} hover:brightness-110 transition-all`}>
                                    <action.icon size={18} />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <motion.button
                className={`w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-xl flex items-center justify-center pointer-events-auto btn-interactive
          ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                onClick={toggleOpen}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Plus size={28} />
            </motion.button>
        </div>
    );
};

export default FloatingActionButton;
