/*
  Name: Muhammad Alamin Islam (Sagor)
  GitHub: https://github.com/SagorIslamOfficial
  Website: https://sagorislam.dev
  LinkedIn: https://www.linkedin.com/in/sagorislamofficial/
  Company: ThemeXpert
  Available: Open to work, projects, and collaborations worldwide
  Contact: alaminislam1274@gmail.com | sagor_islam@icloud.com

  About me:
  Full-Stack Web Developer with expertise in Laravel, WordPress, and modern web technologies. Passionate about building scalable solutions, learning new technologies, and contributing to open source. Based in Dhaka, Bangladesh, and always eager to collaborate on innovative projects.
*/
// background.js
// Main background service worker for Tab Suspender extension

const INACTIVITY_MINUTES = 30;
const CHECK_INTERVAL_MINUTES = 5;

// In-memory map: tabId -> lastActive timestamp (ms)
let tabActivity = {};

// Load tabActivity from storage on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['tabActivity'], result => {
    tabActivity = result.tabActivity || {};
  });
});
// Also load on service worker load
chrome.storage.local.get(['tabActivity'], result => {
  tabActivity = result.tabActivity || {};
});

function saveTabActivity() {
  chrome.storage.local.set({ tabActivity });
}

// Listen for tab activation
chrome.tabs.onActivated.addListener(activeInfo => {
  tabActivity[activeInfo.tabId] = Date.now();
  saveTabActivity();
});

// Listen for tab updates (navigation, reload, etc.)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    tabActivity[tabId] = Date.now();
    saveTabActivity();
  }
});

// Listen for tab removal (cleanup)
chrome.tabs.onRemoved.addListener(tabId => {
  delete tabActivity[tabId];
  saveTabActivity();
});

// Listen for messages from content scripts to set form activity flag
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setFormActive' && sender.tab && sender.tab.id !== undefined) {
    const key = `formActive_${sender.tab.id}`;
    chrome.storage.local.set({ [key]: message.active });
  }
});

// Set up periodic alarm
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('checkInactiveTabs', { periodInMinutes: CHECK_INTERVAL_MINUTES });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'checkInactiveTabs') {
    checkAndLogInactiveTabs();
  }
});

function isWhitelisted(url, whitelist) {
  if (!Array.isArray(whitelist)) return false;
  return whitelist.some(pattern => {
    try {
      // Simple domain match
      if (url.includes(pattern)) return true;
      // If pattern is a valid regex, try regex match
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        const regex = new RegExp(pattern.slice(1, -1));
        return regex.test(url);
      }
    } catch (e) {}
    return false;
  });
}

function getDomainFromUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return '';
  }
}

function checkAndLogInactiveTabs() {
  const now = Date.now();
  chrome.tabs.query({ audible: false, discarded: false }, tabs => {
    chrome.storage.local.get(['whitelist', 'perDomainTimers'], result => {
      const whitelist = result.whitelist || [];
      const perDomainTimers = result.perDomainTimers || {};
      tabs.forEach(tab => {
        const lastActive = tabActivity[tab.id] || now;
        const domain = getDomainFromUrl(tab.url);
        const customTimeout = perDomainTimers[domain];
        const timeoutMinutes = customTimeout || INACTIVITY_MINUTES;
        const inactiveMinutes = (now - lastActive) / 60000;
        // Skip if already on the suspension page
        if (tab.url && tab.url.startsWith(chrome.runtime.getURL('suspended.html'))) {
          return;
        }
        // Skip pinned tabs
        if (tab.pinned) {
          return;
        }
        // Check for form input activity (flag set by content script)
        chrome.storage.local.get([`formActive_${tab.id}`], result2 => {
          if (result2[`formActive_${tab.id}`]) {
            // Form input is active, skip suspension
            return;
          }
          // Whitelist check
          if (isWhitelisted(tab.url, whitelist)) {
            return;
          }
          if (inactiveMinutes >= timeoutMinutes) {
            console.log(`[Tab Suspender] Suspending tab: ${tab.id} (${tab.title})`);
            const suspendUrl = chrome.runtime.getURL('suspended.html') + '?url=' + encodeURIComponent(tab.url);
            chrome.tabs.update(tab.id, { url: suspendUrl });
          }
        });
      });
    });
  });
} 