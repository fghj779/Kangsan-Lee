/**
 * Notification Manager Module
 * Handles desktop notifications and permission requests
 */

const NotificationManager = {
    permission: 'default',

    // Initialize notification manager
    init() {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return;
        }

        // Get current permission status
        this.permission = Notification.permission;

        // Set up modal event listeners
        document.getElementById('allow-notifications').addEventListener('click', () => {
            this.requestPermission();
        });

        document.getElementById('deny-notifications').addEventListener('click', () => {
            this.hideModal();
        });
    },

    // Request notification permission
    async requestPermission() {
        if (!('Notification' in window)) {
            alert('Your browser does not support desktop notifications');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;

            if (permission === 'granted') {
                this.hideModal();
                this.sendNotification(
                    'Notifications Enabled!',
                    'You will now receive desktop notifications when page changes are detected.',
                    false
                );
                return true;
            } else {
                this.hideModal();
                alert('Notification permission denied. You can enable it later in your browser settings.');
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    },

    // Show permission modal
    showModal() {
        const modal = document.getElementById('notification-modal');
        modal.classList.add('active');
    },

    // Hide permission modal
    hideModal() {
        const modal = document.getElementById('notification-modal');
        modal.classList.remove('active');
    },

    // Send desktop notification
    sendNotification(title, message, playSound = false) {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return;
        }

        // Check permission
        if (Notification.permission === 'granted') {
            this.createNotification(title, message, playSound);
        } else if (Notification.permission === 'default') {
            // Show modal to request permission
            this.showModal();
        } else {
            console.warn('Notification permission denied');
        }
    },

    // Create and display notification
    createNotification(title, message, playSound = false) {
        try {
            const notification = new Notification(title, {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🎫</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🎫</text></svg>',
                tag: 'ticketing-helper',
                requireInteraction: true,
                vibrate: [200, 100, 200]
            });

            // Play sound if requested
            if (playSound) {
                this.playNotificationSound();
            }

            // Auto-close after 10 seconds if not interactive
            setTimeout(() => {
                notification.close();
            }, 10000);

            // Handle notification click
            notification.onclick = function() {
                window.focus();
                this.close();
            };

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    },

    // Play notification sound
    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a more pleasant notification sound
            const playTone = (frequency, startTime, duration) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };

            // Play a pleasant two-tone alert
            const now = audioContext.currentTime;
            playTone(800, now, 0.15);
            playTone(1000, now + 0.15, 0.15);

        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    },

    // Check if notifications are enabled
    isEnabled() {
        return 'Notification' in window && Notification.permission === 'granted';
    },

    // Get permission status
    getPermissionStatus() {
        if (!('Notification' in window)) {
            return 'unsupported';
        }
        return Notification.permission;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
