import React, { useState, useEffect } from 'react';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import CalendarWorkWeek from './components/CalendarWorkWeek';
import CalendarDays from './components/CalendarDays';
import NavBar from './components/NavBar';
import EventModal from './components/EventModal';
import { useEventStore } from './context/EventStore';
import NotificationToast from './components/Notification';
// import notif_sound from './'
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js'

function App() {
    const [view, setView] = useState('month'); // 'month', 'week', 'workweek', 'day'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Stocke la date actuelle
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // Accès à l'état global du store
    const { state, fetchEvents, addEvent, deleteEvent, updateEvent } = useEventStore();
    const { events, loading, error } = state;

    // Charger les événements au démarrage
    useEffect(() => {
        if (events.length === 0) {
            fetchEvents(); // Appel pour charger les événements depuis l'API
        }
    }, []);

    // Écoute de la connexion WebSocket pour les notifications
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connexion WebSocket établie');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
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
                    // icon: "/icons/notification.png", // Remplace par un chemin valide
                })

                const audio = new Audio(notif_sound);
                audio.play().catch(error => console.error("Erreur lecture audio :", error));

                notification.onclick = () => {
                    window.focus(); // Met l'onglet en avant
                    window.location.href = "http://localhost:5173/"; // Redirige vers l'URL          }
                }
            }

        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket:', error);
        };

        // Fermer la connexion WebSocket lorsque le composant est démonté
        return () => {
            ws.close();
        };
    }, []);


    // Enregistrement du Service Worker pour Web Push
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/service-worker.jsx')
                    .then((registration) => {
                        console.log('Service Worker enregistré avec succès:', registration);
                    })
                    .catch((error) => {
                        console.log('Erreur d\'enregistrement du Service Worker:', error);
                    });
            });
        }
    }, []);



    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    useEffect(() => {
        const subscribeUserToPush = async () => {
            const swRegistration = await navigator.serviceWorker.ready;

            // S'abonner aux notifications Push
            const subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
            });

            console.log('Utilisateur abonné aux notifications push:', subscription);

            // Envoi de la souscription au serveur
            fetch('/api/save-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription),
            });
        };

        if ('Notification' in window && 'serviceWorker' in navigator) {
            subscribeUserToPush();
        }
    }, []);



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

    // Fonction pour gérer l'ajout d'un événement (exemple simplifié)
    function handleAddEvent(event) {
        addEvent(event);
        closeModal();
        setNotification({ message: 'Événement ajouté avec succès!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
    }

    return (
        <div className="App">
            {/* Notification */}
            {notification && (
                <NotificationToast message={notification.message} type={notification.type} />
            )}
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
                title='Ajouter un évènement'
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
        </div>
    );
}

export default App;
