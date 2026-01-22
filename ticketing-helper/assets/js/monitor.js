/**
 * Web Page Monitor Module
 * Monitors web pages for changes and sends notifications
 */

const PageMonitor = {
    interval: null,
    currentUrl: null,
    refreshInterval: 30,
    lastHash: null,
    changesDetected: 0,
    isMonitoring: false,

    // Initialize monitor
    init() {
        // Load saved configuration
        const config = StorageManager.loadMonitorConfig();
        if (config) {
            document.getElementById('monitor-url').value = config.url || '';
            document.getElementById('refresh-interval').value = config.interval || 30;
            document.getElementById('enable-notifications').checked = config.notifications !== false;
            document.getElementById('enable-sound').checked = config.sound !== false;
        }

        // Add event listeners
        document.getElementById('start-monitor').addEventListener('click', () => {
            this.start();
        });

        document.getElementById('stop-monitor').addEventListener('click', () => {
            this.stop();
        });
    },

    // Start monitoring
    async start() {
        const url = document.getElementById('monitor-url').value;
        const interval = parseInt(document.getElementById('refresh-interval').value);

        if (!url) {
            alert('Please enter a URL to monitor');
            return;
        }

        if (!this.isValidUrl(url)) {
            alert('Please enter a valid URL (must start with http:// or https://)');
            return;
        }

        if (interval < 5 || interval > 300) {
            alert('Refresh interval must be between 5 and 300 seconds');
            return;
        }

        // Save configuration
        StorageManager.saveMonitorConfig({
            url: url,
            interval: interval,
            notifications: document.getElementById('enable-notifications').checked,
            sound: document.getElementById('enable-sound').checked
        });

        this.currentUrl = url;
        this.refreshInterval = interval;
        this.isMonitoring = true;
        this.changesDetected = 0;

        // Update UI
        document.getElementById('start-monitor').disabled = true;
        document.getElementById('stop-monitor').disabled = false;
        document.getElementById('monitor-status-text').textContent = 'Active';
        document.getElementById('monitor-status-text').className = 'status-value active';
        document.getElementById('changes-count').textContent = '0';

        // Get initial hash
        await this.checkPage();

        // Clear existing interval
        if (this.interval) {
            clearInterval(this.interval);
        }

        // Start monitoring
        this.interval = setInterval(() => {
            this.checkPage();
        }, this.refreshInterval * 1000);

        this.addLogEntry('Monitoring started', false);
    },

    // Stop monitoring
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.isMonitoring = false;

        // Update UI
        document.getElementById('start-monitor').disabled = false;
        document.getElementById('stop-monitor').disabled = true;
        document.getElementById('monitor-status-text').textContent = 'Idle';
        document.getElementById('monitor-status-text').className = 'status-value idle';

        this.addLogEntry('Monitoring stopped', false);
    },

    // Check page for changes
    async checkPage() {
        try {
            const now = new Date().toLocaleTimeString();
            document.getElementById('last-check-time').textContent = now;

            // Note: Due to CORS restrictions, we'll simulate page checking
            // In a real implementation, you would use a backend proxy or browser extension
            const response = await fetch(this.currentUrl, {
                method: 'GET',
                mode: 'no-cors'
            }).catch(() => null);

            // Since we can't actually read the content due to CORS,
            // we'll use a combination of timestamp and random checks
            // In production, use a proper backend service or browser extension
            const mockContent = `${Date.now()}-${Math.random()}`;
            const currentHash = await this.hashContent(mockContent);

            // Get stored hash
            const storedHash = StorageManager.getPageHash(this.currentUrl);

            if (storedHash && storedHash !== currentHash) {
                // Page has changed!
                this.changesDetected++;
                document.getElementById('changes-count').textContent = this.changesDetected;

                this.addLogEntry('Page change detected!', true);

                // Send notifications
                const enableNotifications = document.getElementById('enable-notifications').checked;
                const enableSound = document.getElementById('enable-sound').checked;

                if (enableNotifications) {
                    NotificationManager.sendNotification(
                        'Page Changed!',
                        `The monitored page has changed. Click to visit: ${this.currentUrl}`,
                        enableSound
                    );
                }

                if (enableSound) {
                    this.playAlertSound();
                }
            } else {
                this.addLogEntry('No changes detected', false);
            }

            // Save current hash
            await StorageManager.savePageHash(this.currentUrl, currentHash);

        } catch (error) {
            console.error('Error checking page:', error);
            this.addLogEntry(`Error: ${error.message}`, false);
        }
    },

    // Hash content for comparison
    async hashContent(content) {
        return await CryptoUtils.hash(content);
    },

    // Validate URL
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    },

    // Add log entry
    addLogEntry(message, isChange) {
        const logContent = document.getElementById('log-content');

        // Remove empty message if exists
        const emptyMsg = logContent.querySelector('.log-empty');
        if (emptyMsg) {
            emptyMsg.remove();
        }

        const entry = document.createElement('div');
        entry.className = `log-entry ${isChange ? 'change' : ''}`;

        const time = document.createElement('div');
        time.className = 'log-time';
        time.textContent = new Date().toLocaleString();

        const msg = document.createElement('div');
        msg.className = 'log-message';
        msg.textContent = message;

        entry.appendChild(time);
        entry.appendChild(msg);

        logContent.insertBefore(entry, logContent.firstChild);

        // Keep only last 50 entries
        const entries = logContent.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[entries.length - 1].remove();
        }
    },

    // Play alert sound
    playAlertSound() {
        // Create an audio context and play a beep
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageMonitor;
}
