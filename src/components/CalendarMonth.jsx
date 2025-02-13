import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SidebarEvent from './SidebarEvent';
import EventModal from './EventModal';
import Notification from './Notification';
import Icon from '@mdi/react';
import { mdiArrowLeftDropCircle, mdiArrowRightDropCircle } from '@mdi/js';
import { useEventStore } from '../context/EventStore';

const CalendarMonth = ({ currentMonth, setCurrentMonth, onAddEvent, events, setEvents, onDeleteEvent }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const { updateEvent } = useEventStore();


    useEffect(() => {
        const today = new Date();
        setSelectedDate(today);
    }, []);

    // Ajouter un événement
    const handleAddEvent = (eventData) => {
        const newEvent = {
            id: Date.now().toString(),
            ...eventData
        };
        onAddEvent(newEvent);
        setNotification({ message: 'Événement ajouté avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };



    const handleUpdateEvent = (updatedEvent) => {
        updateEvent(updatedEvent._id, updatedEvent);
        // updateEvent((prevEvents) =>
        //     prevEvents.map((event) =>
        //         event.id === updatedEvent._id ? updatedEvent : event
        //     )
        // );
        setNotification({ message: 'Événement modifié avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };



    // Supprimer un événement
    const handleDeleteEvent = (eventId) => {
        // setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));

        setNotification({ message: 'Événement supprimé avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);

        onDeleteEvent(eventId);
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
        setIsModalOpen(true);
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
                        <button onClick={handlePrevMonth} className="p-1 cursor-pointer rounded-sm"><Icon path={mdiArrowLeftDropCircle} size={1.3} color={'#238781'} /></button>
                        <button onClick={handleNextMonth} className="p-1 cursor-pointer rounded-sm"><Icon path={mdiArrowRightDropCircle} size={1.3} color={'#238781'} /></button>
                        <h2 className="text-lg font-semibold text-[#238781]">
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
                                    ${isToday(day.date) ? 'bg-[#238781] text-white' : 'text-gray-900 hover:bg-gray-100'}
                                    ${selectedDate && selectedDate.toDateString() === day.date.toDateString() ? 'bg-[#3ebeb4] text-white' : ''}`}
                            >
                                {day.day}
                            </div>

                            {/* Affichage des événements */}
                            <div
                                className={`
    mt-1 space-y-1
    ${events.length > 2 ? 'max-h-[calc(100%-2rem)] overflow-auto' : ''}
  `}
                            >
                                {events
                                    .filter(event => {
                                        const eventStart = new Date(event.startDate);
                                        const eventEnd = new Date(event.endDate);
                                        const currentDate = day.date;

                                        // Normaliser les dates pour comparer uniquement les dates sans les heures
                                        const normalizedEventStart = new Date(
                                            eventStart.getFullYear(),
                                            eventStart.getMonth(),
                                            eventStart.getDate()
                                        );
                                        const normalizedEventEnd = new Date(
                                            eventEnd.getFullYear(),
                                            eventEnd.getMonth(),
                                            eventEnd.getDate()
                                        );
                                        const normalizedCurrentDate = new Date(
                                            currentDate.getFullYear(),
                                            currentDate.getMonth(),
                                            currentDate.getDate()
                                        );

                                        // Vérifier si la date actuelle est comprise entre la date de début et de fin
                                        return normalizedCurrentDate >= normalizedEventStart &&
                                            normalizedCurrentDate <= normalizedEventEnd;
                                    })
                                    .map((event, eventIndex) => {
                                        const eventStart = new Date(event.startDate);
                                        const eventEnd = new Date(event.endDate);
                                        const isFirstDay = eventStart.toDateString() === day.date.toDateString();
                                        const isLastDay = eventEnd.toDateString() === day.date.toDateString();
                                        const isMultiDay = eventStart.toDateString() !== eventEnd.toDateString();

                                        return (
                                            <div
                                                key={event.id || eventIndex}
                                                className={`
            px-2 py-1 text-xs 
            ${isMultiDay ? 'rounded-none' : 'rounded-md'}
            ${isFirstDay ? 'rounded-l-md' : ''}
            ${isLastDay ? 'rounded-r-md' : ''}
            ${isMultiDay && !isFirstDay ? '-ml-2' : ''}
            ${isMultiDay && !isLastDay ? '-mr-2' : ''}
            bg-[#E8F3F2] text-teal-800 
            truncate hover:bg-[#C0DCDA] 
            transition-colors
            relative
            ${isMultiDay ? 'border-1 border-teal-800' : ''}
          `}
                                                style={{
                                                    marginLeft: isMultiDay && !isFirstDay ? '-2px' : undefined,
                                                    marginRight: isMultiDay && !isLastDay ? '-2px' : undefined,
                                                }}
                                                title={`${event.title} (${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()})`}
                                            >
                                                {/* Afficher l'heure uniquement le premier jour si c'est un événement sur plusieurs jours */}
                                                {!event.allDay && event.startTime && isFirstDay && (
                                                    <span className="mr-1 font-medium">
                                                        {event.startTime}
                                                    </span>
                                                )}
                                                {event.title}
                                            </div>
                                        );
                                    })}
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
    events: PropTypes.array.isRequired,
    setEvents: PropTypes.func.isRequired,
};

export default CalendarMonth;
