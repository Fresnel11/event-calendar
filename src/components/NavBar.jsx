import React, { useState, useEffect } from "react";
import { CalendarDays, Calendar, CalendarCheck, Briefcase, Bell, MessageCircleQuestion, MessageCircleWarning, MoreVertical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Notification from "./Notification";
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { deepOrange } from '@mui/material/colors';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
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
    const { deleteNotifications, setDeleteNotifications } = useState(null)
    const [ws, setWs] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null); // État pour gérer le menu ouvert
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


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

    useEffect(() => {
        console.log("Notifications mises à jour:", notifications);
    }, [notifications]);

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



    const markAllNotificationsAsRead = async () => {
        try {

            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
        }
    };

    const markNotificationsAsRead = async (id) => {
        try {
            console.log("Début de la mise à jour des notifications lues");

            const unreadNotifications = notifications.filter(n => !n.read);
            const ids = unreadNotifications.map(n => n._id);

            console.log("Notifications non lues :", unreadNotifications);
            console.log("IDs des notifications à marquer comme lues :", ids);

            const response = await axios.put(
                `http://localhost:5000/api/notif/notifications/read/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                }
            );

            console.log("Réponse du serveur :", response.data);

            // Mettre à jour l'état des notifications
            setNotifications(notifications.map(n => n.read ? n : { ...n, read: true }));

            console.log("Notifications mises à jour dans le state");
        } catch (error) {
            console.error("Erreur lors de la mise à jour des notifications :", error);
        }
    };


    const deleteNotification = async (id) => {
        try {
            // Utilise _id pour accéder à l'identifiant de la notification
            await axios.delete(`http://localhost:5000/api/notif/notifications/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });
            // Supprimer la notification de la liste
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression de la notification:", error);
        }
    };



    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/notif/notifications", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });
            console.log('Fetching notifications', response);

            setNotifications(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des notifications:", error);
            setNotifications([]);
        }
    };

    const formatNotificationDate = (date) => {
        if (!date || isNaN(new Date(date).getTime())) {
            return "Chargement...";
        }

        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const navItems = [
        { id: "days", label: "Jour", icon: <CalendarDays className="w-5 h-5" /> },
        { id: "month", label: "Mois", icon: <Calendar className="w-5 h-5" /> },
        { id: "week", label: "Semaine", icon: <CalendarCheck className="w-5 h-5" /> },
        { id: "work-week", label: "Travail", icon: <Briefcase className="w-5 h-5" /> },
    ];

    return (
        <div>
            {/* Notification */}
            {deleteNotifications && (
                <Notification message={deleteNotifications.message} type={deleteNotifications.type} />
            )}
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
                            <div className="relative cursor-pointer" onClick={() => { setShowNotifications(!showNotifications); markAllNotificationsAsRead(); }}>
                                <Badge badgeContent={unreadCount} color="error">
                                    <Bell className="w-6 h-6 text-gray-600 hover:text-[#238781]" />
                                </Badge>
                            </div>
                            {showNotifications && (
                                <div className="absolute top-12 right-16 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                    {/* Header */}
                                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {notifications.filter(n => !n.read).length} nouvelles notifications
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => markAllNotificationsAsRead()}
                                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            Tout marquer comme lu
                                        </button>
                                    </div>
                                    {/* Filtres */}
                                    <div className="flex gap-2 px-6 py-2 bg-gray-50 border-b border-gray-100">
                                        <button className="px-3 py-1 text-xs font-medium cursor-pointer rounded-full bg-[#238781] text-white">
                                            Toutes
                                        </button>
                                        <button className="px-3 py-1 text-xs font-medium cursor-pointer rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                            Non lues
                                        </button>
                                        <button className="px-3 py-1 text-xs font-medium cursor-pointer rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                            Invitations
                                        </button>
                                    </div>
                                    {/* Liste des notifications */}
                                    <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                        {notifications.length > 0 ? (
                                            <div className="divide-y divide-gray-100">
                                                {notifications.map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        className={`relative p-6 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className="flex gap-4">
                                                            {/* Indicateur de non-lu */}
                                                            {!notification.read && (
                                                                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                                                            )}
                                                            {/* Icône */}
                                                            <div className="flex-shrink-0">
                                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-500">
                                                                    <MessageCircleWarning className="w-5 h-5" />
                                                                </div>
                                                            </div>
                                                            {/* Contenu */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                                    {notification.message}
                                                                </p>
                                                                {/* Timestamp */}
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {formatNotificationDate(notification.createdAt)}
                                                                </p>
                                                            </div>
                                                            {/* Menu contextuel */}
                                                            <div className="flex-shrink-0 relative">
                                                                <button
                                                                    className="p-1 text-gray-400 cursor-pointer hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                                                    onClick={() => setOpenMenuId(openMenuId === notification._id ? null : notification._id)}
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>
                                                                {/* Menu déroulant */}
                                                                {openMenuId === notification._id && (
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                                                                        <button
                                                                            className="w-full px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100 text-left"
                                                                            onClick={() => {
                                                                                markNotificationsAsRead(notification._id);
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                        >
                                                                            Marquer comme lu
                                                                        </button>
                                                                        <button
                                                                            className="w-full px-4 py-2 cursor-pointer text-sm text-red-600 hover:bg-red-50 text-left"
                                                                            onClick={() => {
                                                                                deleteNotification(notification._id);
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                        >
                                                                            Supprimer
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <Bell className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 text-sm text-center">
                                                    Vous n'avez aucune notification pour le moment
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {notifications.length > 0 && (
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                            <button
                                                className="text-sm text-[#238781] hover:text-[#1a6661] transition-colors w-full text-center"
                                                onClick={() => {/* Voir toutes les notifications */ }}
                                            >
                                                Voir toutes les notifications
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {userInitial && (
                                <div>
                                    <Tooltip title={userEmail} arrow>
                                        <IconButton onClick={handleClick}>
                                            <Avatar sx={{ bgcolor: deepOrange[500] }}>
                                                {userInitial}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={openMenu}
                                        onClose={handleClose}
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "right",
                                        }}
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                        }}
                                    >
                                        <MenuItem onClick={handleClose}>
                                            <ListItemIcon>
                                                <AccountCircleIcon fontSize="small" />
                                            </ListItemIcon>
                                            Profil
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                handleClose();
                                                setShowLogoutModal(true);
                                            }}
                                            style={{ color: "red" }}
                                        >
                                            <ListItemIcon>
                                                <LogoutIcon fontSize="small" style={{ color: "red" }} />
                                            </ListItemIcon>
                                            Déconnexion
                                        </MenuItem>
                                    </Menu>
                                </div>
                            )}

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
        </div>
    );
};

export default NavBar;