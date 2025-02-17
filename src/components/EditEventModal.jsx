import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiTableLargePlus } from '@mdi/js';

const EditEventModal = ({ isOpen, onClose, eventToEdit, onEditEvent }) => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [recurrence, setRecurrence] = useState('none');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    // Mettre à jour les valeurs du formulaire quand l'événement est ouvert pour modification
    useEffect(() => {
        if (eventToEdit) {
            setTitle(eventToEdit.title);
            setStartDate(new Date(eventToEdit.startDate));
            setEndDate(new Date(eventToEdit.endDate));
            setStartTime(eventToEdit.startTime || '');
            setEndTime(eventToEdit.endTime || '');
            setAllDay(eventToEdit.allDay || false);
            setRecurrence(eventToEdit.recurrence || 'none');
            setLocation(eventToEdit.location || '');
            setDescription(eventToEdit.description || '');
        }
    }, [eventToEdit]);

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

    const handleEditEvent = () => {
        const updatedEvent = {
            ...eventToEdit, // On garde les propriétés de l'événement original
            title: title || undefined, // Utiliser undefined si vide
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            allDay,
            recurrence: recurrence || 'none', // La récurrence est une valeur par défaut
            location: location || undefined,
            description: description || undefined,
        };
        onEditEvent(updatedEvent);
        onClose();
    };


    return (
        <AnimatePresence>
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
                        className="bg-white text-black rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 shadow-sm bg-white flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Modifier l'événement
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
                                onClick={handleEditEvent}
                                className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-[#238781] border border-transparent rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                            >
                                Enregistrer les modifications
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

EditEventModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    eventToEdit: PropTypes.object,
    onEditEvent: PropTypes.func.isRequired,
};

export default EditEventModal;
