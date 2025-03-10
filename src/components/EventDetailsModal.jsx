import { mdiClose, mdiCalendarRange, mdiMapMarker, mdiInformation, mdiAccountGroup, mdiMagnify, mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EventDetailsModal = ({ event, onClose }) => {
    const [tab, setTab] = useState('details');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (event) {
            document.body.style.overflow = 'hidden';
            console.log('EventDetailsModal', event);
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [event]);

    if (!event) return null;

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const handleSearchLocation = () => {
        if (event.location) {
            const searchQuery = encodeURIComponent(event.location);
            window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl"
                >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-r from-[#238781]/90 to-[#1E6F68]/90">
                        {/* Image avec loader */}
                        <div className="absolute inset-0 bg-cover bg-center opacity-30">
                            {loading && (
                                <div className="flex justify-center items-center h-full">
                                    <span className="animate-spin border-4 border-white border-t-transparent rounded-full w-8 h-8"></span>
                                </div>
                            )}
                            <img
                                src="https://picsum.photos/800/400"
                                alt="Event Background"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"
                                    }`}
                                onLoad={() => setLoading(false)}
                            />
                        </div>

                        {/* Bouton de fermeture */}
                        <button
                            onClick={onClose}
                            className="absolute cursor-pointer top-4 right-4 p-2 text-white bg-black/20 hover:bg-black/30 rounded-full transition-colors z-10"
                        >
                            <Icon path={mdiClose} size={0.8} />
                        </button>

                        {/* Infos de l'événement */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h2 className="text-2xl font-bold tracking-tight">{event.title}</h2>
                            <div className="flex items-center mt-2 text-white/90">
                                <Icon path={mdiCalendarRange} size={0.6} className="mr-1" />
                                <span className="text-sm">
                                    {formatDate(event.startDate)} • {event.startTime} - {event.endTime}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setTab('details')}
                            className={`flex items-center cursor-pointer px-4 py-3 text-sm font-medium transition-colors ${tab === 'details'
                                ? 'text-[#238781] border-b-2 border-[#238781]'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Icon path={mdiInformation} size={0.6} className="mr-1.5" />
                            Détails
                        </button>
                        {event.participants?.length > 0 && (
                            <button
                                onClick={() => setTab('participants')}
                                className={`flex items-center cursor-pointer px-4 py-3 text-sm font-medium transition-colors ${tab === 'participants'
                                    ? 'text-[#238781] border-b-2 border-[#238781]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon path={mdiAccountGroup} size={0.6} className="mr-1.5" />
                                Participants ({event.participants.length})
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {tab === 'details' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                {event.description ? (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">{event.description}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 p-4 border border-dashed border-gray-400 rounded-md bg-gray-50">
                                        <Icon path={mdiInformationOutline} size={1.5} className="text-gray-400" />
                                        <p className="text-gray-600">Aucun détail disponible pour cet événement.</p>
                                    </div>
                                )}

                                {event.location && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Lieu
                                        </h3>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start">
                                                <Icon
                                                    path={mdiMapMarker}
                                                    size={0.8}
                                                    className="mt-0.5 mr-2 text-[#238781]"
                                                />
                                                <p className="text-gray-700">{event.location}</p>
                                            </div>
                                            <button
                                                onClick={handleSearchLocation}
                                                className="flex items-center px-3 cursor-pointer py-1 text-sm font-medium text-[#238781] bg-[#238781]/10 rounded-lg hover:bg-[#238781]/20 transition-colors"
                                            >
                                                <Icon path={mdiMagnify} size={0.6} className="mr-1" />
                                                Rechercher le lieu
                                            </button>
                                        </div>
                                    </div>
                                )}


                                <div className="pt-4">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 text-white cursor-pointer font-medium bg-gradient-to-r from-[#238781] to-[#1E6F68] rounded-xl hover:shadow-lg hover:from-[#1E6F68] hover:to-[#238781] transition-all duration-300 focus:ring-2 focus:ring-[#238781]/50 focus:ring-offset-2"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {tab === 'participants' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Liste des participants
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                    {event.participants.map((p, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: i * 0.05 }}
                                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#238781]/10 flex items-center justify-center text-[#238781] font-medium">
                                                    {(p.user?.email?.[0] || "?").toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-700 font-medium truncate">
                                                    {p.user?.email || "Email inconnu"}
                                                </span>
                                            </div>
                                            <span
                                                className={`
                                                    inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full capitalize
                                                    ${p.status === 'confirmed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : p.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }
                                                `}
                                            >
                                                {p.status}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 text-white font-medium bg-gradient-to-r from-[#238781] to-[#1E6F68] rounded-xl hover:shadow-lg hover:from-[#1E6F68] hover:to-[#238781] transition-all duration-300 focus:ring-2 focus:ring-[#238781]/50 focus:ring-offset-2"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #238781;
                }
            `}</style>
        </AnimatePresence>
    );
};

export default EventDetailsModal;