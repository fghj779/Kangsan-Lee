/**
 * Countdown Timer Module
 * Handles countdown to ticket sale opening with timezone support
 */

const CountdownTimer = {
    interval: null,
    targetTime: null,
    timezone: null,
    alerted5Min: false,
    alerted1Min: false,
    alertedOpening: false,

    // Initialize countdown timer
    init() {
        // Load saved configuration
        const config = StorageManager.loadCountdownConfig();
        if (config) {
            document.getElementById('sale-datetime').value = config.datetime;
            document.getElementById('timezone').value = config.timezone;
        }

        // Add event listeners
        document.getElementById('start-countdown').addEventListener('click', () => {
            this.start();
        });
    },

    // Start countdown
    start() {
        const datetimeInput = document.getElementById('sale-datetime').value;
        const timezoneSelect = document.getElementById('timezone').value;

        if (!datetimeInput) {
            alert('Please select a sale opening time');
            return;
        }

        // Save configuration
        StorageManager.saveCountdownConfig({
            datetime: datetimeInput,
            timezone: timezoneSelect
        });

        // Parse the target time
        this.targetTime = new Date(datetimeInput);
        this.timezone = timezoneSelect;

        // Reset alert flags
        this.alerted5Min = false;
        this.alerted1Min = false;
        this.alertedOpening = false;

        // Clear existing interval
        if (this.interval) {
            clearInterval(this.interval);
        }

        // Start the countdown
        this.updateDisplay();
        this.interval = setInterval(() => {
            this.updateDisplay();
        }, 1000);

        // Show success message
        this.showAlert('Countdown started!', 'success');
    },

    // Update countdown display
    updateDisplay() {
        const now = new Date();
        const diff = this.targetTime - now;

        if (diff <= 0) {
            // Time has passed
            this.stop();
            this.showAlert('SALE IS NOW OPEN! GO GO GO!', 'success');

            if (!this.alertedOpening) {
                NotificationManager.sendNotification(
                    'Ticket Sale Opening!',
                    'The ticket sale is NOW OPEN! Click to visit the site.',
                    true
                );
                this.alertedOpening = true;
            }

            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        // Calculate time units
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Update display
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

        // Check for alerts
        const totalMinutes = Math.floor(diff / (1000 * 60));
        const totalSeconds = Math.floor(diff / 1000);

        // 5 minute warning
        if (totalMinutes <= 5 && totalMinutes > 1 && !this.alerted5Min) {
            this.showAlert('5 minutes until sale opening!', 'warning');
            NotificationManager.sendNotification(
                '5 Minute Warning!',
                'The ticket sale opens in 5 minutes. Get ready!',
                true
            );
            this.alerted5Min = true;
        }

        // 1 minute warning
        if (totalMinutes <= 1 && totalSeconds > 10 && !this.alerted1Min) {
            this.showAlert('1 MINUTE REMAINING! Get ready!', 'danger');
            NotificationManager.sendNotification(
                '1 Minute Warning!',
                'The ticket sale opens in 1 minute! Prepare now!',
                true
            );
            this.alerted1Min = true;

            // Make the countdown pulse
            document.getElementById('countdown-display').classList.add('pulsing');
        }
    },

    // Stop countdown
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    // Show alert message
    showAlert(message, type) {
        const alertDiv = document.getElementById('alert-status');
        alertDiv.textContent = message;
        alertDiv.className = `alert-status ${type}`;
        alertDiv.style.display = 'block';
    },

    // Format time with timezone
    formatTimeWithTimezone(date, timezone) {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountdownTimer;
}
