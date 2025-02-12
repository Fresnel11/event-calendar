import React, { useState, useEffect } from 'react';

const NavBar = ({ setView, goToToday }) => {
    const [selectedView, setSelectedView] = useState('days'); // Valeur par défaut, si aucune vue n'est sélectionnée.

    useEffect(() => {
        // Récupérer la vue sélectionnée depuis le localStorage lors du chargement de la page
        const savedView = localStorage.getItem('selectedView');
        if (savedView) {
            setSelectedView(savedView);
            setView(savedView); // Mettre à jour la vue dans le composant parent
        }
    }, [setView]);

    // Fonction pour changer la vue
    const handleSetView = (view) => {
        setSelectedView(view);  // Mettre à jour l'option sélectionnée
        setView(view);  // Appeler la fonction passée en props pour changer la vue
        localStorage.setItem('selectedView', view); // Sauvegarder la vue sélectionnée dans le localStorage
    };

    return (
        <div className="flex justify-center space-x-6 mb-6 bg-white shadow-md py-2 px-4 rounded-lg">
            <button
                onClick={() => handleSetView('days')}
                className={`px-6 py-3 cursor-pointer rounded-lg font-semibold text-sm 
                    ${selectedView === 'days' ? 'bg-[#238781] text-white' : 'text-gray-600 hover:bg-gray-200'}
                    transition-all duration-300 ease-in-out focus:outline-none`}
            >
                Jour
            </button>
            <button
                onClick={() => handleSetView('month')}
                className={`px-6 py-3 cursor-pointer rounded-lg font-semibold text-sm 
                    ${selectedView === 'month' ? 'bg-[#238781] text-white' : 'text-gray-600 hover:bg-gray-200'}
                    transition-all duration-300 ease-in-out focus:outline-none`}
            >
                Mois
            </button>
            <button
                onClick={() => handleSetView('week')}
                className={`px-6 py-3 cursor-pointer rounded-lg font-semibold text-sm 
                    ${selectedView === 'week' ? 'bg-[#238781] text-white' : 'text-gray-600 hover:bg-gray-200'}
                    transition-all duration-300 ease-in-out focus:outline-none`}
            >
                Semaine
            </button>
            <button
                onClick={() => handleSetView('work-week')}
                className={`px-6 py-3 cursor-pointer rounded-lg font-semibold text-sm 
                    ${selectedView === 'work-week' ? 'bg-[#238781] text-white' : 'text-gray-600 hover:bg-gray-200'}
                    transition-all duration-300 ease-in-out focus:outline-none`}
            >
                Semaine de travail
            </button>
            
        </div>
    );
};

export default NavBar;
