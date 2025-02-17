import React, { useState, useEffect } from 'react';
import { CalendarDays, Calendar, CalendarCheck, Briefcase } from 'lucide-react';

const NavBar = ({ setView }) => {
    const [selectedView, setSelectedView] = useState('days');

    useEffect(() => {
        const savedView = localStorage.getItem('selectedView');
        if (savedView) {
            setSelectedView(savedView);
            setView(savedView);
        }
    }, [setView]);

    const handleSetView = (view) => {
        setSelectedView(view);
        setView(view);
        localStorage.setItem('selectedView', view);
    };

    const navItems = [
        { id: 'days', label: 'Jour', icon: <CalendarDays className="w-5 h-5" /> },
        { id: 'month', label: 'Mois', icon: <Calendar className="w-5 h-5" /> },
        { id: 'week', label: 'Semaine', icon: <CalendarCheck className="w-5 h-5" /> },
        { id: 'work-week', label: 'Travail', icon: <Briefcase className="w-5 h-5" /> }
    ];

    return (
        <nav className="flex justify-center items-center space-x-4 bg-white shadow-lg py-3 px-6 rounded-2xl">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleSetView(item.id)}
                    className={`flex items-center gap-2 cursor-pointer px-5 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out 
                        ${selectedView === item.id ? 'bg-[#238781] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default NavBar;
