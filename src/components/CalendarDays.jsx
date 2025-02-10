import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeftDropCircle, mdiArrowRightDropCircle } from '@mdi/js';
import EventModal from './EventModal';  // Assurez-vous d'importer EventModal

const CalendarDays = ({ events, onAddEvent }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [tooltipTime, setTooltipTime] = useState(formatCurrentTime(new Date()));
    const [showModal, setShowModal] = useState(false);  
    const [modalTime, setModalTime] = useState(null);  

    function formatCurrentTime(date) {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            setTooltipTime(formatCurrentTime(now));
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const changeDay = (offset) => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + offset);
            return newDate;
        });
    };

    function generateHours() {
        return Array.from({ length: 24 }, (_, i) => i);
    }

    const getCurrentHourPosition = () => {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        return currentHour + currentMinute / 60;
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

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

    const eventsForDay = events.filter(event => {
        const eventDate = new Date(event.startDate);
        const selectedDay = formatDate(selectedDate);
        return formatDate(eventDate) === selectedDay;
    });

    useEffect(() => {
        console.log('Événements pour aujourd\'hui:', eventsForDay);
        console.log('les événements', events);
    }, [eventsForDay]);

    const hours = generateHours();
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    const handleDoubleClick = (event) => {
        const clickedTime = event.target.dataset.time;  
        console.log('Heure cliquée:', clickedTime);
        setModalTime(clickedTime);  
        setShowModal(true);  
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <button
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => changeDay(-1)}
                >
                    <Icon path={mdiArrowLeftDropCircle} size={1} />
                </button>

                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                        {selectedDate.getDate()}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                        {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', year: 'numeric' })}
                    </div>
                </div>

                <button
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => changeDay(1)}
                >
                    <Icon path={mdiArrowRightDropCircle} size={1} />
                </button>
            </div>

            <div className="flex flex-1 overflow-y-auto">
                <div className="w-16 flex-shrink-0 border-r  border-gray-200 bg-gray-50">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-14 border-b cursor-pointer border-gray-200 text-right pr-2 py-1"
                            data-time={`${hour}:00`}  
                        >
                            <span className="text-xs font-medium text-gray-500">
                                {`${hour}:00`}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex-1 relative">
                    {hours.map((hour) => (
                        <div key={hour} className="h-14 border-b cursor-pointer border-gray-200 relative">
                            <div 
                            onDoubleClick={handleDoubleClick} 
                            className="absolute inset-0 border-t border-gray-100 border-dashed" />
                        </div>
                    ))}

                    {isToday && (
                        <div
                            className="absolute left-0 right-0 z-20"
                            style={{ top: `${(getCurrentHourPosition() / 24) * 100}%` }}
                        >
                            <div
                                className="relative h-0.5 bg-blue-500"
                                title={`Heure actuelle: ${tooltipTime}`}
                            >
                                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-blue-500 rounded-full shadow-md" />
                            </div>
                        </div>
                    )}

                    {eventsForDay.map((event, index) => {
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
            </div>

            {showModal && (
                <EventModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onAddEvent={onAddEvent}
                    selectedTime={modalTime}  
                />
            )}
        </div>
    );
};

export default CalendarDays;
