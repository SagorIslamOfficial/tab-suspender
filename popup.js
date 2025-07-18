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
// popup.js
// Handles popup UI logic for Tab Suspender extension

const tabsList = document.getElementById('tabs-list');
const memoryBar = document.getElementById('memory-bar');
const memoryValue = document.getElementById('memory-value');
const autoStatus = document.getElementById('auto-status');

// Placeholder: auto-suspension is always on for now
let autoSuspension = true;

function setMemoryUsage(used = 0, total = 100) {
  // Placeholder: random value for now
  const percent = Math.round((used / total) * 100);
  memoryBar.style.width = percent + '%';
  memoryValue.textContent = percent + '%';
}

function getTabStatus(tab, whitelist) {
  if (tab.pinned) return { label: 'Pinned', class: 'status-pinned' };
  if (tab.url && tab.url.startsWith(chrome.runtime.getURL('suspended.html'))) return { label: 'Suspended', class: 'status-suspended' };
  if (whitelist.some(pattern => tab.url.includes(pattern))) return { label: 'Whitelisted', class: 'status-whitelisted' };
  if (tab.active) return { label: 'Active', class: 'status-active' };
  return { label: 'Idle', class: 'status-idle' };
}

function renderTabs(tabs, whitelist) {
  tabsList.innerHTML = '';
  if (!tabs.length) {
    tabsList.innerHTML = '<li><em>No open tabs found.</em></li>';
    return;
  }
  tabs.forEach(tab => {
    const li = document.createElement('li');
    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tab.title || tab.url;
    li.appendChild(title);
    const status = getTabStatus(tab, whitelist);
    const badge = document.createElement('span');
    badge.className = 'tab-status ' + status.class;
    badge.textContent = status.label;
    li.appendChild(badge);
    tabsList.appendChild(li);
  });
}

function loadTabsAndRender() {
  chrome.storage.local.get(['whitelist'], result => {
    const whitelist = result.whitelist || [];
    chrome.tabs.query({}, tabs => {
      renderTabs(tabs, whitelist);
    });
  });
}

function suspendAllTabs() {
  chrome.storage.local.get(['whitelist'], result => {
    const whitelist = result.whitelist || [];
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        if (
          tab.active ||
          tab.pinned ||
          (tab.url && tab.url.startsWith(chrome.runtime.getURL('suspended.html')))
        ) return;
        if (whitelist.some(pattern => tab.url.includes(pattern))) return;
        // Suspend tab
        const suspendUrl = chrome.runtime.getURL('suspended.html') + '?url=' + encodeURIComponent(tab.url);
        chrome.tabs.update(tab.id, { url: suspendUrl });
      });
      setTimeout(loadTabsAndRender, 500);
    });
  });
}

function restoreAllTabs() {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.startsWith(chrome.runtime.getURL('suspended.html'))) {
        // Extract original URL from query param
        const urlParams = new URLSearchParams(tab.url.split('?')[1]);
        const originalUrl = urlParams.get('url');
        if (originalUrl) {
          chrome.tabs.update(tab.id, { url: originalUrl });
        }
      }
    });
    setTimeout(loadTabsAndRender, 500);
  });
}

function setAutoSuspensionState(state) {
  chrome.storage.local.set({ autoSuspension: state });
  autoSuspension = state;
  autoStatus.textContent = autoSuspension ? 'On' : 'Off';
}

// Load auto-suspension state on popup open
chrome.storage.local.get(['autoSuspension'], result => {
  if (typeof result.autoSuspension === 'boolean') {
    autoSuspension = result.autoSuspension;
    autoStatus.textContent = autoSuspension ? 'On' : 'Off';
  }
});

document.getElementById('suspend-all-btn').onclick = suspendAllTabs;
document.getElementById('restore-all-btn').onclick = restoreAllTabs;
document.getElementById('toggle-auto-btn').onclick = () => {
  setAutoSuspensionState(!autoSuspension);
};

// Initial load
setMemoryUsage(Math.random() * 80 + 10, 100); // Placeholder
loadTabsAndRender(); 