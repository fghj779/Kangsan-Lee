/**
 * Auto-Login Helper Module
 * Manages encrypted login credentials and provides quick access
 */

const AutoLoginHelper = {
    // Initialize auto-login helper
    async init() {
        // Load and display saved credentials
        await this.loadSavedLogins();

        // Add event listeners
        document.getElementById('save-credentials').addEventListener('click', () => {
            this.saveCredentials();
        });

        document.getElementById('clear-credentials').addEventListener('click', () => {
            this.clearAllCredentials();
        });
    },

    // Save credentials
    async saveCredentials() {
        const website = document.getElementById('login-website').value;
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!website || !username || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (!this.isValidUrl(website)) {
            alert('Please enter a valid website URL (must start with http:// or https://)');
            return;
        }

        // Save to storage
        const success = await StorageManager.addCredential(website, username, password);

        if (success) {
            alert('Credentials saved successfully!');

            // Clear form
            document.getElementById('login-website').value = '';
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';

            // Reload saved logins
            await this.loadSavedLogins();
        } else {
            alert('Failed to save credentials. Please try again.');
        }
    },

    // Load saved logins
    async loadSavedLogins() {
        const credentials = await StorageManager.loadCredentials();
        const loginsList = document.getElementById('saved-logins-list');

        if (credentials.length === 0) {
            loginsList.innerHTML = '<p class="logins-empty">No saved credentials yet.</p>';
            return;
        }

        loginsList.innerHTML = '';

        credentials.forEach(cred => {
            const loginItem = document.createElement('div');
            loginItem.className = 'login-item';

            const info = document.createElement('div');
            info.className = 'login-item-info';

            const site = document.createElement('div');
            site.className = 'login-site';
            site.textContent = this.formatUrl(cred.website);

            const user = document.createElement('div');
            user.className = 'login-username';
            user.textContent = cred.username;

            info.appendChild(site);
            info.appendChild(user);

            const actions = document.createElement('div');
            actions.className = 'login-item-actions';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-info btn-sm';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.onclick = () => this.copyCredentials(cred);

            const openBtn = document.createElement('button');
            openBtn.className = 'btn btn-success btn-sm';
            openBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Open';
            openBtn.onclick = () => this.openWebsite(cred.website);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = () => this.deleteCredential(cred.website);

            actions.appendChild(copyBtn);
            actions.appendChild(openBtn);
            actions.appendChild(deleteBtn);

            loginItem.appendChild(info);
            loginItem.appendChild(actions);

            loginsList.appendChild(loginItem);
        });
    },

    // Copy credentials to clipboard
    async copyCredentials(cred) {
        try {
            const text = `Website: ${cred.website}\nUsername: ${cred.username}\nPassword: ${cred.password}`;
            await navigator.clipboard.writeText(text);

            // Show temporary success message
            const btn = event.target.closest('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Copy error:', error);
            alert('Failed to copy credentials. Please try manually.');
        }
    },

    // Open website in new tab
    openWebsite(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    },

    // Delete credential
    async deleteCredential(website) {
        if (!confirm(`Are you sure you want to delete credentials for ${this.formatUrl(website)}?`)) {
            return;
        }

        const success = await StorageManager.removeCredential(website);

        if (success) {
            await this.loadSavedLogins();
        } else {
            alert('Failed to delete credentials. Please try again.');
        }
    },

    // Clear all credentials
    async clearAllCredentials() {
        if (!confirm('Are you sure you want to delete ALL saved credentials? This cannot be undone.')) {
            return;
        }

        const success = await StorageManager.clearCredentials();

        if (success) {
            alert('All credentials have been deleted.');
            await this.loadSavedLogins();
        } else {
            alert('Failed to clear credentials. Please try again.');
        }
    },

    // Format URL for display
    formatUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url;
        }
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

    // Generate password (helper function)
    generatePassword(length = 16) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        let password = '';
        const values = new Uint32Array(length);
        crypto.getRandomValues(values);

        for (let i = 0; i < length; i++) {
            password += charset[values[i] % charset.length];
        }

        return password;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoLoginHelper;
}
