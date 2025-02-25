import React, { useState, useEffect } from "react";
import { CalendarDays, Calendar, CalendarCheck, Briefcase, Bell, CheckCircle, XCircle, Info,MessageCircleQuestion } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { div } from "framer-motion/client";

const NavBar = ({ setView }) => {
    const [selectedView, setSelectedView] = useState("days");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInitial, setUserInitial] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Vérifie si l'utilisateur est connecté
        const token = localStorage.getItem("auth_token");
        setIsAuthenticated(!!token);

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1])); // Décodage du JWT
                if (payload.email) {
                    setUserEmail(payload.email);
                    setUserInitial(payload.email.charAt(0).toUpperCase()); // Première lettre en majuscule
                }
            } catch (error) {
                console.error("Erreur de décodage du token:", error);
            }
        }

        const savedView = localStorage.getItem("selectedView");
        if (savedView) {
            setSelectedView(savedView);
            setView(savedView);
        }

        if (!token) {
            console.warn("Aucun token trouvé, connexion WebSocket annulée.");
            return;
        }

        // Connexion WebSocket pour les notifications en temps réel
        const socket = new WebSocket(`ws://localhost:8080?token=${token}`);
        setWs(socket);

        socket.onopen = () => {
            console.log("Connexion WebSocket établie");
            socket.send(JSON.stringify({ action: 'ping' }));
        };
        socket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            console.log("Nouvelle notification reçue:", notification);
            setNotifications((prevNotifications) => [...prevNotifications, notification]);
        };

        return () => {
            socket.close(); // Ferme la connexion WebSocket à la fermeture du composant
        };
    }, [setView]);

    const handleSetView = (view) => {
        setSelectedView(view);
        setView(view);
        localStorage.setItem("selectedView", view);
    };

    const handleLogout = () => {
        localStorage.removeItem("auth_token"); // Suppression du token d'authentification
        setIsAuthenticated(false);
        navigate("/login"); // Redirection vers la page de connexion
        setShowLogoutModal(false);
    };

    const markNotificationsAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const navItems = [
        { id: "days", label: "Jour", icon: <CalendarDays className="w-5 h-5" /> },
        { id: "month", label: "Mois", icon: <Calendar className="w-5 h-5" /> },
        { id: "week", label: "Semaine", icon: <CalendarCheck className="w-5 h-5" /> },
        { id: "work-week", label: "Travail", icon: <Briefcase className="w-5 h-5" /> },
    ];

    return (
        <nav className="flex justify-between items-center space-x-4 bg-white shadow-lg py-3 px-6 rounded-2xl">
            <div className="flex space-x-4">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleSetView(item.id)}
                        className={`flex items-center gap-2 cursor-pointer px-5 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out 
                            ${selectedView === item.id ? "bg-[#238781] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                    <>
                        <div className="relative cursor-pointer" onClick={() => { setShowNotifications(!showNotifications); markNotificationsAsRead(); }}>
                            <Bell className="w-6 h-6 text-gray-600 hover:text-[#238781]" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Liste des notifications */}
{showNotifications && (
    <div className="absolute top-12 right-16 w-80 bg-white shadow-xl rounded-lg p-4 z-50 border border-gray-200 overflow-hidden max-h-[400px]">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Notifications</h3>
        {notifications.length > 0 ? (
            notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-3 rounded-md transition duration-300 ease-in-out transform hover:bg-gray-100 ${notification.read ? 'text-gray-500' : 'text-black'}`}
                >
                    {/* Icône de notification */}
                    <div className="flex-shrink-0">
                        <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-200' : 'bg-blue-500'}`}
                        >
                            {notification.action === 'invite' ? (
                                <MessageCircleQuestion className={`w-5 h-5 ${notification.read ? 'text-gray-400' : 'text-white'}`} />
                            ) : (
                                <MessageCircleWarning className={`w-5 h-5 ${notification.read ? 'text-gray-400' : 'text-white'}`} />
                            )}
                        </span>
                    </div>

                    {/* Contenu de la notification */}
                    <div className="flex-1">
                        {notification.action === 'invite' ? (
                            <div>
                                <p className="text-sm font-medium">{notification.message}</p>
                                <div className="flex space-x-2 mt-2">
                                    <button
                                        title="Accepter"
                                        onClick={() => {/* Accepter l'invitation */ }}
                                        className="text-green-500 hover:text-green-700 cursor-pointer transition"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                        title="Refuser"
                                        onClick={() => {/* Refuser l'invitation */ }}
                                        className="text-red-500 hover:text-red-700 cursor-pointer transition"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <p className="text-sm">{notification.message}</p>
                                <button
                                    onClick={() => markNotificationsAsRead(notification.id)}
                                    className="ml-2 text-blue-500 hover:text-blue-700 transition"
                                >
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))
        ) : (
            <p className="text-gray-500 text-sm">Aucune notification</p>
        )}
    </div>
)}


                        {userInitial && (
                            <div className="relative group">
                                {/* Avatar */}
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 font-bold rounded-full cursor-pointer">
                                    {userInitial}
                                </div>
                                {/* Tooltip visible au survol (positionné en bas) */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:flex bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow-lg">
                                    {userEmail}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="text-gray-600 cursor-pointer hover:text-[#238781] font-medium transition-colors duration-300"
                        >
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="text-gray-600 hover:text-[#238781] font-medium transition-colors duration-300"
                        >
                            Connexion
                        </Link>
                        <Link
                            to="/register"
                            className="text-gray-600 hover:text-[#238781] font-medium transition-colors duration-300"
                        >
                            Inscription
                        </Link>
                    </>
                )}

                {showLogoutModal && (
                    <Dialog open={open} onClose={setOpen} className="relative z-10">
                        <DialogBackdrop
                            transition
                            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                        />
                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel
                                    transition
                                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                >
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                                <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                                    Confirmer la déconnexion
                                                </DialogTitle>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Êtes-vous sûr de vouloir vous déconnecter ?
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="inline-flex cursor-pointer w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                                        >
                                            Se deconnecter
                                        </button>
                                        <button
                                            type="button"
                                            data-autofocus
                                            onClick={() => setShowLogoutModal(false)}
                                            className="mt-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </div>
                    </Dialog>
                )}
            </div>
        </nav>
    );
};

export default NavBar;