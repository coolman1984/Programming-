import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const routeNameMap: Record<string, string> = {
        'analysis': 'Market Analysis',
        'report': 'Latest Report',
        'article': 'Market Insight',
    };

    return (
        <nav className="flex items-center text-sm text-slate-500 mb-6">
            <Link
                to="/"
                className="flex items-center hover:text-amber-400 transition-colors"
            >
                <Home size={14} className="mr-1" />
                <span className="hidden sm:inline">Home</span>
            </Link>

            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const name = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                return (
                    <motion.div
                        key={to}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center"
                    >
                        <ChevronRight size={14} className="mx-2 text-slate-600" />
                        {isLast ? (
                            <span className="text-amber-500 font-medium">
                                {name}
                            </span>
                        ) : (
                            <Link to={to} className="hover:text-amber-400 transition-colors">
                                {name}
                            </Link>
                        )}
                    </motion.div>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
