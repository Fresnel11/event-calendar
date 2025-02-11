import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeftDropCircle, mdiArrowRightDropCircle } from '@mdi/js';

const CalendarWorkWeek = ({ events }) => {
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
    useEffect(() => {
        console.log('Événements reçus dans CalendarWorkWeek:', events);
    }, [events]);

    // Déplacer la fonction formatCurrentTime avant son utilisation
    function formatCurrentTime(date) {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function getStartOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Pour obtenir le lundi de la semaine
        return new Date(date.setDate(diff));
    }

    function generateWorkWeekDays() {
        const days = [];
        for (let i = 0; i < 5; i++) { // Juste les jours de la semaine, de Lundi à Vendredi
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

    const workWeekDays = generateWorkWeekDays();
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

    // Fonction de normalisation de la date
    const normalizeDate = (date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    // Filtrage des événements pour la semaine en cours
    const filteredEvents = events.filter(event => {
        const eventDate = normalizeDate(event.startDate);
        const startOfWeek = normalizeDate(workWeekDays[0]);
        const endOfWeek = normalizeDate(workWeekDays[workWeekDays.length - 1]);

        console.log(`Vérification de l'événement : ${event.title} - Date : ${eventDate}, Semaine : ${startOfWeek} -> ${endOfWeek}`);

        return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    const calculateEventStyle = (event) => {
        const startTime = new Date(event.startDate);
        const endTime = new Date(event.endDate);

        if (event.allDay) {
            return {
                top: '0%',
                height: '100%',
            };
        }

        let startHour = startTime.getHours() + startTime.getMinutes() / 60;
        let endHour = endTime.getHours() + endTime.getMinutes() / 60;

        if (event.startTime) {
            const [startHourPart, startMinutePart] = event.startTime.split(':');
            startHour = parseInt(startHourPart) + parseInt(startMinutePart) / 60;
        }
        if (event.endTime) {
            const [endHourPart, endMinutePart] = event.endTime.split(':');
            endHour = parseInt(endHourPart) + parseInt(endMinutePart) / 60;
        }

        const duration = endHour - startHour;

        return {
            top: `${(startHour / 24) * 100}%`,
            height: `${(duration / 24) * 100}%`,
        };
    };

    // Calcul de l'index du jour actuel
    const getTodayIndex = () => {
        return workWeekDays.findIndex(date => date.toDateString() === today.toDateString());
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header avec navigation */}
            <div className="flex items-center px-4 py-2 border-b">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevWeek}
                        className="p-1 cursor-pointer rounded"
                    >
                        <Icon path={mdiArrowLeftDropCircle} size={1} />
                    </button>
                    <button
                        onClick={handleNextWeek}
                        className="p-1 cursor-pointer rounded"
                    >
                        <Icon path={mdiArrowRightDropCircle} size={1} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {`${workWeekDays[0].toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })} - ${workWeekDays[4].toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    </h2>
                </div>
            </div>

            {/* En-tête des jours de la semaine (Lundi à Vendredi) */}
            <div className="flex">
                <div className="w-16 flex-shrink-0" /> {/* Espace pour les heures */}
                {workWeekDays.map((date, index) => (
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
                    {workWeekDays.map((currentDay, dayIndex) => (
                        <div key={currentDay || dayIndex} className="flex-1 border-l relative">
                            {hours.map((hour, hourIndex) => (
                                <div key={hourIndex} className="h-12 border-b border-gray-200 relative">
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
                                                zIndex: 10, 
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

                            {filteredEvents
                                .filter(event => {
                                    const eventDate = normalizeDate(event.startDate);
                                    const currentDayNormalized = normalizeDate(currentDay); // Normalisation de la date du jour courant
                                    return eventDate.toISOString().split('T')[0] === currentDayNormalized.toISOString().split('T')[0]; // Filtrage par date
                                })
                                .map((event, index) => {
                                    const style = calculateEventStyle(event);
                                    return (
                                        <div
                                            key={index}
                                            className="absolute left-1 rounded-sm right-1 bg-blue-100 border-l-4 border-blue-500 rounded-r-md shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                            style={style}
                                        >
                                            <div className="p-2">
                                                <div className="text-sm font-medium text-gray-800 truncate">
                                                    {event.title}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {event.startTime
                                                        ? event.startTime
                                                        : new Date(event.startDate).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    {' - '}
                                                    {event.endTime
                                                        ? event.endTime
                                                        : new Date(event.endDate).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default CalendarWorkWeek;
