const SELECTORS = {
    likeDislikeButtons: ".YtSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper",
    comments: ".style-scope ytd-comments",
    rightSideBar: ".style-scope ytd-watch-next-secondary-results-renderer",
    NotificationButton: ".yt-spec-icon-badge-shape__icon",
    create: ".ytd-topbar-menu-button-renderer button[aria-label= Create]",
    short: ".ytd-guide-entry-renderer[title= Shorts]",
    likedVideo: ".ytd-guide-entry-renderer[title='Liked videos']",
    subscriptons: ".ytd-guide-entry-renderer[title='Subscriptions']", 
    moreFromYouTubeTitle: "yt-formatted-string#guide-section-title[link-inherit-color][class='style-scope ytd-guide-section-renderer']", 
    youtubePremiumButton: "a#endpoint[href='/premium'][title='YouTube Premium']", 
    youtubeStudioButton: "a#endpoint[href='https://studio.youtube.com/'][title='YouTube Studio']", 
    youtubeMusicButton: "a[href='https://music.youtube.com/']", 
    youtubeKidsButton: "a[href*='youtubekids']",
    exploreTrendingButton: "a[href='/feed/trending?bp=6gQJRkVleHBsb3Jl']",
    shoppingButton: "a[title='Shopping']",
    musicButton: "a[title='Music']",
    flims: "a[title='Films']",
    live: "a[title='Live']",
    gaming: "a[title='Gaming']",
    news: "a[title='News']",
    sport: "a[title='Sport']",
    course: "a[title= 'Courses']",
    fasion: "a[title= 'Fashion & beauty']",
    podcasts: "a[title= 'Podcasts']",
    shorts: "a[title='Shorts']",
    subscriptonsHome: "a[title='Subscriptions']",
    bar:"#scroll-container",
    homeFeed: "#contents.ytd-rich-grid-renderer", // Specifically target home page feed
};

let observer = null;
let isInitialized = false;

function hideHomeFeed() {
    try {
        const elements = document.querySelectorAll(SELECTORS.homeFeed);
        elements.forEach(element => {
            if (element) element.style.display = 'none';
        });
    } catch (error) {
        console.error('Error hiding home feed:', error);
    }
}

function showHomeFeed() {
    try {
        const elements = document.querySelectorAll(SELECTORS.homeFeed);
        elements.forEach(element => {
            if (element) element.style.display = '';
        });
    } catch (error) {
        console.error('Error showing home feed:', error);
    }
}

function hideElements() {
    try {
        for (const [key, selector] of Object.entries(SELECTORS)) {
            if (key !== 'homeFeed') { // Exclude home feed selector
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) element.style.display = 'none';
                });
            }
        }
    } catch (error) {
        console.error('Error hiding elements:', error);
    }
}

function showElements() {
    try {
        for (const [key, selector] of Object.entries(SELECTORS)) {
            if (key !== 'homeFeed') { // Exclude home feed selector
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) element.style.display = '';
                });
            }
        }
    } catch (error) {
        console.error('Error showing elements:', error);
    }
}

function handleModeChange(mode) {
    try {
        const currentUrl = window.location.href;
        const isHomePage = currentUrl === "https://www.youtube.com/" || currentUrl === "https://youtube.com/";

        if (mode === 'focus') {
            hideElements();
            if (isHomePage) hideHomeFeed(); // Hide home feed only on home page
        } else {
            showElements();
            if (isHomePage) showHomeFeed(); // Show home feed when not in focus mode
        }
    } catch (error) {
        console.error('Error in handleModeChange:', error);
    }
}

function setupObserver() {
    try {
        if (observer) observer.disconnect();

        observer = new MutationObserver(() => {
            chrome.storage.local.get('mode', (data) => {
                if (chrome.runtime.lastError) {
                    console.error('Storage error:', chrome.runtime.lastError);
                    return;
                }
                const currentMode = data.mode || 'distraction';
                handleModeChange(currentMode);
            });
        });

        const config = {
            childList: true,
            subtree: true,
            attributes: true
        };

        observer.observe(document.body, config);
    } catch (error) {
        console.error('Error in setupObserver:', error);
    }
}

function applyInitialMode() {
    try {
        chrome.storage.local.get('mode', (data) => {
            if (chrome.runtime.lastError) {
                console.error('Storage error:', chrome.runtime.lastError);
                return;
            }
            const currentMode = data.mode || 'distraction';
            handleModeChange(currentMode);
        });
    } catch (error) {
        console.error('Error in applyInitialMode:', error);
    }
}

function initialize() {
    try {
        if (isInitialized) return;
        
        if (!window.location.hostname.includes('youtube.com')) {
            return;
        }

        applyInitialMode();
        setupObserver();
        isInitialized = true;
    } catch (error) {
        console.error('Error in initialize:', error);
        setTimeout(() => {
            isInitialized = false; // Fixed assignment operator
            initialize();
        }, 1000);
    }
}

// Message listener with reconnection logic
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.mode) {
            handleModeChange(request.mode);
            sendResponse({ status: 'success' });
        }
    } catch (error) {
        console.error('Error in message listener:', error);
    }
    return true;
});

// Storage change listener with error handling
chrome.storage.onChanged.addListener((changes, namespace) => {
    try {
        if (namespace === 'local' && changes.mode) {
            handleModeChange(changes.mode.newValue);
        }
    } catch (error) {
        console.error('Error in storage listener:', error);
    }
});

// Initialize with retry mechanism
function initializeWithRetry(retries = 3) {
    try {
        initialize();
    } catch (error) {
        console.error(`Initialization attempt failed. Retries left: ${retries}`);
        if (retries > 0) {
            setTimeout(() => initializeWithRetry(retries - 1), 1000);
        }
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeWithRetry());
} else {
    initializeWithRetry();
}

// URL change detection with error handling
let lastUrl = location.href;
new MutationObserver(() => {
    try {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            if (currentUrl.includes('youtube.com')) {
                isInitialized = false;
                initialize();
            }
        }
    } catch (error) {
        console.error('Error in URL observer:', error);
    }
}).observe(document, { subtree: true, childList: true });
