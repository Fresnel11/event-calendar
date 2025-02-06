// src/components/NavBar.jsx
import React from 'react';

const NavBar = ({ setView }) => {
    return (
        <div className="flex justify-center space-x-4 mb-4">
            <button
                onClick={() => setView('days')}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 focus:outline-none"
            >
                Jour
            </button>
            <button
                onClick={() => setView('month')}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 focus:outline-none"
            >
                Mois
            </button>
            <button
                onClick={() => setView('week')}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 focus:outline-none"
            >
                Semaine
            </button>
            <button
                onClick={() => setView('work-week')}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 focus:outline-none"
            >
                Semaine de travail
            </button>
        </div>
    );
};

export default NavBar;
