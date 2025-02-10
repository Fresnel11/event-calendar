import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Notification = ({ message, type = 'info', onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = 5000;
        const interval = 10;
        const step = (100 * interval) / duration;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    setIsVisible(false);
                    return 0;
                }
                return prev - step;
            });
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (!isVisible && onClose) {
            onClose();
        }
    }, [isVisible, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'error':
                return <XCircle className="w-6 h-6 text-red-500" />;
            case 'info':
                return <Info className="w-6 h-6 text-blue-500" />;
            default:
                return null;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return 'border-green-500';
            case 'error':
                return 'border-red-500';
            case 'info':
                return 'border-blue-500';
            default:
                return 'border-gray-500';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: 50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 50, x: 50 }}
                    className="fixed bottom-4 right-4 z-50"
                >
                    <div className={`
                        relative overflow-hidden
                        max-w-sm w-full p-4 rounded-lg
                        bg-white/10 backdrop-blur-lg
                        border ${getBorderColor()}
                        shadow-lg
                        dark:bg-gray-800/90
                    `}>
                        <div className="flex items-center gap-3">
                            {getIcon()}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {message}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Barre de progression */}
                        <div className="absolute bottom-0 left-0 h-1 bg-gray-200 dark:bg-gray-700 w-full">
                            <div
                                className={`h-full transition-all duration-75 ${
                                    type === 'success' ? 'bg-green-500' :
                                    type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Notification;