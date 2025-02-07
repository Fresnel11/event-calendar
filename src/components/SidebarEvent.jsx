import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import purpleCalendar from '../assets/purplecalendar.png';
import Icon from '@mdi/react';
import { mdiClockOutline, mdiMapMarkerOutline, mdiRepeat, mdiDelete, mdiPencil } from '@mdi/js';

const SidebarEvent = ({ selectedDate, onClose, events, onDeleteEvent, onUpdateEvent }) => {
    const [eventList, setEventList] = useState([]);

    useEffect(() => {
        if (selectedDate) {
            const filteredEvents = events.filter(event =>
                new Date(event.startDate).toDateString() === selectedDate.toDateString()
            );
            setEventList(filteredEvents);
        }
    }, [selectedDate, events]);

    const formatTime = (time) => {
        if (!time) return '';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getEventDuration = (event) => {
        if (event.allDay) return 'Toute la journée';
        
        const start = formatTime(event.startTime);
        const end = formatTime(event.endTime);
        return `${start} - ${end}`;
    };

    const getRecurrenceText = (recurrence) => {
        const recurrenceMap = {
            'none': 'Pas de répétition',
            'daily': 'Tous les jours',
            'weekly': 'Toutes les semaines',
            'monthly': 'Tous les mois',
            'yearly': 'Tous les ans'
        };
        return recurrenceMap[recurrence] || 'Pas de répétition';
    };

    if (!selectedDate) return null;

    return (
        <div className="w-1/4 lg:w-1/5 h-screen bg-white p-6 fixed right-0 top-0 shadow-xl overflow-y-auto">
            {/* Header avec la date */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        {selectedDate.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {selectedDate.getFullYear()}
                    </p>
                </div>
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    ✖
                </button>
            </div>

            {/* Liste des événements */}
            {eventList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                    <img src={purpleCalendar} alt="Calendrier" className="w-32 h-32 mb-4 opacity-50" />
                    <p className="text-gray-500 text-center">Aucun événement prévu ce jour.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {eventList.map((event) => (
                        <div 
                            key={event.id} 
                            className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 overflow-hidden"
                        >
                            {/* En-tête de l'événement */}
                            <div className="p-4 border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {event.title}
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                const updatedTitle = prompt("Modifier l'événement :", event.title);
                                                if (updatedTitle) onUpdateEvent(event.id, updatedTitle);
                                            }}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <Icon path={mdiPencil} size={0.9} className="text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteEvent(event.id)}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <Icon path={mdiDelete} size={0.9} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Détails de l'événement */}
                                <div className="space-y-2">
                                    {/* Horaire */}
                                    <div className="flex items-center text-gray-600">
                                        <Icon path={mdiClockOutline} size={0.9} className="mr-2" />
                                        <span className="text-sm">
                                            {getEventDuration(event)}
                                        </span>
                                    </div>

                                    {/* Lieu */}
                                    {event.location && (
                                        <div className="flex items-center text-gray-600">
                                            <Icon path={mdiMapMarkerOutline} size={0.9} className="mr-2" />
                                            <span className="text-sm">
                                                {event.location}
                                            </span>
                                        </div>
                                    )}

                                    {/* Récurrence */}
                                    {event.recurrence !== 'none' && (
                                        <div className="flex items-center text-gray-600">
                                            <Icon path={mdiRepeat} size={0.9} className="mr-2" />
                                            <span className="text-sm">
                                                {getRecurrenceText(event.recurrence)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {event.description && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-sm text-gray-600">
                                            {event.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

SidebarEvent.propTypes = {
    selectedDate: PropTypes.instanceOf(Date),
    onClose: PropTypes.func.isRequired,
    events: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            startDate: PropTypes.instanceOf(Date).isRequired,
            endDate: PropTypes.instanceOf(Date).isRequired,
            startTime: PropTypes.string,
            endTime: PropTypes.string,
            allDay: PropTypes.bool,
            recurrence: PropTypes.string,
            location: PropTypes.string,
            description: PropTypes.string,
        })
    ).isRequired,
    onDeleteEvent: PropTypes.func.isRequired,
    onUpdateEvent: PropTypes.func.isRequired,
};

export default SidebarEvent;