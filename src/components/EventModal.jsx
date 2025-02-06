import React, { useState } from 'react';

const EventModal = ({ isOpen, onClose, selectedDate }) => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(selectedDate);
    const [endDate, setEndDate] = useState(selectedDate);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [recurrence, setRecurrence] = useState('none');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Ajouter un événement</h2>
                <label className="block mb-2">Titre</label>
                <input type="text" className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
                
                <div className="flex justify-between mt-2">
                    <div>
                        <label>Date de début</label>
                        <input type="date" className="border p-2 rounded w-full" value={startDate.toISOString().split('T')[0]} onChange={(e) => setStartDate(new Date(e.target.value))} />
                    </div>
                    <div>
                        <label>Date de fin</label>
                        <input type="date" className="border p-2 rounded w-full" value={endDate.toISOString().split('T')[0]} onChange={(e) => setEndDate(new Date(e.target.value))} />
                    </div>
                </div>
                
                <div className="flex justify-between mt-2">
                    <div>
                        <label>Heure de début</label>
                        <input type="time" className="border p-2 rounded w-full" disabled={allDay} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div>
                        <label>Heure de fin</label>
                        <input type="time" className="border p-2 rounded w-full" disabled={allDay} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                </div>
                
                <div className="flex items-center mt-2">
                    <input type="checkbox" className="mr-2" checked={allDay} onChange={() => setAllDay(!allDay)} />
                    <label>Toute la journée</label>
                </div>
                
                <label className="block mt-2">Répétition</label>
                <select className="w-full border p-2 rounded" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                    <option value="none">Ne pas répéter</option>
                    <option value="daily">Tous les jours</option>
                    <option value="weekly">Toutes les semaines</option>
                    <option value="monthly">Tous les mois</option>
                    <option value="yearly">Tous les ans</option>
                </select>
                
                <label className="block mt-2">Lieu</label>
                <input type="text" className="w-full border p-2 rounded" value={location} onChange={(e) => setLocation(e.target.value)} />
                
                <label className="block mt-2">Description</label>
                <textarea className="w-full border p-2 rounded" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={onClose}>Annuler</button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
