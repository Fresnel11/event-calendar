// src/NotificationService.js
const socketUrl = 'ws://localhost:8080';

export const connectWebSocket = (onMessageReceived) => {
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
        console.log('WebSocket connecté');
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        onMessageReceived(message); // Traite le message reçu
    };

    socket.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
    };

    socket.onclose = () => {
        console.log('WebSocket déconnecté');
    };

    return socket;
};
