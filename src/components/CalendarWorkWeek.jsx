import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeftDropCircle, mdiArrowRightDropCircle } from '@mdi/js';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';
import Notification from './Notification';
import { useEventStore } from '../context/EventStore';

const CalendarWorkWeek = ({ events, setEvents, onEditEvent, onAddEvent, onDeleteEvent }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [currentTime, setCurrentTime] = useState(new Date());
    const [tooltipTime, setTooltipTime] = useState(formatCurrentTime(new Date())); // État pour le tooltip
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null)
    const [modalTime, setModalTime] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [notification, setNotification] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { updateEvent } = useEventStore();

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

    const handleAddEvent = (newEvent) => {
        onAddEvent(newEvent);
        setNotification({ message: 'Événement ajouté avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    };

    function generateWorkWeekDays() {
        const days = [];
        for (let i = 0; i < 5; i++) { // Juste les jours de la semaine, de Lundi à Vendredi
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

    const closeContextMenu = () => {
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

    const handleCloseModal = () => {
        setEditModal(false);
    };

    const handleOpenModal = () => {
        setEditModal(true);
        setContextMenu(null);
    };

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

    const handleEditEvent = (updatedEvent) => {
        console.log("Événement modifié", updatedEvent);
        updateEvent(updatedEvent._id, updatedEvent);
        setContextMenu(null);


        setNotification({ message: 'Événement modifié avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
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
        <div>
            {/* Notification */}
            {notification && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Notification key={notification.message} message={notification.message} type={notification.type} />
                </div>
            )}
            <div onClick={closeContextMenu} className="flex flex-col h-full bg-white">
                {/* Header avec navigation */}
                <div className="flex items-center px-4 py-2 border-b">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrevWeek}
                            className="p-1 cursor-pointer rounded"
                        >
                            <Icon path={mdiArrowLeftDropCircle} size={1.3} color={'#238781'} />
                        </button>
                        <button
                            onClick={handleNextWeek}
                            className="p-1 cursor-pointer rounded"
                        >
                            <Icon path={mdiArrowRightDropCircle} size={1.3} color={'#238781'} />
                        </button>
                        <h2 className="text-lg font-semibold text-[#238781]">
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
                            className={`flex-1 border-l p-2 text-center ${isToday(date) ? 'bg-[#E8F3F2]' : ''}`}
                        >
                            <div className="text-sm font-medium text-gray-500">
                                {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                            </div>
                            <div className={`text-lg ${isToday(date) ? 'text-teal-800' : 'text-gray-900'}`}>
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
                                    <div key={hourIndex} onDoubleClick={() => handleDayClick(currentDay)} className="h-12 cursor-pointer border-b border-gray-200 relative">
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
                                                    backgroundColor: '#238781',
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
                                                        backgroundColor: '#238781',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
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
                                        const currentDate = currentDay.toISOString().split('T')[0];

                                        // L'événement doit être affiché sur toute sa durée
                                        return eventStartDate <= currentDate && eventEndDate >= currentDate;
                                    })
                                    .map((event, index) => {
                                        const style = calculateEventStyle(event);
                                        const isStartDate = new Date(event.startDate).toISOString().split('T')[0] === currentDay.toISOString().split('T')[0];

                                        return (
                                            <div
                                                key={index}
                                                className={`absolute left-1 rounded-sm right-1 bg-[#E8F3F2] w-full shadow-sm hover:shadow-md transition-shadow overflow-hidden 
                    ${isStartDate ? 'border-l-4 border-[#238781] rounded-r-md' : 'border-none'}`}
                                                style={style}
                                                onContextMenu={(e) => handleRightClick(e, event)}
                                            >
                                                <div className="p-2">
                                                    {/* Afficher le titre et l'heure uniquement le premier jour de l'événement */}
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

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarWorkWeek;
