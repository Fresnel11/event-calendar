// src/App.jsx
import React, { useState } from 'react';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import CalendarWorkWeek from './components/CalendarWorkWeek'; 
import CalendarDays from './components/CalendarDays';
import NavBar from './components/NavBar';

function App() {
    const [view, setView] = useState('month'); // 'month', 'week', ou 'workweek'
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Initialiser avec la date actuelle

    return (
        <div className="App">
            <NavBar setView={setView} />
            {view === 'month' ? (
                <CalendarMonth currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
            ) : view === 'week' ? (
                <CalendarWeek />
            ) : view === 'work-week' ? (
                <CalendarWorkWeek currentMonth={currentMonth} /> // Afficher CalendarWorkWeek lorsque "workweek" est sélectionné
            ) : <CalendarDays />}
        </div>
    );
}

export default App;
