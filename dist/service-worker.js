/*
 * service-worker.js contains the logic for the extension's service worker.
 * It replaces the background scripts from Manifest V2.
 */

// Listen for the extension being installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed or updated:', details);
    // Here you can add any setup logic that needs to run on installation.
    // For example, initializing storage with default values.
});

// Auto-update logic from the old background script
function handleUpdateAvailable(details) {
    console.log("Update Available: " + details.version);
    // Proceed to upgrade the add-on
    chrome.runtime.reload();
}

chrome.runtime.onUpdateAvailable.addListener(handleUpdateAvailable);

console.log("Service worker started.");

// Note: The ad-blocking and paywall-bypassing logic previously handled by
// background scripts will now be managed by the declarativeNetRequest API
// using the rules defined in rules.json.

// --- Cookie Clearing for Paywalls ---

const paywallCookieBlocklist = [
    "adelaidenow.com.au",
    "baltimoresun.com",
    "barrons.com",
    "bloomberg.com",
    "chicagobusiness.com",
    "chicagotribune.com",
    "chip.de",
    "clarin.com",
    "courant.com",
    "couriermail.com.au",
    "cricketarchive.com",
    "dailypress.com",
    "dailytelegraph.com.au",
    "durangoherald.com",
    "economist.com",
    "fd.nl",
    "forbes.com",
    "ft.com",
    "geelongadvertiser.com.au",
    "glassdoor.com",
    "goldcoastbulletin.com.au",
    "haaretz.co.il",
    "haaretz.com",
    "hbr.org",
    "heraldsun.com.au",
    "inc.com",
    "independent.co.uk",
    "investingdaily.com",
    "irishtimes.com",
    "kansas.com",
    "kansascity.com",
    "latimes.com",
    "lanacion.com.ar",
    "letemps.ch",
    "mcall.com",
    "medscape.com",
    "nationalpost.com",
    "newsweek.com",
    "nikkei.com",
    "nrc.nl",
    "ocregister.com",
    "orlandosentinel.com",
    "scmp.com",
    "seattletimes.com",
    "slashdot.org",
    "smh.com.au",
    "sun-sentinel.com",
    "technologyreview.com",
    "theage.com.au",
    "theaustralian.com.au",
    "thenation.com",
    "thestreet.com",
    "thesundaytimes.co.uk",
    "thetimes.co.uk",
    "washingtonpost.com",
    "wsj.com",
    "wsj.net"
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname.replace(/^www\./, '');

        if (paywallCookieBlocklist.some(site => domain.includes(site))) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: clearCookies,
            });
        }
    }
});

function clearCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
}
