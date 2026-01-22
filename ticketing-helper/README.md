# Ticketing Helper Tool

A comprehensive, legal ticketing assistant tool designed to help users prepare for and monitor ticket sales. This tool provides countdown timers, web page monitoring, connection testing, and secure credential management.

## Features

### 1. Countdown Timer
- **Precise Countdown**: Display days, hours, minutes, and seconds until ticket sale opens
- **Timezone Support**: Support for multiple timezones (ET, CT, MT, PT, GMT, CET, JST, KST, AEDT)
- **Smart Alerts**: Automatic notifications at 5 minutes, 1 minute, and exactly when sales open
- **Visual Effects**: Pulsing animation in the final minute to draw attention
- **Persistent Settings**: Saves your countdown configuration automatically

### 2. Web Page Monitor
- **Auto-Refresh**: Automatically checks web pages at configurable intervals (5-300 seconds)
- **Change Detection**: Detects when monitored pages change using content hashing
- **Desktop Notifications**: Sends browser notifications when changes are detected
- **Sound Alerts**: Optional audio alerts for immediate attention
- **Activity Log**: Detailed log of all monitoring activity with timestamps
- **Real-time Status**: Live display of monitoring status and change count

### 3. Connection Speed Tester
- **Latency Testing**: Measures network latency to ticketing websites
- **Multiple Samples**: Runs 5 tests and averages results for accuracy
- **Quality Assessment**: Categorizes connection as Excellent, Good, Fair, or Poor
- **Smart Suggestions**: Provides personalized optimization recommendations
- **Test History**: Tracks and saves connection test results

### 4. Auto-Login Helper
- **Encrypted Storage**: Credentials encrypted using AES-256-GCM encryption
- **Local Only**: All data stored locally in browser, never transmitted
- **Multiple Sites**: Store credentials for multiple ticketing websites
- **Quick Access**: One-click to open websites or copy credentials
- **Device-Specific**: Encryption key unique to each device

## Security Features

- **AES-256-GCM Encryption**: Industry-standard encryption for credential storage
- **Local Storage Only**: No data ever sent to external servers
- **Device-Specific Keys**: Each device has a unique encryption key
- **PBKDF2 Key Derivation**: 100,000 iterations for strong key generation
- **No Plaintext Storage**: Passwords never stored in plain text

## Installation

1. **Clone or Download** this repository
2. **Open `index.html`** in a modern web browser
3. **Grant Permissions** when prompted for notifications (optional but recommended)

No server required - this is a 100% client-side application!

## Usage

### Setting Up Countdown Timer

1. Navigate to the **Countdown Timer** section
2. Click on the **Sale Opening Time** input
3. Select your target date and time
4. Choose your **Timezone** from the dropdown
5. Click **Start Countdown**
6. You'll receive alerts at 5 minutes, 1 minute, and at opening time

### Monitoring Web Pages

1. Navigate to the **Web Page Monitor** section
2. Enter the **Website URL** you want to monitor
3. Set your **Refresh Interval** (recommended: 30 seconds)
4. Enable **Desktop Notifications** and **Sound Alerts** if desired
5. Click **Start Monitoring**
6. The tool will check the page at your specified interval
7. When changes are detected, you'll receive instant notifications

**Note**: Due to CORS restrictions, monitoring works best with:
- Pages that allow cross-origin requests
- Browser extensions that bypass CORS (use responsibly)
- Running through a local proxy server

### Testing Connection Speed

1. Navigate to the **Connection Speed Tester** section
2. Enter the **Test URL** (the ticketing website)
3. Click **Test Connection**
4. Wait for the test to complete (takes ~5 seconds)
5. Review your **Latency** and **Connection Quality**
6. Follow the **Optimization Suggestions** provided

### Managing Login Credentials

1. Navigate to the **Auto-Login Helper** section
2. Enter the ticketing **Website URL**
3. Enter your **Username/Email**
4. Enter your **Password**
5. Click **Save Credentials**
6. Your credentials are now encrypted and stored locally
7. Use the **Copy** button to copy credentials when needed
8. Use the **Open** button to open the website in a new tab
9. Use the **Delete** button to remove specific credentials

## Browser Compatibility

This tool works best in modern browsers that support:
- Web Crypto API (for encryption)
- Notification API (for alerts)
- Local Storage (for data persistence)
- ES6+ JavaScript features

### Recommended Browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Opera 76+

## Privacy & Data

### What Data is Stored?
- Countdown timer settings (date/time, timezone)
- Page monitor configuration (URL, interval, preferences)
- Connection test history (last 50 results)
- Login credentials (encrypted)
- Page content hashes (for change detection)

