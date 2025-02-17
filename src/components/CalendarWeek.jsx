import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeftDropCircle, mdiArrowRightDropCircle, mdiCalendarToday } from '@mdi/js';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';
import Notification from './Notification';
import { useEventStore } from '../context/EventStore';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
const CalendarWeek = ({ events, setEvents, onEditEvent, onAddEvent, onDeleteEvent }) => {
    const formatCurrentTime = (date) => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        console.log('Événements reçus dans CalendarWeek:', events);
    }, [events]);

    const [showModal, setShowModal] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [currentTime, setCurrentTime] = useState(new Date());
    const [editModal, setEditModal] = useState(false);
    const [tooltipTime, setTooltipTime] = useState(formatCurrentTime(new Date()));
    const [modalTime, setModalTime] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null)
    const [notification, setNotification] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [open, setOpen] = useState(true)
    const { updateEvent } = useEventStore();
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            setTooltipTime(formatCurrentTime(now));
        }, 60000);

        return () => clearInterval(interval);
    }, []);


    const goToToday = () => {
        const today = new Date();
        const startOfWeek = getStartOfWeek(today);
        setCurrentWeekStart(startOfWeek);
        setSelectedDate(today);
    };


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

    const handleDayClick = (date) => {
        setSelectedDate(date);
        setShowModal(true);
        console.log('Date sélectionnée:', date);
    };

    function generateHours() {
        return Array.from({ length: 24 }, (_, i) => i);
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
    const handleCloseModal = () => {
        setEditModal(false);
    };

    const handleOpenModal = () => {
        setEditModal(true);
        setContextMenu(null);
    };

    const weekDays = generateWeekDays();
    const hours = generateHours();
    const today = new Date();



    const isToday = (date) => date.toDateString() === today.toDateString();

    const getCurrentHourPosition = () => {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        return currentHour + currentMinute / 60;
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

    const handleDeleteEvent = () => {
        if (!selectedEvent) {
            console.error("Aucun événement sélectionné pour la suppression.");
            return;
        }

        if (typeof onDeleteEvent === 'function') {
            onDeleteEvent(selectedEvent._id);
            setContextMenu(null);
            setNotification({ message: 'Événement supprimé avec succès!', type: 'success' });
            setTimeout(() => setNotification(null), 4000);
        } else {
            console.error("onDeleteEvent n'est pas une fonction");
        }
        setShowDeleteModal(false)
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    const getTodayIndex = () => {
        return weekDays.findIndex(date => date.toDateString() === today.toDateString());
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

    const normalizeDate = (date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const handleAddEvent = (newEvent) => {
        // setEvents((prevEvents) => [...prevEvents, newEvent]);
        onAddEvent(newEvent)
        setNotification({ message: 'Événement ajouté avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleEditEvent = (updatedEvent) => {
        console.log("Événement modifié", updatedEvent);
        updateEvent(updatedEvent._id, updatedEvent);
        setContextMenu(null);


        setNotification({ message: 'Événement modifié avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };

    const filteredEvents = events.filter(event => {
        const eventDate = normalizeDate(event.startDate);
        const startOfWeek = normalizeDate(weekDays[0]);
        const endOfWeek = normalizeDate(weekDays[6]);

        console.log(`Vérification de l'événement : ${event.title} - Date : ${eventDate}, Semaine : ${startOfWeek} -> ${endOfWeek}`);

        return eventDate >= startOfWeek && eventDate <= endOfWeek;
    })



    return (
        <div>
            {/* Notification */}
            {notification && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Notification key={notification.message} message={notification.message} type={notification.type} />
                </div>
            )}

            <div className="flex flex-col h-full bg-white" onClick={closeContextMenu}>
                <div className="flex items-center  px-4 py-2 border-b justify-between">
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrevWeek} className="p-1 cursor-pointer rounded">
                            <Icon path={mdiArrowLeftDropCircle} size={1.3} color={'#238781'} />
                        </button>
                        <button onClick={handleNextWeek} className="p-1 cursor-pointer rounded">
                            <Icon path={mdiArrowRightDropCircle} size={1.3} color={'#238781'} />
                        </button>
                        <h2 className="text-lg font-semibold text-[#238781]">
                            {`${weekDays[0].toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                        </h2>
                    </div>
                    <div className="flex items-center justify-center -translate-x-3 relative group">
                        <Icon
                            onClick={goToToday}
                            path={mdiCalendarToday}
                            size={1.5}
                            color={'#238781'}
                            className="cursor-pointer hover:text-gray-800 transition-colors"
                        />
                        {/* Tooltip qui apparaît au survol */}
                        <div className="absolute hidden group-hover:block text-white bg-gray-700 text-xs rounded-lg py-1 px-2 bottom-full mb-2">
                            Aujourd'hui
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <div className="w-16 flex-shrink-0" />
                    {weekDays.map((date, index) => (
                        <div key={index} className={`flex-1 border-l p-2 text-center ${isToday(date) ? 'bg-[#E8F3F2]' : ''}`}>
                            <div className="text-sm font-medium text-gray-500">
                                {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                            </div>
                            <div className={`text-lg ${isToday(date) ? 'text-teal-800' : 'text-gray-900'}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-1 overflow-y-auto">
                    <div className="w-16 flex-shrink-0 border-r">
                        {hours.map((hour) => (
                            <div key={hour} className="h-12 border-b  text-right pr-2 text-xs text-gray-500">
                                {`${hour}:00`}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-1 relative">
                        {weekDays.map((date, dayIndex) => (
                            <div key={dayIndex} className="flex-1 border-l relative">
                                {hours.map((hour, hourIndex) => (
                                    <div key={hourIndex} onDoubleClick={() => handleDayClick(date)} className="h-12 cursor-pointer border-b border-gray-200 relative">
                                        <div className="absolute inset-0 border-t border-gray-200 border-dashed" />
                                        {getTodayIndex() === dayIndex && getCurrentHourPosition() >= hourIndex && getCurrentHourPosition() < hourIndex + 1 && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: `${(getCurrentHourPosition() - hourIndex) * 100}%`,
                                                    left: '0',
                                                    right: '0',
                                                    height: '4px',
                                                    backgroundColor: '#238781',
                                                    zIndex: 10,
                                                }}
                                                title={`Heure actuelle: ${tooltipTime}`}
                                            >
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-5px',
                                                        left: '-5px',
                                                        width: '13px',
                                                        height: '13px',
                                                        backgroundColor: '#238781',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {showModal && (
                                    <EventModal
                                        isOpen={showModal}
                                        onClose={() => setShowModal(false)}
                                        onAddEvent={handleAddEvent}
                                        onEditEvent={onEditEvent}
                                        selectedDate={selectedDate}
                                        selectedTime={modalTime}
                                        eventToEdit={selectedEvent}
                                    />
                                )}
                                {filteredEvents
                                    .filter(event => {
                                        const eventStartDate = new Date(event.startDate).toISOString().split('T')[0];
                                        const eventEndDate = new Date(event.endDate).toISOString().split('T')[0];
                                        const currentDate = date.toISOString().split('T')[0];

                                        // L'événement est affiché si l'un des jours d'événement coïncide avec la date actuelle
                                        return eventStartDate <= currentDate && eventEndDate >= currentDate;
                                    })
                                    .map((event, index) => {
                                        const style = calculateEventStyle(event);
                                        const isStartDate = new Date(event.startDate).toISOString().split('T')[0] === date.toISOString().split('T')[0];

                                        return (
                                            <div
                                                key={index}
                                                className={`absolute left-1 rounded-sm right-1 bg-[#E8F3F2] w-full shadow-sm hover:shadow-md ${isStartDate ? 'border-l-4 border-[#238781] rounded-r-md' : 'border-none'
                                                    }`}
                                                style={style}
                                                onContextMenu={(e) => handleRightClick(e, event)}
                                            >
                                                <div className="p-2">
                                                    <div className={`text-sm font-medium text-gray-800 truncate ${!isStartDate ? 'hidden' : 'block'}`}>
                                                        {event.title}
                                                    </div>
                                                    <div className={`text-xs text-gray-600 ${!isStartDate ? 'hidden' : 'block'}`}>
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

                                {showDeleteModal && (

                                    <Dialog open={open} onClose={setOpen} className="relative ">
                                        <DialogBackdrop
                                            transition
                                            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                                        />

                                        <div className="fixed inset-0  w-screen overflow-y-auto">
                                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                                <DialogPanel
                                                    transition
                                                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                                >
                                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                                        <div className="sm:flex sm:items-start">
                                                            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                                                <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                                                            </div>
                                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                                                    Confirmer la suppression
                                                                </DialogTitle>
                                                                <div className="mt-2">
                                                                    <p className="text-sm text-gray-500">
                                                                        Êtes-vous sûr de vouloir supprimer cet événement ?
                                                                        Cette action est irréversible !
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                        <button
                                                            type="button"
                                                            onClick={handleDeleteEvent}
                                                            className="inline-flex cursor-pointer w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                                                        >
                                                            Supprimer
                                                        </button>
                                                        <button
                                                            type="button"
                                                            data-autofocus
                                                            onClick={() => setShowDeleteModal(false)}
                                                            className="mt-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                        >
                                                            Annuler
                                                        </button>
                                                    </div>
                                                </DialogPanel>
                                            </div>
                                        </div>
                                    </Dialog>
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarWeek;
