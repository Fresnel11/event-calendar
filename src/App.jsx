import React, { useState, useEffect } from 'react';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import CalendarWorkWeek from './components/CalendarWorkWeek';
import CalendarDays from './components/CalendarDays';
import NavBar from './components/NavBar';

function App() {
    const [view, setView] = useState('month'); // 'month', 'week', 'workweek', 'day'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek()); // Ajouter currentWeek
    const [events, setEvents] = useState([]);

    // Charger les événements depuis le localStorage au démarrage
    useEffect(() => {
        const storedEvents = JSON.parse(localStorage.getItem('events')) || [];
        setEvents(storedEvents);
        console.log('Événements chargés depuis le localStorage:', storedEvents);
    }, []);

    // Fonction pour ajouter un événement
    const addEvent = (newEvent) => {
        // Ajouter l'événement au tableau existant
        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);

        // Sauvegarder les événements mis à jour dans le localStorage
        localStorage.setItem('events', JSON.stringify(updatedEvents));
    };

    const handleDeleteEvent = (eventId) => {
        const updatedEvents = events.filter(event => event.id !== eventId);
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
    };

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

    return (
        <div className="App">
            <NavBar setView={setView} />
            {view === 'month' ? (
                <CalendarMonth
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    events={events}
                    onAddEvent={addEvent}
                    setEvents={setEvents}
                    onDeleteEvent={handleDeleteEvent}
                />
            ) : view === 'week' ? (
                <CalendarWeek
                    currentMonth={currentMonth}
                    events={events}
                    setEvents={setEvents}
                    onAddEvent={addEvent}
                />
            ) : view === 'work-week' ? (
                <CalendarWorkWeek
                    currentMonth={currentMonth}
                    events={events}
                    onAddEvent={addEvent}
                />
            ) : (
                <CalendarDays
                    events={events}
                    onAddEvent={addEvent}
                    setEvents={setEvents}
                    onDeleteEvent={handleDeleteEvent}
                />
            )}
        </div>
    );
}

export default App;
