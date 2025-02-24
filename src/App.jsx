import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import CalendarWorkWeek from './components/CalendarWorkWeek';
import CalendarDays from './components/CalendarDays';
import NavBar from './components/NavBar';
import EventModal from './components/EventModal';
import { useEventStore } from './context/EventStore';
import NotificationToast from './components/Notification';
import Login from './components/Login';
import Register from './components/Register';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';

function App() {
    const [view, setView] = useState('month'); // 'month', 'week', 'workweek', 'day'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Ajout de l'état pour la connexion de l'utilisateur

    // Accès à l'état global du store
    const { state, fetchEvents, addEvent, deleteEvent, updateEvent } = useEventStore();
    const { events, loading, error } = state;

    // Charger les événements au démarrage
    useEffect(() => {
        if (events.length === 0) {
            fetchEvents(); // Appel pour charger les événements depuis l'API
        }
    }, []);

    // Vérifier la connexion de l'utilisateur (ici avec une condition fictive)
    useEffect(() => {
        const userToken = localStorage.getItem('auth_token');
        if (userToken) {
            setIsLoggedIn(true); 
        } else {
            setIsLoggedIn(false); 
        }
        console.log('token', userToken);
        
    }, []);

    // Écoute de la connexion WebSocket pour les notifications
    useEffect(() => {
        if (!isLoggedIn) return; // Si l'utilisateur n'est pas connecté, ne pas écouter les notifications

        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connexion WebSocket établie');
            ws.send(JSON.stringify({ action: 'ping' }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('data', data);

            // Assurer qu'un message contient une notification
            if (data.message) {
                setNotification({ message: data.message, type: data.type || 'info' });
                setTimeout(() => setNotification(null), 8000);
                const audio = new Audio('/assets/notif_sound.wav');
                audio.play().catch(error => console.error("Erreur lecture audio :", error));
            }

            if (Notification.permission === "granted" && data.message) {
                const notification = new Notification("Nouvelle notification", {
                    body: data.message || "Nouvelle notification !",
                });

                const audio = new Audio('/assets/notif_sound.wav');
                audio.play().catch(error => console.error("Erreur lecture audio :", error));

                notification.onclick = () => {
                    window.focus();
                    window.location.href = "http://localhost:5173/";
                };
            }
        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket:', error);
        };

        // Fermer la connexion WebSocket lorsque le composant est démonté
        return () => {
            ws.close();
        };
    }, [isLoggedIn]); // Refaire l'écoute lorsque l'état de connexion change

    // Fonction pour revenir au jour actuel
    function goToToday() {
        setCurrentDate(new Date()); // Mettre à jour la date actuelle
        setView('day');
    }

    // Fonction pour ouvrir et fermer le modal
    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    // Fonction pour gérer l'ajout d'un événement
    function handleAddEvent(event) {
        addEvent(event);
        closeModal();
        setNotification({ message: 'Événement ajouté avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    }

    return (
        <Router>
            <div className="App">
                {/* Notification */}
                {notification && (
                    <NotificationToast message={notification.message} type={notification.type} />
                )}

                {/* Routes */}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <>
                                <NavBar setView={setView} goToToday={goToToday} />
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

                                {/* Bouton flottant pour ajouter un événement */}
                                <button
                                    title="Ajouter un évènement"
                                    onClick={openModal}
                                    className="fixed bottom-6 cursor-pointer right-6 bg-[#238781] text-white font-bold w-12 h-12 rounded-full shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center"
                                >
                                    <Icon path={mdiPlus} size={1.5} />
                                </button>

                                {/* Modal d'ajout d'événement */}
                                {isModalOpen && (
                                    <EventModal
                                        isOpen={isModalOpen}
                                        onClose={closeModal}
                                        onAddEvent={handleAddEvent}
                                    />
                                )}
                            </>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
