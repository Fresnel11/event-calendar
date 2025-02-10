// src/App.jsx
import React, { useState, useEffect } from 'react';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import CalendarWorkWeek from './components/CalendarWorkWeek';
import CalendarDays from './components/CalendarDays';
import NavBar from './components/NavBar';

function App() {
    const [view, setView] = useState('month'); // 'month', 'week', 'workweek', 'day'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState([]); // Stockage des événements

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

    return (
        <div className="App">
            <NavBar setView={setView} />
            {view === 'month' ? (
                <CalendarMonth 
                    currentMonth={currentMonth} 
                    setCurrentMonth={setCurrentMonth} 
                    events={events} 
                    onAddEvent={addEvent} 
                />
            ) : view === 'week' ? (
                <CalendarWeek events={events} onAddEvent={addEvent} />
            ) : view === 'work-week' ? (
                <CalendarWorkWeek 
                    currentMonth={currentMonth} 
                    events={events} 
                    onAddEvent={addEvent} 
                />
            ) : (
                <CalendarDays events={events} onAddEvent={addEvent} />
            )}
        </div>
    );
}

export default App;
