import React, { useState, useEffect } from 'react';

const CalendarDays = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [tooltipTime, setTooltipTime] = useState(formatCurrentTime(new Date()));

    // Fonction pour formater l'heure
    function formatCurrentTime(date) {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Mise à jour de l'heure chaque minute
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            setTooltipTime(formatCurrentTime(now));
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Changer de jour
    const changeDay = (offset) => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + offset);
            return newDate;
        });
    };

    // Génération des heures
    function generateHours() {
        return Array.from({ length: 24 }, (_, i) => i);
    }

    // Calcul de la position du trait horaire
    const getCurrentHourPosition = () => {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        return currentHour + currentMinute / 60;
    };

    const hours = generateHours();
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    return (
        <div className="flex flex-col h-full bg-white">
            {/* En-tête avec navigation */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
                {/* Bouton précédent */}
                <button
                    className="text-gray-600 hover:text-black px-3 py-1 rounded"
                    onClick={() => changeDay(-1)}
                >
                    ◀
                </button>

                {/* Date sélectionnée */}
                <div className="text-center">
                    <div className="text-3xl font-semibold text-blue-500">
                        {selectedDate.getDate()}
                    </div>
                    <div className="text-sm text-gray-600">
                        {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', year: 'numeric' })}
                    </div>
                </div>

                {/* Bouton suivant */}
                <button
                    className="text-gray-600 hover:text-black px-3 py-1 rounded"
                    onClick={() => changeDay(1)}
                >
                    ▶
                </button>
            </div>

            {/* Grille horaire */}
            <div className="flex flex-1 overflow-y-auto">
                {/* Colonne des heures */}
                <div className="w-16 flex-shrink-0 border-r border-gray-300">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-12 border-b border-gray-300 text-right pr-2 text-xs text-gray-500"
                        >
                            {`${hour}:00`}
                        </div>
                    ))}
                </div>

                {/* Zone principale */}
                <div className="flex-1 relative">
                    {hours.map((hour) => (
                        <div key={hour} className="h-12 border-b border-gray-300 relative">
                            <div className="absolute inset-0 border-t border-gray-300 border-dashed" />
                        </div>
                    ))}

                    {/* Trait bleu pour l'heure actuelle */}
                    {isToday && (
                        <div
                            className="absolute left-0 right-0 z-10"
                            style={{ top: `${(getCurrentHourPosition() / 24) * 100}%` }}
                        >
                            <div
                                className="relative h-0.5 bg-blue-600"
                                title={`Heure actuelle: ${tooltipTime}`}
                            >
                                <div className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 bg-blue-600 rounded-full" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarDays;
