self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Vous avez une nouvelle notification',
        icon: '/icon.png', 
        badge: '/badge.png', 
    };

    event.waitUntil(
        self.registration.showNotification('Nouvelle notification', options)
    );
});

// Lors du clic sur la notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') // Ouvre la page de ton site
    );
});
