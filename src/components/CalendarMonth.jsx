import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SidebarEvent from './SidebarEvent';
import EventModal from './EventModal';
import Notification from './Notification';
import Icon from '@mdi/react';
import { mdiArrowLeftDropCircle, mdiArrowRightDropCircle } from '@mdi/js';

const CalendarMonth = ({ currentMonth, setCurrentMonth }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]); // Pour stocker les événements (tâches)
    const [notification, setNotification] = useState(null);  // État pour la notification


    useEffect(() => {
        const today = new Date();
        setSelectedDate(today);
    }, []);

    // Ajouter un événement
    const handleAddEvent = (eventData) => {
        const newEvent = {
            id: Date.now().toString(), // Identifiant unique
            ...eventData
        };
        setEvents(prev => [...prev, newEvent]);

        setNotification({ message: 'Événement ajouté avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleUpdateEvent = (updatedEvent) => {
        setEvents((prevEvents) =>
            prevEvents.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );
        setNotification({ message: 'Événement modifié avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };


    // Supprimer un événement
    const handleDeleteEvent = (eventId) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));

        setNotification({ message: 'Événement supprimé avec succès!', type: 'error' });
        setTimeout(() => setNotification(null), 4000);
    };

    const generateCalendarDays = () => {
        if (!currentMonth) return [];

        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay();

        const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
        const prevMonthDays = Array.from({ length: startingDayOfWeek }, (_, i) => ({
            day: prevMonthLastDay - startingDayOfWeek + i + 1,
            isCurrentMonth: false,
            date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthLastDay - startingDayOfWeek + i + 1)
        }));

        const currentMonthDays = Array.from({ length: lastDayOfMonth.getDate() }, (_, i) => ({
            day: i + 1,
            isCurrentMonth: true,
            date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
        }));

        const remainingDays = 42 - (prevMonthDays.length + currentMonthDays.length);
        const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
            day: i + 1,
            isCurrentMonth: false,
            date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i + 1)
        }));

        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDayClick = (date) => {
        setSelectedDate(date);
        setIsSidebarOpen(true);
    };

    const handleDayDoubleClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true); // Ouvre le modal au double-clic
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const days = generateCalendarDays();
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
        <div className="flex h-screen">
            {/* Notification */}
            {notification && (
                <Notification message={notification.message} type={notification.type} />
            )}

            {/* Calendrier */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-5/6' : 'w-full'} bg-white`}>
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrevMonth} className="p-1 cursor-pointer rounded-sm"><Icon path={mdiArrowLeftDropCircle} size={1} /></button>
                        <button onClick={handleNextMonth} className="p-1 cursor-pointer rounded-sm"><Icon path={mdiArrowRightDropCircle} size={1} /></button>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-7">
                    {weekDays.map((day, index) => (
                        <div key={index} className="px-2 py-3 text-sm font-medium text-gray-500 border-b">
                            {day}
                        </div>
                    ))}

                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`relative h-24 p-1 border-b border-r cursor-pointer 
                                ${selectedDate && selectedDate.toDateString() === day.date.toDateString() ? 'bg-blue-200' : ''} 
                                ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'}`}
                            onClick={() => handleDayClick(day.date)}
                            onDoubleClick={() => handleDayDoubleClick(day.date)}
                        >
                            <div
                                className={`flex items-center justify-center w-7 h-7 text-sm rounded-full 
                                    ${isToday(day.date) ? 'bg-blue-600 text-white' : 'text-gray-900 hover:bg-gray-100'}
                                    ${selectedDate && selectedDate.toDateString() === day.date.toDateString() ? 'bg-blue-400 text-white' : ''}`}
                            >
                                {day.day}
                            </div>

                            {/* Affichage des événements */}
                            <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                                {events
                                    .filter(event => new Date(event.startDate).toDateString() === day.date.toDateString())
                                    .map((event, eventIndex) => (
                                        <div
                                            key={event.id}
                                            className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800 truncate hover:bg-blue-200 transition-colors"
                                            title={event.title}
                                        >
                                            {!event.allDay && event.startTime && (
                                                <span className="mr-1 font-medium">
                                                    {event.startTime}
                                                </span>
                                            )}
                                            {event.title}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SidebarEvent avec suppression */}
            {isSidebarOpen && <SidebarEvent selectedDate={selectedDate} onClose={() => { setSelectedDate(null); setIsSidebarOpen(false); }} events={events} onDeleteEvent={handleDeleteEvent} onUpdateEvent={handleUpdateEvent} />}

            {/* EventModal */}
            {isModalOpen && <EventModal isOpen={isModalOpen} selectedDate={selectedDate} onClose={closeModal} onAddEvent={handleAddEvent} />}
        </div>
    );
};

CalendarMonth.propTypes = {
    currentMonth: PropTypes.instanceOf(Date).isRequired,
    setCurrentMonth: PropTypes.func.isRequired,
};

export default CalendarMonth;
