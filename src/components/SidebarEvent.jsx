import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import purpleCalendar from '../assets/purplecalendar.png';
import Icon from '@mdi/react';
import { mdiClockOutline, mdiRepeat, mdiDelete, mdiPencil } from '@mdi/js';
import EditEventModal from './EditEventModal'; // Assure-toi d'importer ton modal

const SidebarEvent = ({ selectedDate, onClose, events, onDeleteEvent, onUpdateEvent }) => {
    const [eventList, setEventList] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    // Nouvel état pour contrôler l'affichage du modal de modification
    const [showEditModal, setShowEditModal] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);

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

    const handleDeleteClick = (eventId) => {
        console.log("Suppression demandée pour l'événement ID:", eventId);
        setEventToDelete(eventId);
        setShowDeleteModal(true);
    };


    const confirmDelete = () => {
        if (eventToDelete) {
            console.log("Suppression confirmée pour l'événement ID:", eventToDelete);
            onDeleteEvent(eventToDelete);
            setShowDeleteModal(false);
            setEventToDelete(null);
        } else {
            console.log("Aucun événement à supprimer");
        }
    };




    const handleEditEvent = (updatedEvent) => {
        onUpdateEvent(updatedEvent);
        setShowEditModal(false);
    };

    // Fonction pour ouvrir le modal de modification
    const handleEditClick = (event) => {
        setEventToEdit(event);
        setShowEditModal(true); // Ouvre le modal en définissant showEditModal à true
        console.log('edit', event);
        console.log(showEditModal)
    };

    if (!selectedDate) return null;

    return (
        <div className="w-1/6 lg:w-1/5 h-screen bg-white p-4 fixed right-0 top-0 shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        {selectedDate.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </h2>
                    <p className="text-xs text-gray-500">
                        {selectedDate.getFullYear()}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 cursor-pointer  hover:text-gray-700 transition-colors text-sm"
                >
                    ✖
                </button>
            </div>

            {eventList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)]">
                    <img src={purpleCalendar} alt="Calendrier" className=" opacity-50" />
                    <p className="text-gray-500 text-1xl font-bold text-center">Aucun événement prévu ce jour.</p>
                    <p className='text-gray-500 text-xs text-center'>Passez une bonne journée !</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {eventList.map((event, index) => (
                        <div
                            key={event.id || index}
                            className="bg-white rounded-lg border border-gray-200 hover:border-[#E8F3F2] transition-all duration-200"
                        >
                            <div className="p-3 border-l-4 rounded-lg border-[#238781]">
                                <div className="flex justify-between items-start mb-1.5">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        {event.title}
                                    </h3>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleEditClick(event)} // Ouvre le modal lors du clic
                                            className="p-1 hover:bg-blue-200 cursor-pointer rounded-full transition-colors"
                                        >
                                            <Icon path={mdiPencil} size={0.8} className="text-gray-600" />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteClick(event._id)}
                                            className="p-1 hover:bg-red-200 cursor-pointer rounded-full transition-colors"
                                        >
                                            <Icon path={mdiDelete} size={0.8} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center text-gray-600">
                                        <Icon path={mdiClockOutline} size={0.8} className="mr-1.5" />
                                        <span className="text-xs">
                                            {getEventDuration(event)}
                                        </span>
                                    </div>

                                    {event.recurrence !== 'none' && (
                                        <div className="flex items-center text-gray-600">
                                            <Icon path={mdiRepeat} size={0.8} className="mr-1.5" />
                                            <span className="text-xs">
                                                {getRecurrenceText(event.recurrence)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de confirmation */}
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
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Affichage du modal de modification si showEditModal est true */}
            {showEditModal && eventToEdit && (
                <EditEventModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    eventToEdit={eventToEdit}
                    onEditEvent={handleEditEvent}
                />
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