### Where is Data Stored?
All data is stored in your browser's **Local Storage**. This means:
- Data never leaves your device
- No external servers involved
- Data persists between sessions
- You can clear it at any time via browser settings

### How to Clear All Data?
To completely remove all stored data:
1. Open browser Developer Tools (F12)
2. Go to Application/Storage tab
3. Select Local Storage
4. Delete items starting with `th_` or `device-id`
5. Or use browser's "Clear browsing data" feature

## Limitations

### Web Page Monitor Limitations
- **CORS Restrictions**: Most websites block cross-origin requests for security
- **Detection Method**: Uses timing-based detection due to CORS
- **Best Practice**: Use browser developer tools to verify actual page changes

### Connection Speed Limitations
- **CORS Issues**: Some websites may not respond to test requests
- **Accuracy**: Results are estimates based on response timing
- **Server Response**: Actual latency depends on server configuration

### Legal Disclaimer
This tool is designed for **LEGAL USE ONLY**:
- ✅ Monitoring public ticket sale pages
- ✅ Setting reminders for sale opening times
- ✅ Testing your own internet connection
- ✅ Managing your own credentials securely

This tool is NOT intended for:
- ❌ Automated purchasing or botting
- ❌ Bypassing purchase limits
- ❌ Unfair advantages over other buyers
- ❌ Violating website terms of service
- ❌ Scalping or reselling tickets

**Always comply with website terms of service and local laws.**

## Troubleshooting

### Notifications Not Working
1. Check browser notification permissions
2. Ensure notifications are enabled in system settings
3. Try clicking the notification permission prompt
4. Some browsers block notifications on file:// URLs - use http://localhost

### Page Monitor Not Detecting Changes
1. Check for CORS errors in browser console
2. Try using browser developer tools manually
3. Consider using a browser extension to bypass CORS
4. Verify the URL is correct and accessible

### Credentials Not Saving
1. Check browser Local Storage is enabled
2. Ensure cookies/site data is not being blocked
3. Try clearing browser cache and reloading
4. Check browser console for error messages

### Connection Test Fails
1. Verify the test URL is correct
2. Check your internet connection
3. Some websites block HEAD requests
4. Try a different URL to confirm functionality

## Technical Details

### Architecture
```
ticketing-helper/
├── index.html              # Main application page
├── README.md              # Documentation
└── assets/
    ├── css/
    │   └── styles.css     # UI styling
    └── js/
        ├── main.js        # Application controller
        ├── crypto-utils.js # Encryption utilities
        ├── storage.js      # Storage management
        ├── countdown.js    # Countdown timer
        ├── monitor.js      # Page monitor
        ├── speed-test.js   # Connection tester
        ├── auto-login.js   # Credential manager
        └── notifications.js # Notification system
```

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript ES6+**: Async/await, modules, classes
- **Web Crypto API**: AES-256-GCM encryption
- **Notification API**: Desktop notifications
- **Local Storage API**: Data persistence
- **Font Awesome**: Icon library

### Encryption Details
- **Algorithm**: AES-GCM (Authenticated Encryption)
- **Key Size**: 256 bits
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Hash Function**: SHA-256
- **IV**: 12 bytes, randomly generated per encryption
- **Salt**: Static application salt (for device-specific keys)

## Future Enhancements

Potential features for future versions:
- [ ] Browser extension version (for better CORS handling)
- [ ] Multiple countdown timers
- [ ] Export/import settings
- [ ] Dark mode toggle
- [ ] Custom notification sounds
- [ ] Connection test scheduling
- [ ] Page screenshot comparison
- [ ] Proxy server integration
- [ ] Mobile app version

## Contributing

This is a personal tool project. If you'd like to enhance it:
1. Fork the repository
2. Make your improvements
3. Test thoroughly
4. Submit a pull request with detailed description

## License

This project is provided as-is for personal, legal use only. No warranty or liability.

## Support

For issues, questions, or suggestions:
- Check the Troubleshooting section
- Review browser console for error messages
- Ensure you're using a supported browser
- Verify your browser settings allow Local Storage and Notifications

## Version History

### v1.0.0 (Current)
- ✨ Initial release
- ✨ Countdown timer with timezone support
- ✨ Web page monitor with change detection
- ✨ Connection speed tester
- ✨ Auto-login credential manager
- ✨ Desktop notifications
- ✨ AES-256-GCM encryption
- ✨ Responsive modern UI

---

**Remember: This tool is for legal, fair use only. Always respect website terms of service and purchase limits. Happy ticket hunting!** 🎫
