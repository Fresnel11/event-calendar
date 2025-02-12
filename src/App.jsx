import React, { useState, useEffect } from 'react';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import CalendarWorkWeek from './components/CalendarWorkWeek';
import CalendarDays from './components/CalendarDays';
import NavBar from './components/NavBar';
import { useEventStore } from './context/EventStore'; // Import du store

function App() {
    const [view, setView] = useState('month'); // 'month', 'week', 'workweek', 'day'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Stocke la date actuelle

    // Accès à l'état global du store
    const { state, fetchEvents, addEvent, deleteEvent, updateEvent } = useEventStore();
    const { events, loading, error } = state;

    // Charger les événements au démarrage
    useEffect(() => {
        if (events.length === 0) {
            fetchEvents(); // Appel pour charger les événements depuis l'API
        }
    }, [events.length, fetchEvents]);

    // Fonction pour générer la semaine actuelle
    function getCurrentWeek() {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Premier jour de la semaine (dimanche)
        const week = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day);
        }
        return week;
    }

    // Fonction pour revenir au jour actuel
    function goToToday() {
        setCurrentDate(new Date()); // Mettre à jour la date actuelle
        setView('day'); // Si tu veux revenir directement en vue "jour"
    }

    // Affichage des événements selon la vue
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
        </div>
    );
}

export default App;
