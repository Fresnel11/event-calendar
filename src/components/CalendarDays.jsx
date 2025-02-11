import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeftDropCircle, mdiArrowRightDropCircle } from '@mdi/js';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';
import Notification from './Notification';
const CalendarDays = ({ events, onAddEvent, onEditEvent, onDeleteEvent, setEvents }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [tooltipTime, setTooltipTime] = useState(formatCurrentTime(new Date()));
    const [showModal, setShowModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [modalTime, setModalTime] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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


    const handleRightClick = (event, eventData) => {
        event.preventDefault();
        setSelectedEvent(eventData);

        const offsetX = event.clientX;
        const offsetY = event.clientY;

        const menuWidth = 200;
        const menuHeight = 100;

        // Limites de l'écran pour le menu
        const maxX = window.innerWidth - menuWidth;
        const maxY = window.innerHeight - menuHeight;

        // Calcul des coordonnées finales
        const finalX = offsetX + menuWidth > maxX ? maxX : offsetX;
        const finalY = offsetY + menuHeight > maxY ? maxY : offsetY;

        console.log(`Menu X: ${finalX}, Menu Y: ${finalY}`);  // Vérification des coordonnées

        setContextMenu({
            x: finalX,
            y: finalY,
        });
    };





    const handleAddEvent = (newEvent) => {
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        setNotification({ message: 'Événement ajouté avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };


    const handleCloseModal = () => {
        setEditModal(false);
    };

    const handleEditEvent = (updatedEvent) => {
        console.log("Événement modifié", updatedEvent);
        setSelectedEvent(updatedEvent);
        setContextMenu(null);

        setEvents((prevEvents) =>
            prevEvents.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );
        setNotification({ message: 'Événement modifié avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };


    const handleOpenModal = () => {
        setEditModal(true);
        setContextMenu(null);
    };

    const handleDeleteEvent = () => {
        if (!selectedEvent) {
            console.error("Aucun événement sélectionné pour la suppression.");
            return;
        }

        if (typeof onDeleteEvent === 'function') {
            onDeleteEvent(selectedEvent.id);
            setContextMenu(null);
            setNotification({ message: 'Événement supprimé avec succès!', type: 'error' });
            setTimeout(() => setNotification(null), 4000);
        } else {
            console.error("onDeleteEvent n'est pas une fonction");
        }
        setShowDeleteModal(false)
    };


    const closeContextMenu = () => {
        setContextMenu(null);
    };

    return (


        <div>
            {/* Notification */}
            {notification && (
                <Notification key={notification.message} message={notification.message} type={notification.type} />
            )}
            <div className="flex flex-col h-full bg-white rounded-lg shadow-lg" onClick={closeContextMenu}>
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
                                    onContextMenu={(e) => handleRightClick(e, event)}
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
                        onAddEvent={handleAddEvent}
                        onEditEvent={onEditEvent}
                        selectedTime={modalTime}
                        eventToEdit={selectedEvent}
                    />
                )}
                {showDeleteModal && (
                    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Confirmer la suppression</h2>
                            <p className="text-sm text-gray-600 mb-4">Êtes-vous sûr de vouloir supprimer cet événement ?</p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-none cursor-pointer text-gray-700 hover:text-gray-400 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteEvent}
                                    className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {contextMenu && (
                    <div
                        className="bg-white border border-gray-300 rounded-lg shadow-lg z-30 transition transform duration-200 ease-in-out"
                        style={{
                            position: 'fixed',
                            top: contextMenu.y,
                            left: contextMenu.x,
                        }}
                    >
                        <div
                            className="flex items-center px-4 py-3 hover:bg-blue-100 cursor-pointer transition duration-200 ease-in-out rounded-t-lg"
                            onClick={handleOpenModal}
                        >
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V5h2v6z" /></svg>
                            <span className="font-semibold text-gray-800">Modifier</span>
                        </div>
                        <div
                            className="flex items-center px-4 py-3 hover:bg-red-100 cursor-pointer transition duration-200 ease-in-out"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V5h2v6z" /></svg>
                            <span className="font-semibold text-gray-800">Supprimer</span>
                        </div>
                    </div>
                )}



                {editModal && (
                    <EditEventModal
                        isOpen={editModal}
                        onClose={handleCloseModal}
                        eventToEdit={selectedEvent}
                        onEditEvent={handleEditEvent}
                    />
                )}
            </div>
        </div>
    );
};

export default CalendarDays;