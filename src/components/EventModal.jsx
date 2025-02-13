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

    const handleAddEvent = () => {
        if (!allDay && (!startTime || !endTime)) {
            setNotification({ message: "Veuillez définir l'heure de début et de fin pour l'événement.", type: 'error' });
            setTimeout(() => setNotification(null), 4000);
            return;
        }

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
        };

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
                                    <input
                                        type="text"
                                        className="w-full border-b-2 border-gray-300 focus:border-[#238781] focus:outline-none transition-colors py-2"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Titre de l'événement"
                                    />
                                </div>

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
                                        <div className="w-10 h-5 relative bg-gray-300 rounded-full peer-checked:bg-[#238781] transition-colors duration-300">
                                            <div className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 peer-checked:translate-x-8"></div>
                                        </div>
                                    </label>
                                    <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
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
                                className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-[#238781] border border-transparent rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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