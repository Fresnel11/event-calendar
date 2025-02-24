import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiTableLargePlus } from '@mdi/js';
import Notification from './Notification';

const EventModal = ({ isOpen, onClose, selectedDate, onAddEvent }) => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(
        selectedDate && selectedDate instanceof Date && !isNaN(selectedDate)
            ? new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0))
            : new Date()
    );
    const [endDate, setEndDate] = useState(
        selectedDate && selectedDate instanceof Date && !isNaN(selectedDate)
            ? new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0))
            : new Date()
    );

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [recurrence, setRecurrence] = useState('none');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [notification, setNotification] = useState(null);
    const [reminder, setReminder] = useState('none');

    // Participants
    const [participantSearch, setParticipantSearch] = useState('');
    const [participantResults, setParticipantResults] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    // Fermer le modal avec la touche Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Empêcher le scroll du body quand le modal est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Rechercher les participants
    const searchParticipants = async (email) => {
        if (email.length >= 3) {
            try {
                const response = await fetch(`http://localhost:5000/api/users/search?email=${email}`);
                const data = await response.json();
                setParticipantResults(data);
            } catch (error) {
                console.error('Erreur lors de la recherche des participants:', error);
            }
        } else {
            setParticipantResults([]);
        }
    };

    useEffect(() => {
        searchParticipants(participantSearch);
    }, [participantSearch]);

    const handleAddEvent = () => {
        // Validation des horaires si nécessaire
        if (!allDay && (!startTime || !endTime)) {
            setNotification({ message: "Veuillez définir l'heure de début et de fin pour l'événement.", type: 'error' });
            setTimeout(() => setNotification(null), 4000);
            return;
        }

        // Création de l'objet événement
        const event = {
            title,
            startDate,
            endDate,
            startTime,
            endTime,
            allDay,
            recurrence,
            location,
            description,
            reminder,
            participants: selectedParticipants.map(user => ({ user: user._id, status: 'pending' })),
        };

        // Appeler la fonction pour ajouter l'événement
        onAddEvent(event);
        onClose();
    };



    return (
        <AnimatePresence>
            {/* Notification */}
            {notification && (
                <div className="fixed bottom-4 right-4 z-99">
                    <Notification key={notification.message} message={notification.message} type={notification.type} />
                </div>
            )}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white text-black rounded-xl shadow-lg w-full max-w-3xl mx-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 shadow-sm bg-white flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Ajouter un événement
                            </h2>
                            <Icon path={mdiTableLargePlus} size={1} />
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <div className="space-y-6">
                                {/* Titre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Titre
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                        <input
                                            type="text"
                                            className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Titre de l'événement"
                                        />
                                    </div>
                                </div>

                                {/* Participants */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Participants
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                        placeholder="Rechercher un participant par e-mail"
                                        value={participantSearch}
                                        onChange={(e) => setParticipantSearch(e.target.value)}
                                    />
                                    {participantResults.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {participantResults.map((user) => (
                                                <div
                                                    key={user._id}
                                                    className="flex items-center justify-between p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                                                    onClick={() => {
                                                        setSelectedParticipants([...selectedParticipants, user]);
                                                        setParticipantSearch('');
                                                        setParticipantResults([]);
                                                    }}
                                                >
                                                    <span>{user.email}</span>
                                                    <span className="text-sm text-gray-500">Ajouter</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedParticipants.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Participants sélectionnés</h3>
                                        <div className="space-y-2">
                                            {selectedParticipants.map((user, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                                                    <span>{user.email}</span>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedParticipants(selectedParticipants.filter((_, i) => i !== index));
                                                        }}
                                                        className="text-sm text-red-500 hover:text-red-700"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date de début
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                            value={startDate.toLocaleDateString('fr-CA')}
                                            onChange={(e) => setStartDate(new Date(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date de fin
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                            value={endDate.toLocaleDateString('fr-CA')}
                                            onChange={(e) => setEndDate(new Date(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {/* Heures */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Heure de début
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                            disabled={allDay}
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Heure de fin
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                            disabled={allDay}
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* All Day Toggle */}
                                <div className="flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="allDay"
                                            checked={allDay}
                                            onChange={() => setAllDay(!allDay)}
                                            className="sr-only peer"
                                        />
                                        <div className="group peer bg-white rounded-full duration-300 w-10 h-5 ring-2 ring-red-500 
                        after:duration-300 after:bg-red-500 peer-checked:after:bg-[#238781] peer-checked:ring-[#238781] 
                        after:rounded-full after:absolute after:h-3 after:w-3 after:top-1 after:left-1 
                        after:flex after:justify-center after:items-center peer-checked:after:translate-x-5 
                        peer-hover:after:scale-95">
                                        </div>
                                    </label>
                                    <label htmlFor="allDay" className="ml-2 text-sm">
                                        Toute la journée
                                    </label>
                                </div>

                                {/* Récurrence */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Répétition
                                    </label>
                                    <select
                                        className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                        value={recurrence}
                                        onChange={(e) => setRecurrence(e.target.value)}
                                    >
                                        <option value="none">Ne pas répéter</option>
                                        <option value="daily">Tous les jours</option>
                                        <option value="weekly">Toutes les semaines</option>
                                        <option value="monthly">Tous les mois</option>
                                        <option value="yearly">Tous les ans</option>
                                    </select>
                                </div>

                                {/* Lieu */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lieu
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Lieu de l'événement"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2 min-h-[100px]"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description de l'événement"
                                    ></textarea>
                                </div>
                                {/* Rappel */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rappel avant l'événement</label>
                                    <select
                                        className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                        value={reminder}
                                        onChange={(e) => setReminder(e.target.value)}
                                    >
                                        <option value="none">Aucun rappel</option>
                                        <option value="at_event_time">Au moment de l'événement</option>
                                        <option value="5_min_before">5 minutes avant</option>
                                        <option value="15_min_before">15 minutes avant</option>
                                        <option value="30_min_before">30 minutes avant</option>
                                        <option value="1_hour_before">1 heure avant</option>
                                        <option value="2_hours_before">2 heures avant</option>
                                        <option value="12_hours_before">12 heures avant</option>
                                        <option value="1_day_before">1 jour avant</option>
                                        <option value="1_week_before">1 semaine avant</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-white shadow-sm flex justify-end space-x-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-red-500 bg-white border-none cursor-pointer rounded-lg  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddEvent}
                                className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-[#238781] border border-transparent rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                            >
                                Ajouter
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
EventModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedDate: PropTypes.instanceOf(Date).isRequired,
    onAddEvent: PropTypes.func.isRequired,
};

export default EventModal;