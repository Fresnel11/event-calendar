import React, { useState, useEffect } from "react";
import { CalendarDays, Calendar, CalendarCheck, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'


const NavBar = ({ setView }) => {
    const [selectedView, setSelectedView] = useState("days");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInitial, setUserInitial] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [open, setOpen] = useState(true)
    const navigate = useNavigate();

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
