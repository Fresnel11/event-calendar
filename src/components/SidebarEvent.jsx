import React from 'react';

const SidebarEvent = ({ selectedDate, onClose }) => {
    if (!selectedDate) return null;

    return (
        <div className="w-1/6 h-screen bg-gray-100 border-l p-4 fixed right-0 top-0 shadow-lg">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-bold">
                    {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={onClose} className="text-gray-600 cursor-pointer hover:text-gray-800">✖</button>
            </div>

            <p className="text-gray-500">Aucun événement prévu ce jour.</p>
        </div>
    );
};

export default SidebarEvent;