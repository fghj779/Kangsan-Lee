/**
 * Connection Speed Tester Module
 * Tests network latency and provides optimization suggestions
 */

const SpeedTester = {
    // Initialize speed tester
    init() {
        document.getElementById('test-speed').addEventListener('click', () => {
            this.runTest();
        });
    },

    // Run speed test
    async runTest() {
        const testUrl = document.getElementById('test-url').value;

        if (!testUrl) {
            alert('Please enter a URL to test');
            return;
        }

        if (!this.isValidUrl(testUrl)) {
            alert('Please enter a valid URL (must start with http:// or https://)');
            return;
        }

        // Disable button during test
        const testButton = document.getElementById('test-speed');
        testButton.disabled = true;
        testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

        try {
            // Run multiple tests for accuracy
            const latencies = [];
            const testCount = 5;

            for (let i = 0; i < testCount; i++) {
                const latency = await this.measureLatency(testUrl);
                if (latency !== null) {
                    latencies.push(latency);
                }

                // Small delay between tests
                await this.sleep(200);
            }

            if (latencies.length === 0) {
                throw new Error('Unable to measure latency. The server might block CORS requests.');
            }

            // Calculate average latency
            const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

            // Determine connection quality
            const quality = this.getQuality(avgLatency);

            // Update display
            this.displayResults(avgLatency, quality);

            // Save to history
            StorageManager.saveSpeedHistory({
                url: testUrl,
                latency: avgLatency,
                quality: quality.level
            });

            // Generate suggestions
            this.generateSuggestions(avgLatency, quality);

        } catch (error) {
            console.error('Speed test error:', error);
            alert(`Speed test failed: ${error.message}`);

            // Show CORS warning message
            this.showCorsWarning();
        } finally {
            testButton.disabled = false;
            testButton.innerHTML = '<i class="fas fa-bolt"></i> Test Connection';
        }
    },

    // Measure latency to a URL
    async measureLatency(url) {
        try {
            const startTime = performance.now();

            // Add cache-busting parameter
            const testUrl = new URL(url);
            testUrl.searchParams.append('_t', Date.now());

            await fetch(testUrl.toString(), {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });

            const endTime = performance.now();
            return Math.round(endTime - startTime);
        } catch (error) {
            console.error('Latency measurement error:', error);
            return null;
        }
    },

    // Determine connection quality
    getQuality(latency) {
        if (latency < 50) {
            return {
                level: 'excellent',
                text: 'Excellent',
                class: 'quality-excellent',
                description: 'Your connection is very fast and stable'
            };
        } else if (latency < 150) {
            return {
                level: 'good',
                text: 'Good',
                class: 'quality-good',
                description: 'Your connection is fast enough for most purposes'
            };
        } else if (latency < 300) {
            return {
                level: 'fair',
                text: 'Fair',
                class: 'quality-fair',
                description: 'Your connection may experience some delays'
            };
        } else {
            return {
                level: 'poor',
                text: 'Poor',
                class: 'quality-poor',
                description: 'Your connection is slow and may cause issues'
            };
        }
    },

    // Display test results
    displayResults(latency, quality) {
        const latencyValue = document.getElementById('latency-value');
        const qualityValue = document.getElementById('quality-value');

        latencyValue.textContent = `${latency} ms`;
        qualityValue.textContent = quality.text;
        qualityValue.className = `result-value ${quality.class}`;

        // Add animation
        latencyValue.style.animation = 'none';
        setTimeout(() => {
            latencyValue.style.animation = 'pulse 1s ease-in-out';
        }, 10);
    },

    // Generate optimization suggestions
    generateSuggestions(latency, quality) {
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = '';

        const suggestions = [];

        // Quality-based suggestions
        if (quality.level === 'excellent') {
            suggestions.push('Your connection is optimal for ticket purchasing');
            suggestions.push('Consider keeping other bandwidth-heavy applications closed during purchase');
            suggestions.push('Use a wired connection if possible for maximum stability');
        } else if (quality.level === 'good') {
            suggestions.push('Your connection is good, but could be improved');
            suggestions.push('Close unnecessary browser tabs and applications');
            suggestions.push('Disable auto-updates during ticket purchase window');
            suggestions.push('Consider using a wired Ethernet connection instead of WiFi');
        } else if (quality.level === 'fair') {
            suggestions.push('Your connection may cause delays. Consider improvements:');
            suggestions.push('Switch to a wired Ethernet connection if available');
            suggestions.push('Move closer to your WiFi router if using wireless');
            suggestions.push('Close all other applications and browser tabs');
            suggestions.push('Disable streaming services, downloads, and cloud syncing');
            suggestions.push('Ask others on your network to pause their usage');
        } else {
            suggestions.push('Your connection is slow. Immediate improvements recommended:');
            suggestions.push('Use a wired Ethernet connection instead of WiFi');
            suggestions.push('Restart your router and modem');
            suggestions.push('Close ALL other applications and browser tabs');
            suggestions.push('Disable all background applications and cloud services');
            suggestions.push('Ask others on your network to stop using the internet');
            suggestions.push('Consider using mobile hotspot if available');
            suggestions.push('Contact your ISP if problems persist');
        }

        // General suggestions
        suggestions.push('Clear browser cache and cookies before purchasing');
        suggestions.push('Have your payment information ready and saved in the browser');
        suggestions.push('Test the ticketing website beforehand to ensure login works');

        // Create list items
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });
    },

    // Show CORS warning
    showCorsWarning() {
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = `
            <li><strong>Note:</strong> Due to browser security restrictions (CORS),
            direct speed testing may not work for all websites.</li>
            <li>For accurate results, use the network tab in your browser's developer tools
            to check actual page load times.</li>
            <li>This tool provides an estimate based on connection timing.</li>
        `;
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

    // Sleep helper
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpeedTester;
}
