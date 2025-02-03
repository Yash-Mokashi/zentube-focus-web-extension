const distractionButton = document.getElementById('distraction');
const focusButton = document.getElementById('focus');
const iconsContainer = document.querySelector('.icons');
const mainContainer = document.querySelector('.main');

function setMode(mode) {
    try {
        if (mode === 'distraction') {
            distractionButton.classList.add('active');
            focusButton.classList.remove('active');
            iconsContainer.classList.add('distraction');
            iconsContainer.classList.remove('focus');
            mainContainer.classList.add('distraction');
            mainContainer.classList.remove('focus');
        } else if (mode === 'focus') {
            focusButton.classList.add('active');
            distractionButton.classList.remove('active');
            iconsContainer.classList.add('focus');
            iconsContainer.classList.remove('distraction');
            mainContainer.classList.add('focus');
            mainContainer.classList.remove('distraction');
        }
        
        // Send message to all YouTube tabs, not just active one
        sendMessageToAllYoutubeTabs(mode);
    } catch (error) {
        console.error('Error in setMode:', error);
    }
}

function sendMessageToAllYoutubeTabs(mode) {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
        tabs.forEach(tab => {
            try {
                chrome.tabs.sendMessage(tab.id, { mode }, (response) => {
                    if (chrome.runtime.lastError) {
                        // If content script isn't ready, inject it
                        if (chrome.runtime.lastError.message.includes("Receiving end does not exist")) {
                            chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                files: ['contentScript.js']
                            }).then(() => {
                                // Retry sending message after injection
                                chrome.tabs.sendMessage(tab.id, { mode });
                            }).catch(err => console.error('Script injection error:', err));
                        }
                    }
                });
            } catch (error) {
                console.error('Error sending message to tab:', error);
            }
        });
    });
}

// Event listeners with error handling
distractionButton.addEventListener('click', () => {
    try {
        chrome.storage.local.set({ 'mode': 'distraction' }, () => {
            if (chrome.runtime.lastError) {
                console.error('Storage error:', chrome.runtime.lastError);
                return;
            }
            setMode('distraction');
        });
    } catch (error) {
        console.error('Error in distraction button click:', error);
    }
});

focusButton.addEventListener('click', () => {
    try {
        chrome.storage.local.set({ 'mode': 'focus' }, () => {
            if (chrome.runtime.lastError) {
                console.error('Storage error:', chrome.runtime.lastError);
                return;
            }
            setMode('focus');
        });
    } catch (error) {
        console.error('Error in focus button click:', error);
    }
});

// Initialize with error handling
try {
    chrome.storage.local.get('mode', (data) => {
        if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
            return;
        }
        const savedMode = data.mode || 'distraction';
        setMode(savedMode);
    });
} catch (error) {
    console.error('Error in initialization:', error);
}
