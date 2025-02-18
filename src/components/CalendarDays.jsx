import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeftDropCircle, mdiArrowRightDropCircle, mdiCalendarToday, mdiPencilCircle, mdiDeleteCircle } from '@mdi/js';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';
import Notification from './Notification';
import { useEventStore } from '../context/EventStore';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'


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
    const [editedEvent, setEditedEvent] = useState(null);
    const { updateEvent } = useEventStore();
    const [open, setOpen] = useState(true)


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

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // const calculateEventStyle = (event) => {
    //     if (!event.startDate || !event.endDate) {
    //         console.error("L'événement doit avoir des dates de début et de fin.");
    //         return { top: '0%', height: '0%' };
    //     }

    //     const startTime = new Date(event.startDate);
    //     const endTime = new Date(event.endDate);

    //     // Gérer les événements en "all-day"
    //     if (event.allDay) {
    //         return {
    //             top: '0%',
    //             height: '100%',
    //         };
    //     }

    //     let startHour = startTime.getHours() + startTime.getMinutes() / 60;
    //     let endHour = endTime.getHours() + endTime.getMinutes() / 60;

    //     // Vérification et conversion des heures personnalisées
    //     if (event.startTime && /^[0-9]{2}:[0-9]{2}$/.test(event.startTime)) {
    //         const [startHourPart, startMinutePart] = event.startTime.split(':').map(Number);
    //         startHour = startHourPart + startMinutePart / 60;
    //     }
    //     if (event.endTime && /^[0-9]{2}:[0-9]{2}$/.test(event.endTime)) {
    //         const [endHourPart, endMinutePart] = event.endTime.split(':').map(Number);
    //         endHour = endHourPart + endMinutePart / 60;
    //     }

    //     if (endHour < startHour) {
    //         endHour += 24;
    //     }

    //     const duration = Math.max(endHour - startHour, 0); // Éviter une hauteur négative

    //     return {
    //         top: `${(startHour / 24) * 100}%`,
    //         height: `${(duration / 24) * 100}%`,
    //     };
    // };


    // const eventsForDay = events.filter(event => {
    //     const eventDate = new Date(event.startDate);
    //     const selectedDay = formatDate(selectedDate);
    //     return formatDate(eventDate) === selectedDay;
    // });
    const calculateEventStyle = (event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const currentDate = new Date(selectedDate);

        // Normaliser les dates
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

        if (event.allDay) {
            return {
                top: '0%',
                height: '100%',
            };
        }

        let startHour = 0;
        let endHour = 24;

        // Si c'est le premier jour de l'événement
        if (normalizedCurrentDate.getTime() === normalizedEventStart.getTime()) {
            startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
        }

        // Si c'est le dernier jour de l'événement
        if (normalizedCurrentDate.getTime() === normalizedEventEnd.getTime()) {
            endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
        }

        // Pour les événements avec des heures spécifiques
        if (event.startTime && normalizedCurrentDate.getTime() === normalizedEventStart.getTime()) {
            const [startHourPart, startMinutePart] = event.startTime.split(':');
            startHour = parseInt(startHourPart) + parseInt(startMinutePart) / 60;
        }
        if (event.endTime && normalizedCurrentDate.getTime() === normalizedEventEnd.getTime()) {
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
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const currentDate = new Date(selectedDate);

        // Normaliser les dates (ignorer les heures)
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

        // Vérifier si l'événement chevauche la date sélectionnée
        return normalizedCurrentDate >= normalizedEventStart &&
            normalizedCurrentDate <= normalizedEventEnd;
    });



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
        onAddEvent(newEvent);
        setNotification({ message: 'Événement ajouté avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };


    const handleCloseModal = () => {
        setEditModal(false);
    };

    const handleEditEvent = (updatedEvent) => {
        console.log("Événement modifié", updatedEvent);

        // Mettre à jour l'événement dans le store
        updateEvent(updatedEvent._id, updatedEvent);

        // Mettre à jour l'événement localement dans l'état du composant
        // setEvents((prevEvents) =>
        //     prevEvents.map((event) =>
        //         event.id === updatedEvent.id ? updatedEvent : event
        //     )
        // );

        setSelectedEvent(null);
        setContextMenu(null);

        // Notification
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

    return (


        <div>
            {/* Notification */}
            {notification && (
                <Notification key={notification.message} message={notification.message} type={notification.type} />
            )}
            <div className="flex flex-col h-full bg-white rounded-lg shadow-lg" onClick={closeContextMenu}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    {/* Bouton de navigation à gauche */}
                    <button
                        className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                        onClick={() => changeDay(-1)}
                    >
                        <Icon path={mdiArrowLeftDropCircle} size={1.3} color={'#238781'} />
                    </button>

                    {/* Icône "Aujourd'hui" avec Tooltip */}
                    <div className="flex items-center justify-center space-x-4 relative group">
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

                    {/* Section du jour et de la date */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-[#238781]">
                            {selectedDate.getDate()}
                        </div>
                        <div className="text-sm text-[#238781] capitalize">
                            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Bouton de navigation à droite */}
                    <button
                        className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                        onClick={() => changeDay(1)}
                    >
                        <Icon path={mdiArrowRightDropCircle} size={1.3} color={'#238781'} />
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
                                    className="relative h-0.5 bg-[#238781]"
                                    title={`Heure actuelle: ${tooltipTime}`}
                                >
                                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-[#238781] rounded-full shadow-md" />
                                </div>
                            </div>
                        )}
                        {eventsForDay.map((event, index) => {
                            const style = calculateEventStyle(event);
                            const eventStart = new Date(event.startDate);
                            const eventEnd = new Date(event.endDate);
                            const currentDate = new Date(selectedDate);

                            // Normaliser les dates
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

                            const isFirstDay = normalizedCurrentDate.getTime() === normalizedEventStart.getTime();
                            const isLastDay = normalizedCurrentDate.getTime() === normalizedEventEnd.getTime();
                            const isMultiDay = normalizedEventStart.getTime() !== normalizedEventEnd.getTime();

                            return (
                                <div
                                    key={index}
                                    className={`
                absolute left-1 right-1
                ${isMultiDay ? 'bg-[#E8F3F2]/90' : 'bg-[#E8F3F2]'}
                border-l-4 border-[#238781]
                ${!isLastDay ? 'rounded-r-none' : 'rounded-r-md'}
                ${!isFirstDay ? 'rounded-l-none' : 'rounded-l-md'}
                shadow-sm hover:shadow-md transition-shadow overflow-hidden
            `}
                                    style={style}
                                    onContextMenu={(e) => handleRightClick(e, event)}
                                >
                                    <div className="p-2">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium text-gray-800 truncate">
                                                {event.title}
                                                {isMultiDay && (
                                                    <span className="ml-2 text-xs text-gray-600">
                                                        {isFirstDay ? '(Début)' : isLastDay ? '(Fin)' : '(Continue)'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {isFirstDay ? (
                                                event.startTime || eventStart.toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            ) : '00:00'}
                                            {' - '}
                                            {isLastDay ? (
                                                event.endTime || eventEnd.toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            ) : '23:59'}
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
                        selectedDate={selectedDate}
                        selectedTime={modalTime}
                        eventToEdit={selectedEvent}
                    />
                )}
                {showDeleteModal && (
                    <Dialog open={open} onClose={setOpen} className="relative z-10">
                        <DialogBackdrop
                            transition
                            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                        />

                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
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
                            className="flex items-center shadow-sm px-4 py-3 hover:bg-blue-100 cursor-pointer transition duration-200 ease-in-out rounded-t-lg"
                            onClick={handleOpenModal}
                        >
                            {/* <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V5h2v6z" /></svg> */}
                            <Icon className="w-4 h-4 mr-2" path={mdiPencilCircle} size={1} color={'blue'} />
                            <span className="font-semibold text-gray-800">Modifier</span>
                        </div>
                        
                        <div
                            className="flex items-center px-4 py-3 hover:bg-red-100 cursor-pointer transition duration-200 ease-in-out"
                            onClick={() => setShowDeleteModal(true)}
                        >

                            <Icon className="w-4 h-4 mr-2" path={mdiDeleteCircle} size={1} color={'red'}/>
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