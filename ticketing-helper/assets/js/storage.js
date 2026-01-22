/**
 * Storage Manager for Ticketing Helper
 * Handles all local storage operations with encryption
 */

const StorageManager = {
    // Keys for different data types
    KEYS: {
        CREDENTIALS: 'th_credentials',
        MONITOR_CONFIG: 'th_monitor_config',
        COUNTDOWN_CONFIG: 'th_countdown_config',
        SPEED_HISTORY: 'th_speed_history',
        PAGE_HASHES: 'th_page_hashes'
    },

    // Save encrypted credentials
    async saveCredentials(credentials) {
        try {
            const encrypted = await CryptoUtils.encrypt(credentials);
            localStorage.setItem(this.KEYS.CREDENTIALS, encrypted);
            return true;
        } catch (error) {
            console.error('Failed to save credentials:', error);
            return false;
        }
    },

    // Load encrypted credentials
    async loadCredentials() {
        try {
            const encrypted = localStorage.getItem(this.KEYS.CREDENTIALS);
            if (!encrypted) return [];
            return await CryptoUtils.decrypt(encrypted);
        } catch (error) {
            console.error('Failed to load credentials:', error);
            return [];
        }
    },

    // Add a new credential
    async addCredential(website, username, password) {
        const credentials = await this.loadCredentials();

        // Check if credential already exists
        const existingIndex = credentials.findIndex(c => c.website === website);

        const newCredential = {
            id: Date.now().toString(),
            website,
            username,
            password,
            createdAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            credentials[existingIndex] = newCredential;
        } else {
            credentials.push(newCredential);
        }

        return await this.saveCredentials(credentials);
    },

    // Remove a credential
    async removeCredential(website) {
        const credentials = await this.loadCredentials();
        const filtered = credentials.filter(c => c.website !== website);
        return await this.saveCredentials(filtered);
    },

    // Clear all credentials
    async clearCredentials() {
        localStorage.removeItem(this.KEYS.CREDENTIALS);
        return true;
    },

    // Save monitor configuration
    saveMonitorConfig(config) {
        try {
            localStorage.setItem(this.KEYS.MONITOR_CONFIG, JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Failed to save monitor config:', error);
            return false;
        }
    },

    // Load monitor configuration
    loadMonitorConfig() {
        try {
            const config = localStorage.getItem(this.KEYS.MONITOR_CONFIG);
            return config ? JSON.parse(config) : null;
        } catch (error) {
            console.error('Failed to load monitor config:', error);
            return null;
        }
    },

    // Save countdown configuration
    saveCountdownConfig(config) {
        try {
            localStorage.setItem(this.KEYS.COUNTDOWN_CONFIG, JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Failed to save countdown config:', error);
            return false;
        }
    },

    // Load countdown configuration
    loadCountdownConfig() {
        try {
            const config = localStorage.getItem(this.KEYS.COUNTDOWN_CONFIG);
            return config ? JSON.parse(config) : null;
        } catch (error) {
            console.error('Failed to load countdown config:', error);
            return null;
        }
    },

    // Save speed test history
    saveSpeedHistory(result) {
        try {
            let history = this.loadSpeedHistory();
            history.push({
                ...result,
                timestamp: new Date().toISOString()
            });

            // Keep only last 50 results
            if (history.length > 50) {
                history = history.slice(-50);
            }

            localStorage.setItem(this.KEYS.SPEED_HISTORY, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Failed to save speed history:', error);
            return false;
        }
    },

    // Load speed test history
    loadSpeedHistory() {
        try {
            const history = localStorage.getItem(this.KEYS.SPEED_HISTORY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load speed history:', error);
            return [];
        }
    },

    // Save page hash for change detection
    async savePageHash(url, hash) {
        try {
            let hashes = this.loadPageHashes();
            hashes[url] = hash;
            localStorage.setItem(this.KEYS.PAGE_HASHES, JSON.stringify(hashes));
            return true;
        } catch (error) {
            console.error('Failed to save page hash:', error);
            return false;
        }
    },

    // Load page hashes
    loadPageHashes() {
        try {
            const hashes = localStorage.getItem(this.KEYS.PAGE_HASHES);
            return hashes ? JSON.parse(hashes) : {};
        } catch (error) {
            console.error('Failed to load page hashes:', error);
            return {};
        }
    },

    // Get page hash
    getPageHash(url) {
        const hashes = this.loadPageHashes();
        return hashes[url] || null;
    },

    // Clear all data
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        localStorage.removeItem('device-id');
        return true;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
