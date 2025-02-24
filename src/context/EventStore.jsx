import React, { createContext, useReducer, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";


// Initialisation de l'état
const initialState = {
    events: [],
    loading: false,
    error: null,
    notifications: [],
    user: null,
    isAuthenticated: false, // L'état qui vérifie si l'utilisateur est connecté
};

// Actions
const FETCH_EVENTS = 'FETCH_EVENTS';
const ADD_EVENT = 'ADD_EVENT';
const DELETE_EVENT = 'DELETE_EVENT';
const UPDATE_EVENT = 'UPDATE_EVENT';
const SET_ERROR = 'SET_ERROR';
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const SET_USER = 'SET_USER'; // Action pour définir l'utilisateur
const LOGOUT = 'LOGOUT';

// Reducer
const eventReducer = (state, action) => {
    switch (action.type) {
        case FETCH_EVENTS:
            return { ...state, events: action.payload, loading: false };
        case ADD_EVENT:
            return { ...state, events: [...state.events, action.payload] };
        case DELETE_EVENT:
            return { ...state, events: state.events.filter(event => event._id !== action.payload) };
        case UPDATE_EVENT:
            return {
                ...state,
                events: state.events.map(event =>
                    event._id === action.payload._id ? action.payload : event
                ),
            };
        case SET_ERROR:
            return { ...state, error: action.payload, loading: false };
        case ADD_NOTIFICATION:
            return { ...state, notifications: [...state.notifications, action.payload] };
        case SET_USER:
            return { ...state, user: action.payload, isAuthenticated: true };
        case LOGOUT:
            return { ...state, user: null, isAuthenticated: false };
        default:
            return state;
    }
};

// Création du contexte
const EventContext = createContext();

// Provider du store
export const EventProvider = ({ children }) => {
    const [state, dispatch] = useReducer(eventReducer, initialState);

    // Vérification si un utilisateur est connecté (par exemple via un token ou localStorage)
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token'); // Par exemple, chercher un utilisateur stocké dans localStorage
        // Vérifie si le token existe dans localStorage
        if (storedToken) {
            try {
                // Décoder le token pour récupérer les informations de l'utilisateur
                const decodedToken = jwtDecode(storedToken);
                const userId = decodedToken.userId; // Supposons que le token contient un champ `userId`

                dispatch({ type: SET_USER, payload: { _id: userId, token: storedToken } });
                console.log('id', userId);

            } catch (error) {
                console.error('Token invalide ou erreur de décodage', error);
            }
        }
        console.log('store', storedToken);

    }, []);

    // Actions pour les requêtes API
    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/events');
            dispatch({ type: FETCH_EVENTS, payload: response.data });
        } catch (err) {
            dispatch({ type: SET_ERROR, payload: err.message });
        }
    };

    const addEvent = async (newEvent) => {
        const { user } = state; // Récupérer l'utilisateur depuis le state du store
        console.log('user', user);
        
        if (!user || !user._id) {
            // Si l'utilisateur n'est pas défini ou que son ID est manquant
            addNotification({ message: 'Vous devez être connecté pour ajouter un événement.', type: 'error' });
            return;
        }
        

        // Ajouter l'ID de l'utilisateur dans l'objet événement
        const eventWithUser = {
            ...newEvent,
            createdBy: user._id,  // Ajouter l'ID de l'utilisateur ici
        };
        console.log('event', eventWithUser);
        
        try {
            const response = await axios.post('http://localhost:5000/api/addevents', eventWithUser);
            dispatch({ type: ADD_EVENT, payload: response.data });
        } catch (err) {
            dispatch({ type: SET_ERROR, payload: err.message });
        }
    };


    const deleteEvent = async (eventId) => {
        try {
            await axios.delete(`http://localhost:5000/api/events/${eventId}`);
            dispatch({ type: DELETE_EVENT, payload: eventId });
        } catch (err) {
            dispatch({ type: SET_ERROR, payload: err.message });
        }
    };

    const updateEvent = async (eventId, updatedEvent) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/events/${eventId}`, updatedEvent);
            dispatch({ type: UPDATE_EVENT, payload: response.data });
        } catch (err) {
            dispatch({ type: SET_ERROR, payload: err.message });
        }
    };

    // Action pour ajouter une notification
    const addNotification = (notification) => {
        dispatch({ type: ADD_NOTIFICATION, payload: notification });
    };

    // Actions pour gérer l'utilisateur
    const setUser = (user) => {
        localStorage.setItem('user', JSON.stringify(user)); // Sauvegarder l'utilisateur dans localStorage
        dispatch({ type: SET_USER, payload: user });
    };

    const logout = () => {
        localStorage.removeItem('user'); // Enlever l'utilisateur du localStorage lors de la déconnexion
        dispatch({ type: LOGOUT });
    };

    return (
        <EventContext.Provider value={{ state, fetchEvents, addEvent, deleteEvent, updateEvent, addNotification, setUser, logout }}>
            {children}
        </EventContext.Provider>
    );
};

// Hook pour accéder au store
export const useEventStore = () => useContext(EventContext);
