import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import purpleCalendar from '../assets/purplecalendar.png';

const SidebarEvent = ({ selectedDate, onClose, events, onDeleteEvent, onUpdateEvent }) => {
    const [eventList, setEventList] = useState([]);

    useEffect(() => {
        if (selectedDate) {
            const filteredEvents = events.filter(event =>
                new Date(event.date).toDateString() === selectedDate.toDateString()
            );
            setEventList(filteredEvents);
        }
    }, [selectedDate, events]);

    const handleDelete = (id) => {
        onDeleteEvent(id);
    };

    const handleUpdate = (id, updatedTask) => {
        onUpdateEvent(id, updatedTask);
    };

    if (!selectedDate) return null;

    return (
        <div className="w-1/4 lg:w-1/5 h-screen bg-white border-l p-6 fixed right-0 top-0 shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    {selectedDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </h2>
                <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-all duration-200">
                    ✖
                </button>
            </div>

            {eventList.length === 0 ? (
                <div className='translate-y-1/2'>
                    <img src={purpleCalendar} alt="Calendrier" />
                    <p className="text-center text-gray-500">Aucun événement prévu ce jour.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {eventList.map((event) => (
                        <div key={event.id} className="bg-gray-50 p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <h3 className="text-lg font-semibold text-gray-700">{event.title}</h3>
                            <p className="text-gray-600 mt-1">{event.description}</p>
                            <div className="flex justify-end mt-3 space-x-4">
                                <button
                                    onClick={() => {
                                        const updatedTitle = prompt("Modifier l'événement :", event.title);
                                        if (updatedTitle) handleUpdate(event.id, updatedTitle);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-all duration-200"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="text-red-600 hover:text-red-800 transition-all duration-200"
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

SidebarEvent.propTypes = {
    selectedDate: PropTypes.instanceOf(Date),
    onClose: PropTypes.func.isRequired,
    events: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
        })
    ).isRequired,
    onDeleteEvent: PropTypes.func.isRequired,
    onUpdateEvent: PropTypes.func.isRequired,
};

export default SidebarEvent;
