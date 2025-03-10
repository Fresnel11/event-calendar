import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays,
    Clock,
    MapPin,
    FileText,
    Bell,
    Users,
    X,
    Plus,
    Calendar,
    Search,
    CheckCircle,
    RepeatIcon,
} from 'lucide-react';
import Notification from './Notification';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const EventModal = ({ isOpen, onClose, selectedDate, onAddEvent }) => {
    // État initial
    const initialDate = selectedDate && selectedDate instanceof Date && !isNaN(selectedDate)
        ? new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0))
        : new Date();

    // États du formulaire
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(initialDate);
    const [endDate, setEndDate] = useState(initialDate);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [allDay, setAllDay] = useState(false);
    const [recurrence, setRecurrence] = useState('none');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [notification, setNotification] = useState(null);
    const [reminder, setReminder] = useState('none');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États pour les participants
    const [participantSearch, setParticipantSearch] = useState('');
    const [participantResults, setParticipantResults] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Gestion des tabs
    const [activeTab, setActiveTab] = useState('general');

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

    // Réinitialiser le formulaire à la fermeture
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setStartDate(initialDate);
            setEndDate(initialDate);
            setStartTime('09:00');
            setEndTime('10:00');
            setAllDay(false);
            setRecurrence('none');
            setLocation('');
            setDescription('');
            setReminder('none');
            setSelectedParticipants([]);
            setParticipantSearch('');
            setActiveTab('general');
        }
    }, [isOpen, initialDate]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Rechercher les participants
    const searchParticipants = async (email) => {
        if (email.length >= 3) {
            setIsSearching(true);
            try {
                const response = await fetch(`http://localhost:5000/api/users/search?email=${email}`);
                const data = await response.json();
                setParticipantResults(data);
            } catch (error) {
                console.error('Erreur lors de la recherche des participants:', error);
            } finally {
                setIsSearching(false);
            }
        } else {
            setParticipantResults([]);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (participantSearch) {
                searchParticipants(participantSearch);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [participantSearch]);

    const handleAddEvent = async () => {
        // Validation
        if (!title.trim()) {
            showNotification("Le titre de l'événement est requis.", 'error');
            return;
        }

        // Validation des horaires si nécessaire
        if (!allDay && (!startTime || !endTime)) {
            showNotification("Veuillez définir l'heure de début et de fin pour l'événement.", 'error');
            return;
        }

        // Convertir les dates et heures en objets Date pour la comparaison
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        if (!allDay) {
            const [startHours, startMinutes] = startTime.split(':').map(Number);
            const [endHours, endMinutes] = endTime.split(':').map(Number);

            startDateTime.setHours(startHours, startMinutes);
            endDateTime.setHours(endHours, endMinutes);
        }

        // Vérifier que la date/heure de fin n'est pas inférieure à la date/heure de début
        if (endDateTime < startDateTime) {
            showNotification("La date/heure de fin ne peut pas être antérieure à la date/heure de début.", 'error');
            return;
        }

        try {
            setIsSubmitting(true);

            // Création de l'objet événement
            const event = {
                title,
                startDate: startDateTime,
                endDate: endDateTime,
                startTime: allDay ? null : startTime,
                endTime: allDay ? null : endTime,
                allDay,
                recurrence,
                location,
                description,
                reminder,
                participants: selectedParticipants.map(user => ({ user: user._id, status: 'pending' })),
            };

            // Appeler la fonction pour ajouter l'événement
            await onAddEvent(event);

            // Fermer le modal après succès
            onClose();
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'événement:", error);
            showNotification("Une erreur est survenue lors de l'ajout de l'événement.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const addParticipant = (user) => {
        if (!selectedParticipants.some(p => p._id === user._id)) {
            setSelectedParticipants([...selectedParticipants, user]);
        }
        setParticipantSearch('');
        setParticipantResults([]);
    };

    const removeParticipant = (userId) => {
        setSelectedParticipants(selectedParticipants.filter(p => p._id !== userId));
    };

    // Animation variants
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
    };

    const tabVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <AnimatePresence>
            {/* Notification */}
            {notification && (
                <div className="fixed bottom-4 right-4 z-[100]">
                    <Notification message={notification.message} type={notification.type} />
                </div>
            )}

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-xs"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white  rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 bg-[#238781] text-white flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" />
                                Nouvel événement
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                                aria-label="Fermer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 pt-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`pb-3 px-1 text-sm cursor-pointer font-medium border-b-2 transition-colors ${activeTab === 'general'
                                            ? 'border-[#238781] text-[#238781] dark:text-[#3ebeb4]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Général
                                </button>
                                <button
                                    onClick={() => setActiveTab('participants')}
                                    className={`pb-3 px-1 text-sm cursor-pointer font-medium border-b-2 transition-colors ${activeTab === 'participants'
                                            ? 'border-[#238781] text-[#238781] dark:text-[#3ebeb4]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Participants {selectedParticipants.length > 0 && `(${selectedParticipants.length})`}
                                </button>
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`pb-3 px-1 text-sm cursor-pointer font-medium border-b-2 transition-colors ${activeTab === 'details'
                                            ? 'border-[#238781] text-[#238781] dark:text-[#3ebeb4]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Détails
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4 max-h-[calc(100vh-250px)] overflow-y-auto bg-white dark:bg-gray-800 dark:text-gray-200">
                            <AnimatePresence mode="wait">
                                {activeTab === 'general' && (
                                    <motion.div
                                        key="general"
                                        variants={tabVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-6"
                                    >
                                        {/* Titre */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Titre <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Titre de l'événement"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Date de début <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Calendar className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors"
                                                        value={startDate.toISOString().split('T')[0]}
                                                        onChange={(e) => setStartDate(new Date(e.target.value))}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Date de fin <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Calendar className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors"
                                                        value={endDate.toISOString().split('T')[0]}
                                                        onChange={(e) => setEndDate(new Date(e.target.value))}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Heures */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Heure de début
                                                </label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Clock className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="time"
                                                        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors ${allDay ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        disabled={allDay}
                                                        value={startTime}
                                                        onChange={(e) => setStartTime(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Heure de fin
                                                </label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Clock className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="time"
                                                        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors ${allDay ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        disabled={allDay}
                                                        value={endTime}
                                                        onChange={(e) => setEndTime(e.target.value)}
                                                    />
                                                </div>
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
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#238781]/20 dark:peer-focus:ring-[#238781]/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#238781]"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">Toute la journée</span>
                                            </label>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'participants' && (
                                    <motion.div
                                        key="participants"
                                        variants={tabVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-6"
                                    >
                                        {/* Recherche de participants */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Ajouter des participants
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Search className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors"
                                                    placeholder="Rechercher par email"
                                                    value={participantSearch}
                                                    onChange={(e) => setParticipantSearch(e.target.value)}
                                                />
                                                {isSearching && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Résultats de recherche */}
                                        {participantResults.length > 0 && (
                                            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
                                                <div className="max-h-48 overflow-y-auto">
                                                    {participantResults.map((user) => (
                                                        <div
                                                            key={user._id}
                                                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-[#238781]/20 text-[#238781] rounded-full flex items-center justify-center">
                                                                    {user.email.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-sm text-gray-800 dark:text-gray-200">{user.email}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => addParticipant(user)}
                                                                className="p-1 rounded-full bg-[#238781]/10 text-[#238781] hover:bg-[#238781]/20 transition-colors"
                                                                aria-label="Ajouter participant"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Participants sélectionnés */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Participants ({selectedParticipants.length})
                                                </h3>
                                                {selectedParticipants.length > 0 && (
                                                    <button
                                                        onClick={() => setSelectedParticipants([])}
                                                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        Tout supprimer
                                                    </button>
                                                )}
                                            </div>

                                            {selectedParticipants.length > 0 ? (
                                                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
                                                    <div className="max-h-64 overflow-y-auto">
                                                        {selectedParticipants.map((user) => (
                                                            <div
                                                                key={user._id}
                                                                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-8 h-8 bg-[#238781]/20 text-[#238781] rounded-full flex items-center justify-center">
                                                                        {user.email.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="text-sm text-gray-800 dark:text-gray-200">{user.email}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeParticipant(user._id)}
                                                                    className="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                                                                    aria-label="Supprimer participant"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                                                    <Users className="h-10 w-10 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                                        Aucun participant n'a été ajouté à cet événement
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'details' && (
                                    <motion.div
                                        key="details"
                                        variants={tabVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-6"
                                    >
                                        {/* Lieu */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Lieu
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPin className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    placeholder="Lieu de l'événement"
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Description
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="absolute top-3 left-3 pointer-events-none">
                                                    <FileText className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <textarea
                                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors min-h-[120px] resize-y"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Description de l'événement"
                                                ></textarea>
                                            </div>
                                        </div>

                                        {/* Récurrence */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Répétition
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <RepeatIcon className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <select
                                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors appearance-none"
                                                    value={recurrence}
                                                    onChange={(e) => setRecurrence(e.target.value)}
                                                >
                                                    <option value="none">Ne pas répéter</option>
                                                    <option value="daily">Tous les jours</option>
                                                    <option value="weekly">Toutes les semaines</option>
                                                    <option value="monthly">Tous les mois</option>
                                                    <option value="yearly">Tous les ans</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rappel */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Rappel
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Bell className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <select
                                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent transition-colors appearance-none"
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
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="text-red-500">*</span> Champs obligatoires
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAddEvent}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm cursor-pointer font-medium text-white bg-[#238781] border border-transparent rounded-lg hover:bg-[#1a6661] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#238781] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            <span>Création...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            <span>Créer l'événement</span>
                                        </>
                                    )}
                                </button>
                            </div>
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