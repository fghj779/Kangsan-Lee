/**
 * Main Controller for Ticketing Helper Tool
 * Initializes all modules and manages application state
 */

// Application state
const App = {
    version: '1.0.0',
    initialized: false,

    // Initialize application
    init() {
        console.log('Ticketing Helper Tool v' + this.version);
        console.log('Initializing...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.onDOMReady();
            });
        } else {
            this.onDOMReady();
        }
    },

    // Called when DOM is ready
    onDOMReady() {
        console.log('DOM ready, initializing modules...');

        try {
            // Initialize all modules
            NotificationManager.init();
            console.log('✓ Notification Manager initialized');

            CountdownTimer.init();
            console.log('✓ Countdown Timer initialized');

            PageMonitor.init();
            console.log('✓ Page Monitor initialized');

            SpeedTester.init();
            console.log('✓ Speed Tester initialized');

            AutoLoginHelper.init();
            console.log('✓ Auto-Login Helper initialized');

            // Set up visibility change handler
            this.setupVisibilityHandler();

            // Set up unload handler
            this.setupUnloadHandler();

            // Show welcome message
            this.showWelcomeMessage();

            this.initialized = true;
            console.log('✓ All modules initialized successfully');

        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    },

    // Set up visibility change handler
    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Tab hidden');
            } else {
                console.log('Tab visible');
                // Refresh any necessary data when tab becomes visible
                this.onTabVisible();
            }
        });
    },

    // Called when tab becomes visible
    onTabVisible() {
        // Refresh countdown display if active
        if (CountdownTimer.interval) {
            CountdownTimer.updateDisplay();
        }
    },

    // Set up unload handler
    setupUnloadHandler() {
        window.addEventListener('beforeunload', (e) => {
            // Warn if monitoring is active
            if (PageMonitor.isMonitoring) {
                e.preventDefault();
                e.returnValue = 'Page monitoring is active. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    },

    // Show welcome message
    showWelcomeMessage() {
        // Check if this is first time using the tool
        const hasSeenWelcome = localStorage.getItem('th_welcome_seen');

        if (!hasSeenWelcome) {
            setTimeout(() => {
                const message = `
                    Welcome to Ticketing Helper Tool!

                    Features:
                    • Countdown Timer with timezone support
                    • Web Page Monitor with change detection
                    • Connection Speed Tester
                    • Auto-Login Helper with encryption

                    All data is stored locally and encrypted for your security.

                    Get started by configuring the countdown timer or page monitor!
                `;

                if (confirm(message + '\n\nDo you want to see this message again next time?')) {
                    // User wants to see it again, don't save preference
                } else {
                    localStorage.setItem('th_welcome_seen', 'true');
                }
            }, 1000);
        }
    },

    // Show error message
    showError(message) {
        alert('Error: ' + message);
    },

    // Check for updates (future feature)
    checkForUpdates() {
        console.log('Checking for updates...');
        // This could be implemented to check for new versions
    },

    // Export settings (future feature)
    exportSettings() {
        try {
            const settings = {
                version: this.version,
                countdown: StorageManager.loadCountdownConfig(),
                monitor: StorageManager.loadMonitorConfig(),
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ticketing-helper-settings.json';
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting settings:', error);
            this.showError('Failed to export settings');
        }
    },

    // Import settings (future feature)
    importSettings(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);

                if (settings.countdown) {
                    StorageManager.saveCountdownConfig(settings.countdown);
                }

                if (settings.monitor) {
                    StorageManager.saveMonitorConfig(settings.monitor);
                }

                alert('Settings imported successfully! Please refresh the page.');
            } catch (error) {
                console.error('Error importing settings:', error);
                this.showError('Failed to import settings. Invalid file format.');
            }
        };

        reader.readAsText(file);
    },

    // Get application info
    getInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            notificationsEnabled: NotificationManager.isEnabled(),
            monitoringActive: PageMonitor.isMonitoring,
            countdownActive: CountdownTimer.interval !== null
        };
    }
};

// Initialize the application
App.init();

// Make App available globally for debugging
window.TicketingHelper = App;

// Console message
console.log('%cTicketing Helper Tool', 'font-size: 24px; font-weight: bold; color: #4f46e5;');
console.log('%cFor Legal Use Only', 'font-size: 14px; color: #ef4444;');
console.log('%cAll data is stored locally and encrypted', 'font-size: 12px; color: #10b981;');
console.log('\nDebug info: window.TicketingHelper.getInfo()');
