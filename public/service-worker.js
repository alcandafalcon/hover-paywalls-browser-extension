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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname.replace(/^www\./, '');
        const { cookieWhitelist = [] } = await chrome.storage.local.get("cookieWhitelist");

        if (paywallCookieBlocklist.some(site => domain.includes(site)) && !cookieWhitelist.includes(domain)) {
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

// Helper to get the current active tab
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// Helper to get root domain from a URL
function getRootDomain(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
        return '';
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        if (request.command === "getPopupState") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);

            const { paywallSettings = {} } = await chrome.storage.local.get("paywallSettings");
            const { adblockWhitelist = [] } = await chrome.storage.local.get("adblockWhitelist");
            const { cookieWhitelist = [] } = await chrome.storage.local.get("cookieWhitelist");
            const { spoofWhitelist = [] } = await chrome.storage.local.get("spoofWhitelist");
            const { smWhitelist = [] } = await chrome.storage.local.get("smWhitelist");
            const { blockedCount = 0 } = await chrome.storage.local.get("blockedCount");

            const paywallEnabled = paywallSettings[domain] !== false; // enabled by default
            const adblockEnabled = !adblockWhitelist.includes(domain);
            const paywallInCookieWhitelist = cookieWhitelist.includes(domain);
            const paywallInSpoofWhitelist = spoofWhitelist.includes(domain);
            const paywallInSMWhitelist = smWhitelist.includes(domain);

            sendResponse({
                blockedCount,
                paywallInCookieWhitelist,
                paywallInSpoofWhitelist,
                paywallInSMWhitelist,
                paywallEnabled,
                adblockEnabled
            });
        } else if (request.command === "enablePaywall") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { paywallSettings = {} } = await chrome.storage.local.get("paywallSettings");
            paywallSettings[domain] = true;
            await chrome.storage.local.set({ paywallSettings });
            sendResponse({ success: true });
        } else if (request.command === "disablePaywall") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { paywallSettings = {} } = await chrome.storage.local.get("paywallSettings");
            paywallSettings[domain] = false;
            await chrome.storage.local.set({ paywallSettings });
            sendResponse({ success: true });
        } else if (request.command === "addToPaywallSpoofWhitelist") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { spoofWhitelist = [] } = await chrome.storage.local.get("spoofWhitelist");
            if (!spoofWhitelist.includes(domain)) {
                spoofWhitelist.push(domain);
                await chrome.storage.local.set({ spoofWhitelist });
            }
            sendResponse({ success: true });
        } else if (request.command === "removeFromPaywallSpoofWhitelist") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { spoofWhitelist = [] } = await chrome.storage.local.get("spoofWhitelist");
            const index = spoofWhitelist.indexOf(domain);
            if (index > -1) {
                spoofWhitelist.splice(index, 1);
                await chrome.storage.local.set({ spoofWhitelist });
            }
            sendResponse({ success: true });
        } else if (request.command === "addToPaywallSMWhitelist") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { smWhitelist = [] } = await chrome.storage.local.get("smWhitelist");
            if (!smWhitelist.includes(domain)) {
                smWhitelist.push(domain);
                await chrome.storage.local.set({ smWhitelist });
            }
            sendResponse({ success: true });
        } else if (request.command === "removeFromPaywallSMWhitelist") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { smWhitelist = [] } = await chrome.storage.local.get("smWhitelist");
            const index = smWhitelist.indexOf(domain);
            if (index > -1) {
                smWhitelist.splice(index, 1);
                await chrome.storage.local.set({ smWhitelist });
            }
            sendResponse({ success: true });
        } else if (request.command === "addToPaywallCookieWhitelist") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { cookieWhitelist = [] } = await chrome.storage.local.get("cookieWhitelist");
            if (!cookieWhitelist.includes(domain)) {
                cookieWhitelist.push(domain);
                await chrome.storage.local.set({ cookieWhitelist });
            }
            sendResponse({ success: true });
        } else if (request.command === "removeFromPaywallCookieWhitelist") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { cookieWhitelist = [] } = await chrome.storage.local.get("cookieWhitelist");
            const index = cookieWhitelist.indexOf(domain);
            if (index > -1) {
                cookieWhitelist.splice(index, 1);
                await chrome.storage.local.set({ cookieWhitelist });
            }
            sendResponse({ success: true });
        } else if (request.command === "addToAdblockWhitelist") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { adblockWhitelist = [] } = await chrome.storage.local.get("adblockWhitelist");
            if (!adblockWhitelist.includes(domain)) {
                adblockWhitelist.push(domain);
                await chrome.storage.local.set({ adblockWhitelist });
            }
            sendResponse({ success: true });
        } else if (request.command === "removeFromAdblockWhitelist") {
            const tab = await getCurrentTab();
            const domain = getRootDomain(tab.url);
            let { adblockWhitelist = [] } = await chrome.storage.local.get("adblockWhitelist");
            const index = adblockWhitelist.indexOf(domain);
            if (index > -1) {
                adblockWhitelist.splice(index, 1);
                await chrome.storage.local.set({ adblockWhitelist });
            }
            sendResponse({ success: true });
        }
    })();
    return true; // Indicates that the response is sent asynchronously
});
