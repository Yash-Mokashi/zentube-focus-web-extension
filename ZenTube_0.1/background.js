// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        // Handle the message as necessary
        if (message.mode) {
            chrome.storage.local.set({ mode: message.mode }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Storage error:', chrome.runtime.lastError);
                }
            });
            sendResponse({ status: 'success' });
        }
    } catch (error) {
        console.error('Error handling message in background.js:', error);
    }
    return true; // Indicates asynchronous response
});

// Initialization logic if needed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ mode: 'distraction' });
});
