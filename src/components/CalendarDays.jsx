// src/components/Calendar.jsx
import React, { useState } from 'react';

const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Générer une liste des jours du mois
    const generateDays = () => {
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const days = generateDays();

    return (
        <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                    &lt;
                </button>
                <h2 className="text-xl font-semibold text-gray-800">
                    {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                    &gt;
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, index) => (
                    <div key={index} className="text-sm font-medium text-gray-600">
                        {day}
                    </div>
                ))}
                {days.map((day, index) => (
                    <div
                        key={index}
                        className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
