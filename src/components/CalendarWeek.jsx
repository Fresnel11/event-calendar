import React, { useState, useEffect } from 'react';

const CalendarWeek = ({ currentMonth }) => {
    // Fonction de formatage de l'heure actuelle
    const formatCurrentTime = (date) => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [currentTime, setCurrentTime] = useState(new Date());
    const [tooltipTime, setTooltipTime] = useState(formatCurrentTime(new Date())); // État pour le tooltip

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            setTooltipTime(formatCurrentTime(now)); // Mettre à jour le tooltip avec l'heure actuelle
        }, 60000); // Mettre à jour chaque minute

        return () => clearInterval(interval);
    }, []);

    function getStartOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    function generateWeekDays() {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            days.push(day);
        }
        return days;
    }

    function generateHours() {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push(i);
        }
        return hours;
    }

    const handlePrevWeek = () => {
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() - 7);
            return newDate;
        });
    };

    const handleNextWeek = () => {
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + 7);
            return newDate;
        });
    };

    const weekDays = generateWeekDays();
    const hours = generateHours();
    const today = new Date();

    const isToday = (date) => {
        return date.toDateString() === today.toDateString();
    };

    // Calcul de la position du trait bleu pour l'heure actuelle
    const getCurrentHourPosition = () => {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const fractionOfHour = currentMinute / 60; // Fraction de l'heure
        return currentHour + fractionOfHour;
    };

    // Calcul de l'index du jour actuel
    const getTodayIndex = () => {
        return weekDays.findIndex(date => date.toDateString() === today.toDateString());
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header avec navigation */}
            <div className="flex items-center px-4 py-2 border-b">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevWeek}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={handleNextWeek}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {`${weekDays[0].toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    </h2>
                </div>
            </div>

            {/* En-tête des jours de la semaine */}
            <div className="flex">
                <div className="w-16 flex-shrink-0" /> {/* Espace pour les heures */}
                {weekDays.map((date, index) => (
                    <div
                        key={index}
                        className={`flex-1 border-l p-2 text-center ${isToday(date) ? 'bg-blue-50' : ''}`}
                    >
                        <div className="text-sm font-medium text-gray-500">
                            {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                            {date.getDate()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Grille des heures */}
            <div className="flex flex-1 overflow-y-auto">
                <div className="w-16 flex-shrink-0 border-r">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-12 border-b text-right pr-2 text-xs text-gray-500"
                        >
                            {`${hour}:00`}
                        </div>
                    ))}
                </div>
                <div className="flex flex-1 relative">
                    {weekDays.map((date, dayIndex) => (
                        <div
                            key={dayIndex}
                            className="flex-1 border-l relative"
                        >
                            {hours.map((hour, hourIndex) => (
                                <div
                                    key={hourIndex}
                                    className="h-12 border-b border-gray-200 relative"
                                >
                                    {/* Ligne horaire */}
                                    <div className="absolute inset-0 border-t border-gray-200 border-dashed" />
                                    {/* Trait bleu */}
                                    {getTodayIndex() === dayIndex && getCurrentHourPosition() >= hourIndex && getCurrentHourPosition() < hourIndex + 1 && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: `${(getCurrentHourPosition() - hourIndex) * 100}%`,
                                                left: '0',
                                                right: '0',
                                                height: '4px',
                                                backgroundColor: 'blue',
                                            }}
                                            title={`Heure actuelle: ${tooltipTime}`} // Utiliser l'état du tooltip
                                        >
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '-5px',
                                                    left: '-5px',
                                                    width: '13px',
                                                    height: '13px',
                                                    backgroundColor: 'blue',
                                                    borderRadius: '50%',
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarWeek;
