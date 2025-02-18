// src/context/EventStore.jsx
import React, { createContext, useReducer, useContext } from 'react';
import axios from 'axios';

// Initialisation de l'état
const initialState = {
    events: [],
    loading: false,
    error: null,
    notifications: [], // Nouvel état pour les notifications
};

// Actions
const FETCH_EVENTS = 'FETCH_EVENTS';
const ADD_EVENT = 'ADD_EVENT';
const DELETE_EVENT = 'DELETE_EVENT';
const UPDATE_EVENT = 'UPDATE_EVENT';
const SET_ERROR = 'SET_ERROR';
const ADD_NOTIFICATION = 'ADD_NOTIFICATION'; // Nouvelle action pour les notifications

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
        default:
            return state;
    }
};

// Création du contexte
const EventContext = createContext();

// Provider du store
export const EventProvider = ({ children }) => {
    const [state, dispatch] = useReducer(eventReducer, initialState);

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
        try {
            const response = await axios.post('http://localhost:5000/api/addevents', newEvent);
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

    return (
        <EventContext.Provider value={{ state, fetchEvents, addEvent, deleteEvent, updateEvent, addNotification }}>
            {children}
        </EventContext.Provider>
    );
};

// Hook pour accéder au store
export const useEventStore = () => useContext(EventContext);
