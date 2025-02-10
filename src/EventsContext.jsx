import React, { createContext, useState, useContext } from 'react';

// Création du contexte
const EventsContext = createContext();

// Création du provider qui va envelopper l'application et fournir l'état
export const EventsProvider = ({ children }) => {
    const [events, setEvents] = useState([]);

    // Fonction pour ajouter un événement
    const handleAddEvent = (eventData) => {
        const newEvent = {
            id: Date.now().toString(),
            ...eventData
        };
        setEvents((prev) => [...prev, newEvent]);
    };

    // Fournir les données et les fonctions aux composants enfants
    return (
        <EventsContext.Provider value={{ events, handleAddEvent }}>
            {children}
        </EventsContext.Provider>
    );
};

// Création d'un hook personnalisé pour consommer le contexte
export const useEvents = () => useContext(EventsContext);
