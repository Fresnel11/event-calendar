import React, { useState, useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(true);

    // Fermer la notification après un certain temps (par exemple 4 secondes)
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 5000); // 4 secondes

        return () => clearTimeout(timer);
    }, [onClose]);

    const getNotificationStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 text-white';
            case 'error':
                return 'bg-red-500 text-white';
            case 'info':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-800 text-white';
        }
    };

    return (
        visible && (
            <div
                className={`fixed top-4 right-4 max-w-xs w-full p-4 rounded-lg shadow-lg ${getNotificationStyles()} transition-all transform duration-300 ease-in-out`}
                style={{ zIndex: 9999 }}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {/* Icone en fonction du type */}
                        {type === 'success' && (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        )}
                        {type === 'error' && (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                        {type === 'info' && (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4m0 4v4m0 0H8m4 0h4"
                                />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                        <p>{message}</p>
                    </div>
                    <button onClick={() => setVisible(false)} className="text-white ml-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        )
    );
};

export default Notification;
