import React, { useState, useEffect } from 'react';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import CalendarWorkWeek from './components/CalendarWorkWeek';
import CalendarDays from './components/CalendarDays';
import NavBar from './components/NavBar';
import EventModal from './components/EventModal';
import { useEventStore } from './context/EventStore'; // Import du store

function App() {
    const [view, setView] = useState('month'); // 'month', 'week', 'workweek', 'day'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Stocke la date actuelle
    const [isModalOpen, setIsModalOpen] = useState(false); // Gère l'affichage du modal

    // Accès à l'état global du store
    const { state, fetchEvents, addEvent, deleteEvent, updateEvent } = useEventStore();
    const { events, loading, error } = state;

    // Charger les événements au démarrage
    useEffect(() => {
        if (events.length === 0) {
            fetchEvents(); // Appel pour charger les événements depuis l'API
        }
    }, [events.length, fetchEvents]);

    // Fonction pour revenir au jour actuel
    function goToToday() {
        setCurrentDate(new Date()); // Mettre à jour la date actuelle
        setView('day');
    }

    // Fonction pour ouvrir et fermer le modal
    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    // Fonction pour gérer l'ajout d'un événement (exemple simplifié)
    function handleAddEvent(event) {
        addEvent(event);
        closeModal();
    }

    return (
        <div className="App">
            <NavBar setView={setView} goToToday={goToToday} /> {/* Passe goToToday à NavBar */}
            {loading && <p>Chargement des événements...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {view === 'month' ? (
                <CalendarMonth
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    events={events}
                    onAddEvent={addEvent}
                    onDeleteEvent={deleteEvent}
                    onUpdateEvent={updateEvent}
                />
            ) : view === 'week' ? (
                <CalendarWeek
                    currentMonth={currentDate}
                    events={events}
                    onAddEvent={addEvent}
                    onDeleteEvent={deleteEvent}
                    onUpdateEvent={updateEvent}
                />
            ) : view === 'work-week' ? (
                <CalendarWorkWeek
                    currentMonth={currentDate}
                    events={events}
                    onAddEvent={addEvent}
                    onDeleteEvent={deleteEvent}
                    onUpdateEvent={updateEvent}
                />
            ) : (
                <CalendarDays
                    events={events}
                    onAddEvent={addEvent}
                    onDeleteEvent={deleteEvent}
                    onUpdateEvent={updateEvent}
                />
            )}

            {/* Bouton flottant pour ajouter un événement */}
            <button
                onClick={openModal}
                className="fixed bottom-6 cursor-pointer right-6 bg-[#238781] text-white font-bold py-3 px-5 rounded-full shadow-lg hover:bg-teal-700 transition-all"
            >
                +
            </button>

            {/* Modal d'ajout d'événement */}
            {isModalOpen && (
                <EventModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onAddEvent={handleAddEvent}
                />
            )}
        </div>
    );
}

export default App;
