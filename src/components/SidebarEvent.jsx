import React, { useState, useEffect } from 'react';

const SidebarEvent = ({ selectedDate, onClose, events, onDeleteEvent, onUpdateEvent }) => {
    const [eventList, setEventList] = useState([]);
    console.log(events);
    

    useEffect(() => {
        if (selectedDate) {
            // Filtrer les événements pour la date sélectionnée
            const filteredEvents = events.filter(event =>
                new Date(event.date).toDateString() === selectedDate.toDateString()
            );
            setEventList(filteredEvents);
        }
    }, [selectedDate, events]);

    const handleDelete = (id) => {
        onDeleteEvent(id);  // Appelle la fonction de suppression
    };

    const handleUpdate = (id, updatedTask) => {
        onUpdateEvent(id, updatedTask);  // Appelle la fonction de mise à jour
    };

    if (!selectedDate) return null;

    return (
        <div className="w-1/6 h-screen bg-gray-100 border-l p-4 fixed right-0 top-0 shadow-lg">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-bold">
                    {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={onClose} className="text-gray-600 cursor-pointer hover:text-gray-800">✖</button>
            </div>

            {events.length === 0 ? (
                <p className="text-gray-500">Aucun événement prévu ce jour.</p>
            ) : (
                <div>
                    {events.map((event, index) => (
                        <div key={index} className="bg-white p-4 mb-2 border rounded-md shadow-sm">
                            <p className="text-gray-800">{event.date.title}</p>
                            <p>{event.date.description}</p>
                            <div className="flex justify-end mt-2 space-x-2">
                                <button
                                    onClick={() => handleUpdate(event, prompt("Modifier l'événement :", event.date.title))}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleDelete(event)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SidebarEvent;
